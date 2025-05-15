import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Authenticator, View, Heading, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { Layout } from './components/Layout';
import ProposalManager from './components/ProposalManager';

// Optional: Your theme definition
// const theme: Theme = { ... };

// Example of a component to protect routes - uncomment and fix when needed
/*
const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { authStatus } = useAuthenticator(context => [context.authStatus]);
  if (authStatus !== 'authenticated') {
    // If not authenticated, Authenticator will show login.
    // Or you could redirect to a specific login page if you had one:
    // return <Navigate to="/login" replace />;
    // For now, letting Authenticator handle it is fine.
  }
  return children;
};
*/

function App() {
  return (
    <Authenticator.Provider>
      <AppContent />
    </Authenticator.Provider>
  );
}

function AppContent() {
  const { authStatus, user, signOut } = useAuthenticator(context => [
    context.authStatus,
    context.user,
    context.signOut
  ]);
  
  // If still determining auth state, show loading
  if (authStatus === 'configuring') {
    return (
      <View padding="xl" textAlign="center">
        <Heading level={3}>Loading...</Heading>
      </View>
    );
  }
  
  // If not authenticated, show the login UI
  if (authStatus !== 'authenticated') {
    return <Authenticator hideSignUp={false} />;
  }
  
  // If authenticated, show the app with routes
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* All routes that should appear inside the Layout */}
        <Route path="/dashboard" element={<ProposalManager />} />
        {/* Add other routes inside Layout here */}
        {/* e.g., <Route path="/proposals/:id" element={<ProposalDetail />} /> */}
        
        {/* Redirect from root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all other paths and redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
