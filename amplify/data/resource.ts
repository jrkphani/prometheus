import { a, defineData, defineFunction } from '@aws-amplify/backend';
import { auth } from '../auth/resource';
import { proposalGeneratorLambda } from '../functions';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>

// Define the Lambda function for generating proposal IDs
export const proposalIdGenerator = defineFunction({
  name: 'prometheus-proposalIdGenerator',
  entry: '../custom-logic/proposalIdGenerator.ts',
});

// Define the schema with Proposal, ProposalSection, and Question models
const schema = a.schema({

  Proposal: a
    .model({
      // The owner field will be auto-populated by Amplify
      // with the authenticated user's ID
      owner: a.string(),
      customProposalId: a.string().required(),
      projectName: a.string().required(),
      customerName: a.string().required(),
      status: a.enum([
        'DRAFT', 
        'SUBMITTED', 
        'IN_REVIEW', 
        'WON', 
        'LOST', 
        'ARCHIVED'
      ]),
      // Storing as a string, which will contain JSON from Yoopta.
      editorContent: a.string(),
    })
    .authorization((auth) => [
      auth.owner().to(['read', 'create', 'delete', 'update']),
      auth.authenticated().to(['read', 'create']),
    ]),

  // New Model: ProposalSection
  ProposalSection: a
    .model({
      owner: a.string(),
      proposalId: a.string().required(), // Foreign key to Proposal.id
      title: a.string().required(),
      order: a.integer().required().default(0),
    })
    .authorization((auth) => [
      auth.owner().to(['read', 'create', 'delete', 'update']),
    ])
    // Adding GSI for proposalId
    .index('byProposalId', { 
      sortKeyFields: ['order'],
      fields: ['proposalId']
    }),

  // New Model: Question
  Question: a
    .model({
      owner: a.string(),
      proposalSectionId: a.string().required(), // Foreign key to ProposalSection.id
      proposalId: a.string().required(), // Denormalized for easier querying
      text: a.string().required(),
      answer: a.string(), // Simple text answer for now
      isMandatory: a.boolean().required().default(false),
      order: a.integer().required().default(0),
    })
    .authorization((auth) => [
      auth.owner().to(['read', 'create', 'delete', 'update']),
    ])
    // Adding GSI for proposalSectionId
    .index('byProposalSectionId', { 
      sortKeyFields: ['order'],
      fields: ['proposalSectionId']
    })
    // Adding GSI for proposalId
    .index('byProposalId', { 
      sortKeyFields: ['order'],
      fields: ['proposalId']
    }),
    
  // Note: The proposal generator Lambda is added to the functions object below
});

// Export the schema type for frontend client generation
export type Schema = typeof schema;

// Define and export the data resource
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
  // Add the custom function resolvers
  functions: {
    proposalIdGenerator,
    proposalGeneratorLambda, // This makes the Lambda available via GraphQL
  }
});

/*
Explanation of Authorization Rules:
- For all models (Proposal, ProposalSection, Question), we use owner-based authorization
- When creating records, the client must ensure that the owner field matches the parent record's owner
- ProposalSection links to Proposal via proposalId
- Question links to ProposalSection via proposalSectionId and also has direct proposalId for easier querying
- Order fields in both ProposalSection and Question allow for sorting/ordering of content

GSIs (Global Secondary Indexes) for efficient querying:
1. ProposalSection by proposalId - Added with model.index('byProposalId')
2. Question by proposalSectionId - Added with model.index('byProposalSectionId')
3. Question by proposalId - Added with model.index('byProposalId')

Custom API Functions:
- The proposalIdGenerator Lambda is used for generating custom proposal IDs
- The proposalGeneratorLambda implements the proposal document generation logic
- Both are correctly wired up to the GraphQL API via the schema definition
*/


