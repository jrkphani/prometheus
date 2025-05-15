import { a, defineData, defineFunction } from '@aws-amplify/backend';
import { auth } from '../auth/resource';

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

// Define the schema with only the Proposal model
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
    })
    .authorization((auth) => [
      auth.owner().to(['read', 'create', 'delete', 'update']),
      auth.authenticated().to(['read', 'create']),
    ]),
});

// Export the schema type for frontend client generation
export type Schema = typeof schema;

// Define and export the data resource
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});

/*
Explanation of Authorization Rules for Proposal Model:
- `.authorization([...])` at the model level defines the primary access patterns.

1. `auth.owner().to(['read', 'create', 'delete', 'update'])`:
   - This is the core rule for multi-tenancy.
   - When a new Proposal is created, Amplify automatically populates an `owner` field with the Cognito username of the creator.
   - This rule ensures that only the user who created the proposal can perform CRUD operations on it.

2. `auth.authenticated().to(['read', 'create'])`:
   - This allows *any* authenticated user to create new proposals (which will then be owned by them).
   - It also allows any authenticated user to *read* proposals. For the MVP, this is simple.
   - Later, for features like "Shared with Me," we would need more granular read access, potentially using groups or custom resolvers.

Status Values: 'DRAFT', 'SUBMITTED', 'IN_REVIEW', 'WON', 'LOST', 'ARCHIVED'
*/
