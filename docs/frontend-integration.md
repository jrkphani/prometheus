# Frontend Integration Guide - Proposal Data Model

## Setup

### 1. Generate the API Client

In your frontend React application, generate the client for the Proposal data model:

```typescript
// src/lib/api.ts
import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../amplify/data/resource';

// Create a type-safe API client
export const client = generateClient<Schema>();
```

### 2. Configure Amplify in Your App

Ensure Amplify is configured in your application:

```typescript
// src/lib/amplify.ts
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../amplifyconfiguration.json';

Amplify.configure(amplifyconfig);
```

## Using the Proposal API

### 1. Create a New Proposal

```typescript
const createProposal = async (data: {
  projectName: string; 
  customerName: string;
}) => {
  try {
    // Default status is "DRAFT"
    const status = 'DRAFT';
    
    // Call our Lambda function to generate the custom ID
    const { customProposalId } = await client.models.functions.generateProposalId({
      input: {
        projectName: data.projectName,
        customerName: data.customerName
      }
    });

    // Create the proposal with the generated ID
    const newProposal = await client.models.Proposal.create({
      customProposalId,
      projectName: data.projectName,
      customerName: data.customerName,
      status
    });
    
    return newProposal;
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }
};
```

### 2. List User's Proposals

```typescript
// Get all proposals for the current user
const listMyProposals = async () => {
  try {
    const response = await client.models.Proposal.list();
    return response.data;
  } catch (error) {
    console.error('Error fetching proposals:', error);
    throw error;
  }
};

// Get proposals with a specific status
const listProposalsByStatus = async (status: string) => {
  try {
    const response = await client.models.Proposal.list({
      filter: {
        status: {
          eq: status
        }
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${status} proposals:`, error);
    throw error;
  }
};
```

### 3. Get Proposal Details

```typescript
const getProposalById = async (id: string) => {
  try {
    const proposal = await client.models.Proposal.get({ id });
    return proposal;
  } catch (error) {
    console.error('Error fetching proposal details:', error);
    throw error;
  }
};
```

### 4. Update Proposal Status

```typescript
const updateProposalStatus = async (id: string, newStatus: string) => {
  try {
    const updatedProposal = await client.models.Proposal.update({
      id,
      status: newStatus
    });
    return updatedProposal;
  } catch (error) {
    console.error('Error updating proposal status:', error);
    throw error;
  }
};
```

### 5. Delete a Proposal

```typescript
const deleteProposal = async (id: string) => {
  try {
    await client.models.Proposal.delete({ id });
    return true;
  } catch (error) {
    console.error('Error deleting proposal:', error);
    throw error;
  }
};
```

## React Component Examples

### Proposal List Component

```tsx
import React, { useEffect, useState } from 'react';
import { client } from '../lib/api';

export default function ProposalList() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchProposals() {
      try {
        setLoading(true);
        const response = await client.models.Proposal.list();
        setProposals(response.data);
      } catch (err) {
        console.error('Error fetching proposals:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProposals();
  }, []);
  
  if (loading) return <div>Loading proposals...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>My Proposals</h2>
      {proposals.length === 0 ? (
        <p>No proposals found. Create your first proposal!</p>
      ) : (
        <ul>
          {proposals.map(proposal => (
            <li key={proposal.id}>
              <strong>{proposal.customProposalId}</strong>: {proposal.projectName}
              <span className="status">{proposal.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Create Proposal Form

```tsx
import React, { useState } from 'react';
import { client } from '../lib/api';

export default function CreateProposalForm() {
  const [formData, setFormData] = useState({
    projectName: '',
    customerName: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.projectName || !formData.customerName) {
      setError('Project name and customer name are required');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // First generate the custom ID
      const { customProposalId } = await client.models.functions.generateProposalId({
        input: {
          projectName: formData.projectName,
          customerName: formData.customerName
        }
      });
      
      // Then create the proposal
      await client.models.Proposal.create({
        customProposalId,
        projectName: formData.projectName,
        customerName: formData.customerName,
        status: 'DRAFT'
      });
      
      // Reset form
      setFormData({ projectName: '', customerName: '' });
      alert('Proposal created successfully!');
      
    } catch (err) {
      console.error('Error creating proposal:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div>
      <h2>Create New Proposal</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Project Name:
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        
        <div>
          <label>
            Customer Name:
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Proposal'}
        </button>
      </form>
    </div>
  );
}
```

## Testing Considerations

1. **Auth Integration**: Make sure users are authenticated before accessing proposal API calls.
2. **Error Handling**: Implement proper error handling and user feedback.
3. **Custom ID Generation**: Verify the custom ID Lambda works as expected.
4. **Authorization Rules**: Test that users can only access their own proposals.

## Next Steps

1. Implement the full proposal workflow management UI
2. Add proposal content editing features
3. Create UI for different proposal statuses (Draft, Submitted, etc.)
4. Implement search and filtering
5. Add permission management for team collaboration 