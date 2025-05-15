import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Flex, Heading, Button, Text, View, useTheme } from '@aws-amplify/ui-react';
import { useAuthenticator } from '@aws-amplify/ui-react'; // To get user and signOut

export function Layout() {
  const { tokens } = useTheme();
  const { user, signOut } = useAuthenticator((context) => [context.user, context.signOut]);
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/'); // Navigate to a public route after sign out if needed, or Authenticator handles it.
  };

  return (
    <View
      padding={tokens.space.medium}
      className="app-container"
      minHeight="100vh" // Ensure layout takes full viewport height
    >
      <Flex 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center" 
        marginBottom={tokens.space.large}
        paddingBottom={tokens.space.medium}
        style={{ borderBottom: `1px solid ${tokens.colors.border.secondary}` }}
      >
        <Heading level={1} onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          Prometheus
        </Heading>
        {user && (
          <Flex direction="row" alignItems="center" gap="small">
            <Text fontSize="small">
              Welcome, {user.signInDetails?.loginId || user.username}
            </Text>
            <Button size="small" variation="link" onClick={handleSignOut}>
              Sign Out
            </Button>
          </Flex>
        )}
      </Flex>
      
      {/* Content for the specific route will be rendered here */}
      <main>
        <Outlet />
      </main>

      {/* Optional: Footer can be added here */}
      {/* <View as="footer" marginTop={tokens.space.large} paddingTop={tokens.space.medium} style={{ borderTop: `1px solid ${tokens.colors.border.secondary}` }}>
        <Text textAlign="center" fontSize="small" color="font.tertiary">
          © {new Date().getFullYear()} Prometheus - 1CloudHub
        </Text>
      </View> */}
    </View>
  );
} 