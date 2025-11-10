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
    console.log('[Google OAuth] Exchanging code for tokens...');
    
    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    
    if (!tokens.id_token) {
      console.error('[Google OAuth] No id_token in response');
      throw new Error('No id_token received from Google');
    }
    
    console.log('[Google OAuth] Tokens received, verifying...');
    client.setCredentials(tokens);

    // Get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: ENV.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      console.error('[Google OAuth] No payload in ticket');
      throw new Error('Failed to get user payload from Google');
    }

    if (!payload.email || !payload.sub) {
      console.error('[Google OAuth] Missing required fields in payload');
      throw new Error('Invalid user data from Google');
    }

    console.log('[Google OAuth] User verified:', payload.email);

    return {
      email: payload.email,
      name: payload.name || payload.email,
      picture: payload.picture,
      email_verified: payload.email_verified || false,
      sub: payload.sub,
    };
  } catch (error: any) {
    console.error('[Google OAuth] Full error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    // More specific error messages
    if (error.message?.includes('invalid_grant')) {
      throw new Error('Authorization code expired or invalid. Please try logging in again.');
    }
    if (error.message?.includes('redirect_uri_mismatch')) {
      throw new Error('OAuth redirect URI mismatch. Please contact support.');
    }
    
    throw new Error(`Google authentication failed: ${error.message}`);
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
