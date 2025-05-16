import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
// import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime"; // For later

// Define expected types for fetched data
interface Proposal {
  id: string;
  owner: string;
  customProposalId: string;
  projectName: string;
  customerName: string;
  status: string;
  editorContent?: string | null; // JSON string
  createdAt: string;
  updatedAt: string;
}

interface ProposalSection {
  id: string;
  proposalId: string;
  title: string;
  order: number;
  owner: string;
}

interface Question {
  id: string;
  proposalSectionId: string;
  proposalId: string;
  text: string;
  answer?: string | null;
  isMandatory: boolean;
  order: number;
  owner: string;
}

interface FetchedProposalData {
  proposalMetadata: Proposal;
  sectionsWithQuestions: Array<ProposalSection & { questions: Question[] }>;
  mainContent?: any; // Parsed from editorContent JSON string
}

interface GenerateProposalEventArgs {
  arguments: {
    input: {
      proposalId: string;
    };
  };
}

// Initialize DynamoDB Document Client
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

// Environment variables for table names
const PROPOSAL_TABLE_NAME = process.env.AMPLIFY_DATA_PROPOSAL_TABLE_NAME;
const PROPOSAL_SECTION_TABLE_NAME = process.env.AMPLIFY_DATA_PROPOSALSECTION_TABLE_NAME;
const QUESTION_TABLE_NAME = process.env.AMPLIFY_DATA_QUESTION_TABLE_NAME;

// GSI names
const SECTION_BY_PROPOSAL_ID_INDEX_NAME = process.env.AMPLIFY_DATA_PROPOSALSECTION_BYPROPOSALID_INDEX_NAME || 'byProposalId';
const QUESTION_BY_SECTION_ID_INDEX_NAME = process.env.AMPLIFY_DATA_QUESTION_BYPROPOSALSECTIONID_INDEX_NAME || 'byProposalSectionId';

