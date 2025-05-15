import React, { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource'; // Adjust path if needed
import {
  Heading,
  Input,
  Button,
  Flex,
  Text,
  Card,
  View,
  SelectField,
  Grid, // For layout
  Divider, // For visual separation
  useTheme,
  Collection,
} from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';

// Generate the Data client
const client = generateClient<Schema>();

type ProposalItem = Schema extends { models: { Proposal: { type: infer T } } } ? T : any;
// Explicitly define the possible status values from your schema for the filter
const proposalStatuses = ['ALL', 'DRAFT', 'SUBMITTED', 'IN_REVIEW', 'WON', 'LOST', 'ARCHIVED'] as const;
type ProposalStatusFilter = typeof proposalStatuses[number];


function ProposalManager() {
  const { tokens } = useTheme();
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [projectName, setProjectName] = useState(''); // For new proposal form
  const [customerName, setCustomerName] = useState(''); // For new proposal form
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProposalStatusFilter>('ALL');

  const [isLoading, setIsLoading] = useState(false); // General loading for create/list
  const [isFetchingId, setIsFetchingId] = useState(false); // For ID generation
  const [error, setError] = useState<string | null>(null);

  // Debounce function
  const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
      new Promise(resolve => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });
  };

  // Fetch proposals based on current search and filter criteria
  const fetchProposals = useCallback(async (currentSearchTerm: string, currentFilterStatus: ProposalStatusFilter) => {
    setIsLoading(true);
    setError(null);
    console.log('Fetching proposals with:', { currentSearchTerm, currentFilterStatus });

    // Construct the filter object for Amplify Data
    let filterCondition: any = {};
    const conditions = [];

    if (currentFilterStatus !== 'ALL') {
      conditions.push({ status: { eq: currentFilterStatus } });
    }

    if (currentSearchTerm.trim() !== '') {
      const search = currentSearchTerm.trim();
      // Search in projectName OR customerName OR customProposalId
      // Ensure these fields are marked as 'searchable()' or indexed appropriately in your schema
      // For basic filtering, 'contains' is good. For true full-text search, Amplify Searchable (OpenSearch) is needed.
      conditions.push({
        or: [
          { projectName: { contains: search } },
          { customerName: { contains: search } },
          { customProposalId: { contains: search } },
        ],
      });
    }

    if (conditions.length > 0) {
      filterCondition = conditions.length === 1 ? conditions[0] : { and: conditions };
    }
    
    try {
      // If no conditions, filterCondition will be empty, fetching all (owned) proposals
      const { data: items, errors } = await (client.models as any).Proposal.list({
        filter: Object.keys(filterCondition).length > 0 ? filterCondition : undefined,
        // You can add selectionSet here to specify which fields to fetch, optimizing payload
        // selectionSet: ['id', 'projectName', 'customerName', 'customProposalId', 'status', 'createdAt', 'owner'] 
      });

      if (errors) {
        console.error('Failed to fetch proposals:', errors);
        setError(`Failed to fetch proposals: ${errors.map((e: any) => e.message).join(', ')}`);
        setProposals([]);
      } else {
        setProposals(items);
        console.log('Fetched proposals:', items);
      }
    } catch (e: any) {
      console.error('Error fetching proposals:', e);
      setError(`Error fetching proposals: ${e.message}`);
      setProposals([]);
    }
    setIsLoading(false);
  }, []); // No dependencies, as it receives params directly

  // Debounced version of fetchProposals for search input
  const debouncedFetchProposals = useCallback(debounce(fetchProposals, 500), [fetchProposals]);

  // Ref to track if search term was changed by user input vs. programmatic clear
  const searchTermChangedRef = React.useRef(false);

  // Effect to fetch proposals when searchTerm or filterStatus changes
  useEffect(() => {
    // For searchTerm, use the debounced version.
    // For filterStatus, fetch immediately.
    if (searchTermChangedRef.current) { // Check if search term actually changed to trigger debounce
        debouncedFetchProposals(searchTerm, filterStatus);
        searchTermChangedRef.current = false;
    } else {
        fetchProposals(searchTerm, filterStatus); // Fetch immediately for status change
    }
  }, [searchTerm, filterStatus, debouncedFetchProposals, fetchProposals]);

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    searchTermChangedRef.current = true;
  };

  const handleFilterStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value as ProposalStatusFilter);
    searchTermChangedRef.current = false; // Ensure immediate fetch for status change
  };


  const handleCreateProposal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!projectName.trim() || !customerName.trim()) {
      setError('Project Name and Customer Name are required.');
      return;
    }
    
    setIsFetchingId(true);
    setIsLoading(true);
    setError(null);
    let generatedCustomProposalId: string | undefined | null = null;

    try {
      // For now, generate a mock ID locally to unblock development
      // This would normally come from the Lambda function in production
      const date = new Date();
      // Get a sanitized project name (alphanumeric, underscore, hyphen only)
      const sanitizedProjectName = projectName.trim().replace(/[^A-Za-z0-9_-]/g, '').substring(0, 20);
      // Get customer code (first 5 chars, uppercase)
      const customerCode = customerName.trim().substring(0, 5).toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      // Format date as DD-mmm-YY (e.g., 15-May-25)
      const day = String(date.getDate()).padStart(2, '0');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      const year = String(date.getFullYear()).substring(2); // Get last two digits of the year
      
      const dateStr = `${day}-${month}-${year}`;
      
      // Generate ID in the correct format
      generatedCustomProposalId = `1CH_${customerCode}_${sanitizedProjectName}_${dateStr}`;
      
      console.log('Generated Custom Proposal ID:', generatedCustomProposalId);
    } catch (e: any) {
      console.error('Exception while generating custom proposal ID:', e);
      setError(`Exception generating ID: ${e.message}`);
      setIsFetchingId(false);
      setIsLoading(false);
      return;
    }
    setIsFetchingId(false);

    // 2. Create the proposal with the generated ID
    if (!generatedCustomProposalId) {
        setError('Could not obtain a valid custom proposal ID.');
        setIsLoading(false);
        return;
    }

    try {
      // Get current authenticated user ID from the session
      const { credentials } = await fetchAuthSession();
      
      const proposalData = {
        projectName: projectName.trim(),
        customerName: customerName.trim(),
        customProposalId: generatedCustomProposalId,
        status: 'DRAFT',
        // The owner field will be automatically set by Amplify based on the authenticated user
      };
      
      console.log('Creating proposal with data:', proposalData);
      
      const { data: newProposal, errors: createErrors } = await (client.models as any).Proposal.create(proposalData);

      if (createErrors && createErrors.length > 0) {
        console.error('Failed to create proposal:', createErrors);
        const errorDetails = createErrors.map((e: any) => {
          return `${e.message || 'Unknown error'} ${e.field ? `(Field: ${e.field})` : ''}`;
        }).join(', ');
        setError(`Failed to create proposal: ${errorDetails}`);
      } else if (newProposal) {
        // Instead of just adding to local state, refetch to ensure filters are applied correctly
        // Or, more optimistically, add to local state *if* it matches current filters
        setProposals(prev => [newProposal, ...prev]); // Optimistic update, consider refetching for consistency
        setProjectName('');
        setCustomerName('');
        console.log('Proposal created:', newProposal);
      } else {
        setError('Unknown error - no proposal was created and no error was returned.');
      }
    } catch (e: any) {
      console.error('Error creating proposal:', e);
      setError(`Error creating proposal: ${e.message}`);
    }
    setIsLoading(false);
  };

  return (
    <View paddingBlock="medium"> {/* Changed padding to paddingBlock for vertical padding only */}
      <Grid
        templateColumns={{ base: "1fr", medium: "1fr 3fr" }} // Responsive columns
        gap={tokens.space.large} // Use theme tokens
      >
        {/* Sidebar for Create Proposal and Filters */}
        <View 
            padding="medium" 
            backgroundColor="background.secondary" // Slight background tint
            borderRadius="medium"
            boxShadow="small" // Subtle shadow
        >
          <Heading level={3} marginBottom="medium">New Proposal</Heading>
          <form onSubmit={handleCreateProposal}>
            <Flex direction="column" gap="medium"> {/* Increased gap */}
              <Input
                placeholder="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={isLoading}
                required
                size="small"
              />
              <Input
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={isLoading}
                required
                size="small"
              />
              <Button 
                type="submit" 
                variation="primary" 
                isLoading={isFetchingId || isLoading}
                disabled={isLoading}
                isFullWidth
              >
                {isFetchingId ? 'Generating ID...' : 'Create Proposal'}
              </Button>
            </Flex>
          </form>
          {error && !isFetchingId && !isLoading && ( // Only show general error if not specific to ID gen or loading
            <Card
              variation="outlined"
              backgroundColor="red.10"
              borderColor="red.60"
              marginTop="medium"
              padding="small"
            >
              <Heading level={6} color="red.80">Error</Heading>
              <Text color="red.80">{error}</Text>
            </Card>
          )}

          <Divider marginBlock="large" /> 

          <Heading level={4} marginBottom="medium">Filters</Heading>
          <Flex direction="column" gap="medium">
            <Input
              placeholder="Search by Project, Customer, ID..."
              value={searchTerm}
              onChange={handleSearchTermChange}
              size="small"
            />
            <SelectField
              label="Status"
              labelHidden
              placeholder="Filter by Status"
              value={filterStatus}
              onChange={handleFilterStatusChange}
              size="small"
            >
              {proposalStatuses.map(status => (
                <option key={status} value={status}>{status === 'ALL' ? 'All Statuses' : status}</option>
              ))}
            </SelectField>
          </Flex>
        </View>

        {/* Main content area for Proposal List */}
        <View>
          <Flex justifyContent="space-between" alignItems="center" marginBottom="medium">
            <Heading level={3}>My Proposals</Heading>
            <Button onClick={() => fetchProposals(searchTerm, filterStatus)} variation="link" size="small" disabled={isLoading}>
                {isLoading && proposals.length > 0 ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Flex>
          
          {isLoading && proposals.length === 0 && <Text>Loading proposals...</Text>}
          {!isLoading && proposals.length === 0 && !error && <Text>No proposals found matching your criteria. Create one or adjust filters!</Text>}
          {error && proposals.length === 0 && ( // Show error if list is empty due to error
            <Card
              variation="outlined"
              backgroundColor="red.10"
              borderColor="red.60"
              marginTop="medium"
              padding="small"
            >
              <Heading level={6} color="red.80">Error Fetching Proposals</Heading>
              <Text color="red.80">{error}</Text>
            </Card>
          )}
          
          <Collection
            type="list"
            items={proposals}
            gap="medium"
          >
            {(proposal: ProposalItem) => (
              <Card key={proposal.id} variation="elevated" width="100%">
                <Flex direction="column" gap="xs"> {/* Small gap within card items */}
                  <Heading level={5}>{proposal.projectName}</Heading>
                  <Text fontSize="small">Customer: {proposal.customerName}</Text>
                  <Text fontSize="small" fontWeight="bold">ID: {proposal.customProposalId}</Text>
                  <Text fontSize="small">Status: <Text as="span" fontWeight="semibold">{proposal.status}</Text></Text>
                  <Text fontSize="small" color="font.tertiary">Owner: {proposal.owner?.substring(0,15) || ''}...</Text> {/* Truncate owner if too long */}
                  <Text fontSize="small" color="font.tertiary">Created: {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : ''}</Text>
                </Flex>
              </Card>
            )}
          </Collection>
        </View>
      </Grid>
    </View>
  );
}

export default ProposalManager; 