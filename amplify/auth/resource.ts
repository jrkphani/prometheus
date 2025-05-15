import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  // How users will log in
  loginWith: {
    email: true,
    // phone: false, // Can be enabled later if needed
    // externalProviders: {}, // For social sign-in, can be added later
  },
  // What attributes users will have
  userAttributes: {
    // Define standard attributes that are mutable by users
    email: {
      mutable: true,
      required: true,
    },
    familyName: { // Corresponds to 'Last Name'
      mutable: true,
      required: false, // Making it optional for now, can be made required by onboarding flow
    },
    givenName: { // Corresponds to 'First Name'
      mutable: true,
      required: false, // Making it optional for now
    },
    // You can add custom attributes here if needed later
    // 'custom:department': {
    //   mutable: true,
    //   required: false,
    // },
    // 'custom:company': {
    //   mutable: true,
    //   required: false,
    // },
    // 'custom:personaRole': {
    //   mutable: true,
    //   required: false,
    // }
  },
  // Multifactor Authentication (MFA) settings - can be configured later
  // mfa: {
  //   mode: 'OPTIONAL', // or 'REQUIRED' or 'OFF'
  //   totp: true, // Time-based One-Time Password
  //   sms: false, // SMS-based MFA
  // },
  // Verification settings for new accounts
  // accountRecovery: 'EMAIL_ONLY', // Default is EMAIL_ONLY
});