export const handler = async (event: GenerateProposalEventArgs) => {
  console.log('Proposal Generation Lambda invoked with event:', JSON.stringify(event, null, 2));
  const { proposalId } = event.arguments.input;

  if (!proposalId) {
    console.error('Proposal ID is required.');
    return { success: false, message: 'Proposal ID is required.', generatedDocumentUrl: null };
  }

  if (!PROPOSAL_TABLE_NAME || !PROPOSAL_SECTION_TABLE_NAME || !QUESTION_TABLE_NAME) {
    const missingVars = [
        !PROPOSAL_TABLE_NAME && "PROPOSAL_TABLE_NAME",
        !PROPOSAL_SECTION_TABLE_NAME && "PROPOSAL_SECTION_TABLE_NAME",
        !QUESTION_TABLE_NAME && "QUESTION_TABLE_NAME"
    ].filter(Boolean).join(', ');
    console.error(`Configuration error: Missing environment variable(s): ${missingVars}`);
    return { success: false, message: `Configuration error: Missing table name variables: ${missingVars}`, generatedDocumentUrl: null };
  }

  try {
    // 1. Fetch Proposal Metadata
    console.log(`Fetching proposal metadata for ID: ${proposalId} from table ${PROPOSAL_TABLE_NAME}`);
    const proposalResult = await docClient.send(new GetCommand({
      TableName: PROPOSAL_TABLE_NAME,
      Key: { id: proposalId },
    }));

    if (!proposalResult.Item) {
      console.error(`Proposal with ID ${proposalId} not found.`);
      return { success: false, message: `Proposal not found: ${proposalId}`, generatedDocumentUrl: null };
    }
    const proposalMetadata = proposalResult.Item as Proposal;
    console.log('Fetched proposal metadata:', JSON.stringify(proposalMetadata, null, 2));

    // 2. Parse mainContent (editorContent)
    let mainContent: any = null;
    if (proposalMetadata.editorContent) {
      try {
        mainContent = JSON.parse(proposalMetadata.editorContent);
      } catch (e) {
        console.warn('Failed to parse editorContent JSON:', e);
        mainContent = { raw: proposalMetadata.editorContent, parseError: (e as Error).message };
      }
    }

    // 3. Fetch Proposal Sections
    console.log(`Fetching sections for proposal ID: ${proposalId}`);
    const sectionsResult = await docClient.send(new QueryCommand({
      TableName: PROPOSAL_SECTION_TABLE_NAME,
      IndexName: SECTION_BY_PROPOSAL_ID_INDEX_NAME,
      KeyConditionExpression: 'proposalId = :pid',
      ExpressionAttributeValues: { ':pid': proposalId },
    }));
    const sections = (sectionsResult.Items || []) as ProposalSection[];
    sections.sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by order
    console.log(`Fetched ${sections.length} sections.`);

    // 4. Fetch Questions for each Section
    const sectionsWithQuestions: Array<ProposalSection & { questions: Question[] }> = [];
    for (const section of sections) {
      console.log(`Fetching questions for section ID: ${section.id}`);
      const questionsResult = await docClient.send(new QueryCommand({
        TableName: QUESTION_TABLE_NAME,
        IndexName: QUESTION_BY_SECTION_ID_INDEX_NAME,
        KeyConditionExpression: 'proposalSectionId = :sid',
        ExpressionAttributeValues: { ':sid': section.id },
      }));
      const questions = (questionsResult.Items || []) as Question[];
      questions.sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by order
      console.log(`Fetched ${questions.length} questions for section ${section.id}.`);
      sectionsWithQuestions.push({ ...section, questions });
    }

    const aggregatedData: FetchedProposalData = {
      proposalMetadata,
      sectionsWithQuestions,
      mainContent,
    };
    console.log('Successfully aggregated all proposal data.');

    // --- Placeholder for AI Processing & Document Assembly ---
    // This will be replaced with actual AI processing logic in a future implementation
    const prompt = buildAIPrompt(aggregatedData);
    console.log('Constructed prompt (placeholder):', prompt);
    
    const generatedText = `Placeholder AI Content based on: ${aggregatedData.proposalMetadata.projectName}. 
Total sections: ${aggregatedData.sectionsWithQuestions.length}. 
First section: ${aggregatedData.sectionsWithQuestions[0]?.title || 'N/A'}. 
Mandatory questions: ${aggregatedData.sectionsWithQuestions.flatMap(s=>s.questions).filter(q=>q.isMandatory).length}.`;
    
    console.log('AI Generated Text (placeholder):', generatedText);
    const documentUrl = `s3://placeholder-bucket/generated/${proposalId}.pdf`;
    // --- End Placeholder ---

    return {
      success: true,
      message: 'Proposal data fetched and processed (placeholder generation).',
      generatedText: generatedText,
      generatedDocumentUrl: documentUrl,
    };

  } catch (error: any) {
    console.error('Error during proposal data aggregation or generation:', error);
    return {
      success: false,
      message: `Error processing proposal: ${error.message}`,
      generatedDocumentUrl: null,
    };
  }
};

/**
 * Build AI prompt from aggregated proposal data
 * This is a placeholder that will be expanded in future implementations
 */
function buildAIPrompt(data: FetchedProposalData): string {
  // Basic prompt construction - will be more sophisticated in actual implementation
  return `Generate an executive summary for a proposal titled "${data.proposalMetadata.projectName}" 
for customer "${data.proposalMetadata.customerName}".
It has ${data.sectionsWithQuestions.length} sections:
${data.sectionsWithQuestions.map((section, idx) => 
  `${idx + 1}. ${section.title} (${section.questions.length} questions)`
).join('\n')}`;
}

// Placeholder for Bedrock invocation - will be implemented later
/*
async function invokeBedrock(prompt: string): Promise<string> {
  const modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-v2';
  
  const params = {
    modelId: modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
      max_tokens_to_sample: 4000,
      temperature: 0.7,
      top_k: 250,
      top_p: 0.999,
    }),
  };
  
  const command = new InvokeModelCommand(params);
  const response = await bedrockClient.send(command);
  
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  return responseBody.completion || '';
}
*/ 