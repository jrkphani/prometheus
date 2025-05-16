import { defineFunction } from '@aws-amplify/backend';

/**
 * Define the proposal generator Lambda function
 * 
 * This Lambda will be connected to a custom GraphQL mutation after deployment.
 * See the documentation in data/resource.ts and backend.ts for details on
 * how to connect this Lambda to the AppSync API.
 * 
 * Important: After deployment, the following permissions are needed:
 * - DynamoDB: Read access to Proposal, ProposalSection, and Question tables and their GSIs
 * - Bedrock: Access to invoke models (when AI generation is implemented)
 * - S3: Write access to store generated documents (when document generation is implemented)
 * 
 * Note: In Amplify Gen 2, permissions and environment variables should be
 * added via CDK escape hatches or through the AWS console after deployment.
 */
export const proposalGeneratorLambda = defineFunction({
  name: 'prometheus-proposalGenerator',
  entry: './functions/proposal-generator-handler.ts'
});

/**
 * Documentation for configuring Lambda permissions after deployment
 * 
 * 1. Update environment variables in AWS Lambda console:
 *    - AMPLIFY_DATA_PROPOSAL_TABLE_NAME
 *    - AMPLIFY_DATA_PROPOSALSECTION_TABLE_NAME
 *    - AMPLIFY_DATA_QUESTION_TABLE_NAME
 *    - AMPLIFY_DATA_PROPOSALSECTION_BYPROPOSALID_INDEX_NAME
 *    - AMPLIFY_DATA_QUESTION_BYPROPOSALSECTIONID_INDEX_NAME
 * 
 * 2. Add DynamoDB permissions in IAM via AWS console:
 *    - dynamodb:GetItem, dynamodb:Query on the following resources:
 *      - Proposal table
 *      - ProposalSection table
 *      - Question table
 *      - ProposalSection table byProposalId index
 *      - Question table byProposalSectionId index
 *      - Question table byProposalId index
 * 
 * 3. Future permissions to add:
 *    - Bedrock: bedrock:InvokeModel on the Bedrock AI models
 *    - S3: s3:PutObject on the S3 bucket for generated documents
 */ 