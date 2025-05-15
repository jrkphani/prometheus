/**
 * Lambda function to generate a custom proposal ID
 * Format: 1CH_CUSTO_ProjectName_DD-mmm-YY
 * 
 * This function will be triggered when a new proposal is created.
 * It accepts a projectName and customerName and returns a formatted proposal ID.
 */

/**
 * Generate a custom proposal ID in the format: 1CH_CUSTO_ProjectName_DD-mmm-YY
 * 
 * @param event - The Lambda event object
 * @returns An object containing the generated proposal ID
 */

// Define the expected structure of the input event from AppSync for a custom query
interface GenerateCustomProposalIdEvent {
  arguments: {
    input: {
      projectName: string;
      customerName: string;
    };
  };
}

// Define the expected return structure for the GraphQL query
interface GenerateCustomProposalIdResponse {
  customProposalId?: string | null;
  error?: string | null;
}

export const handler = async (
  event: GenerateCustomProposalIdEvent
): Promise<GenerateCustomProposalIdResponse> => {
  console.log('Proposal ID Generator called with event:', JSON.stringify(event, null, 2));

  // Ensure 'arguments' and 'input' exist before trying to destructure
  if (!event.arguments || !event.arguments.input) {
    console.error('Invalid event structure: Missing arguments.input');
    return {
      customProposalId: null,
      error: 'Invalid input structure: arguments.input is missing.',
    };
  }

  const { projectName, customerName } = event.arguments.input;

  if (!projectName || !customerName) {
    console.error('Missing required input: projectName or customerName');
    return {
      customProposalId: null,
      error: 'ProjectName and CustomerName are required inputs.',
    };
  }

  try {
    const date = new Date();

    // Sanitize customerName: first 5 chars, uppercase, alphanumeric only
    const customerCode = customerName
      .trim()
      .substring(0, 5)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

    // Sanitize projectName: max 20 chars, alphanumeric, underscore, hyphen
    const sanitizedProjectName = projectName
      .trim()
      .replace(/[^A-Za-z0-9_-]/g, '')
      .substring(0, 20);

    // Format date as DD-mmm-YY (e.g., 15-May-25)
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()]; // getMonth() is 0-indexed
    const year = String(date.getFullYear()).substring(2); // Get last two digits of the year

    const dateStr = `${day}-${month}-${year}`;

    const customId = `1CH_${customerCode}_${sanitizedProjectName}_${dateStr}`;

    console.log(`Generated ID: ${customId}`);
    return {
      customProposalId: customId,
      error: null, // Explicitly null for no error
    };
  } catch (e: any) {
    console.error("Error generating proposal ID:", e);
    return {
      customProposalId: null,
      error: `Failed to generate ID: ${e.message || 'Unknown error'}`,
    };
  }
}; 