import { OAuth2Client } from 'google-auth-library';
import { ENV } from './env';

// Initialize Google OAuth client lazily
let googleClient: OAuth2Client | null = null;

function getGoogleClient(): OAuth2Client {
  if (!googleClient) {
    if (!ENV.GOOGLE_CLIENT_ID || !ENV.GOOGLE_CLIENT_SECRET || !ENV.GOOGLE_CALLBACK_URL) {
      throw new Error('Google OAuth environment variables not configured');
    }
    googleClient = new OAuth2Client(
      ENV.GOOGLE_CLIENT_ID,
      ENV.GOOGLE_CLIENT_SECRET,
      ENV.GOOGLE_CALLBACK_URL
    );
  }
  return googleClient;
}

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
  sub: string; // Google user ID
}

/**
 * Generate Google OAuth URL for user to authenticate
 */
export function getGoogleAuthUrl(): string {
  const client = getGoogleClient();
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}

/**
 * Exchange authorization code for user information
 */
export async function getGoogleUserInfo(code: string): Promise<GoogleUserInfo> {
  const client = getGoogleClient();
  try {
    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: ENV.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Failed to get user payload from Google');
    }

    return {
      email: payload.email!,
      name: payload.name!,
      picture: payload.picture,
      email_verified: payload.email_verified || false,
      sub: payload.sub,
    };
  } catch (error) {
    console.error('Google OAuth error:', error);
    throw new Error('Failed to authenticate with Google');
  }
}

/**
 * Verify a Google ID token (for client-side authentication)
 */
export async function verifyGoogleToken(token: string): Promise<GoogleUserInfo> {
  const client = getGoogleClient();
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: ENV.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token');
    }

    return {
      email: payload.email!,
      name: payload.name!,
      picture: payload.picture,
      email_verified: payload.email_verified || false,
      sub: payload.sub,
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    throw new Error('Invalid Google token');
  }
}
