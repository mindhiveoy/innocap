// Define allowed origins as a const array for type safety
export const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://innocap-staging.mindhive.fi'
] as const;

export const CHAT_CONFIG = {
  FLOWISE_API_HOST: process.env.NEXT_PUBLIC_CHAT_API_HOST || 'http://localhost:3000',
  CHATFLOW_ID: '104f68db-a8d6-4135-acfc-6bb496040981',
  ALLOWED_ORIGINS,
} as const; 