import { OAuth2Client } from 'google-auth-library';
import { ENV } from './env';

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
  ENV.GOOGLE_CLIENT_ID,
  ENV.GOOGLE_CLIENT_SECRET,
  ENV.GOOGLE_CALLBACK_URL
);

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
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  return googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}

/**
 * Exchange authorization code for user information
 */
export async function getGoogleUserInfo(code: string): Promise<GoogleUserInfo> {
  try {
    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // Get user info
    const ticket = await googleClient.verifyIdToken({
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
  try {
    const ticket = await googleClient.verifyIdToken({
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
