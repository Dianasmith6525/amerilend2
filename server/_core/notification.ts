import { TRPCError } from "@trpc/server";
import { ENV } from "./env";
import sgMail from "@sendgrid/mail";
import twilio from "twilio";
import { getLoanEmailTemplate, LoanEmailData } from "./loanEmailTemplates";

// Initialize SendGrid
if (ENV.SENDGRID_API_KEY) {
  sgMail.setApiKey(ENV.SENDGRID_API_KEY);
}

// Initialize Twilio
let twilioClient: ReturnType<typeof twilio> | null = null;
if (ENV.TWILIO_ACCOUNT_SID && ENV.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(ENV.TWILIO_ACCOUNT_SID, ENV.TWILIO_AUTH_TOKEN);
}

export type NotificationPayload = {
  title: string;
  content: string;
};

export type EmailOTPPayload = {
  to: string;
  code: string;
  expiryMinutes?: number;
};

export type SMSOTPPayload = {
  to: string; // Phone number in E.164 format (e.g., +1234567890)
  code: string;
  expiryMinutes?: number;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const trimValue = (value: string): string => value.trim();
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const buildEndpointUrl = (baseUrl: string): string => {
  const normalizedBase = baseUrl.endsWith("/")
    ? baseUrl
    : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};

const validatePayload = (input: NotificationPayload): NotificationPayload => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required.",
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required.",
    });
  }

  const title = trimValue(input.title);
  const content = trimValue(input.content);

  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`,
    });
  }

  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`,
    });
  }

  return { title, content };
};

/**
 * Send OTP code via SendGrid email
 */
export async function sendEmailOTP(payload: EmailOTPPayload): Promise<boolean> {
  const { to, code, expiryMinutes = 15 } = payload;

  if (!ENV.SENDGRID_API_KEY) {
    console.log(`[Email OTP] Would send to ${to}: ${code} (expires in ${expiryMinutes}min)`);
    console.log("[Email OTP] SendGrid not configured - code logged to console");
    return false;
  }

  if (!ENV.SENDGRID_FROM_EMAIL) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "SendGrid sender email is not configured.",
    });
  }

  try {
    const result = await sgMail.send({
      to,
      from: {
        email: ENV.SENDGRID_FROM_EMAIL,
        name: 'AmeriLend Support'
      },
      replyTo: ENV.SENDGRID_FROM_EMAIL,
      subject: "Your AmeriLend Verification Code",
      text: `Your verification code is: ${code}\n\nThis code will expire in ${expiryMinutes} minutes.\n\nIf you didn't request this code, please ignore this email.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h1 style="color: #0033A0; margin: 0 0 20px 0; font-size: 24px;">AmeriLend</h1>
                      <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 20px; font-weight: normal;">Your Verification Code</h2>
                      <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                        Thank you for signing up with AmeriLend. Please use the following code to verify your email address:
                      </p>
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td align="center" style="padding: 20px; background-color: #f8f9fa; border-radius: 4px;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0033A0; font-family: 'Courier New', monospace;">
                              ${code}
                            </span>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 30px 0 0 0;">
                        This code will expire in <strong>${expiryMinutes} minutes</strong>.
                      </p>
                      <p style="color: #999999; font-size: 12px; line-height: 18px; margin: 20px 0 0 0;">
                        If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
                      </p>
                      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                      <p style="color: #999999; font-size: 11px; line-height: 16px; margin: 0;">
                        AmeriLend - Your Trusted Lending Partner<br>
                        This is an automated message, please do not reply to this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      trackingSettings: {
        clickTracking: { enable: false },
        openTracking: { enable: false }
      },
      categories: ['otp-verification']
    });

    console.log(`[Email OTP] Sent successfully to ${to}`);
    console.log(`[Email OTP] SendGrid response:`, JSON.stringify(result[0]?.statusCode));
    return true;
  } catch (error) {
    console.error("[Email OTP] Failed to send:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to send verification email. Please try again.",
    });
  }
}

/**
 * Send generic email via SendGrid
 */
export async function sendEmail(payload: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}): Promise<boolean> {
  const { to, subject, html, text, attachments } = payload;

  if (!ENV.SENDGRID_API_KEY) {
    console.warn(`[Email] ⚠️  SENDGRID_API_KEY not configured`);
    console.log(`[Email] Would send to ${to}: ${subject}`);
    console.log("[Email] Email content logged to console (SendGrid not configured):");
    console.log("[Email] HTML:", html);
    return false;
  }

  if (!ENV.SENDGRID_FROM_EMAIL) {
    console.error("[Email] ❌ SendGrid sender email is not configured");
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "SendGrid sender email is not configured.",
    });
  }

  try {
    const msg: any = {
      to,
      from: {
        name: "AmeriLend",
        email: ENV.SENDGRID_FROM_EMAIL,
      },
      replyTo: ENV.SENDGRID_FROM_EMAIL,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      msg.attachments = attachments.map(att => ({
        filename: att.filename,
        content: att.content.toString('base64'),
        type: att.contentType,
        disposition: 'attachment',
      }));
    }

    console.log(`[Email] Attempting to send email to ${to}...`);
    const result = await sgMail.send(msg);
    console.log(`[Email] ✅ Successfully sent to ${to} - Subject: ${subject}`);
    console.log(`[Email] Response status:`, result[0]?.statusCode);
    return true;
  } catch (error: any) {
    console.error("[Email] ❌ Failed to send:", error.message || error);
    console.error("[Email] Error details:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to send email. Please try again.",
    });
  }
}

/**
 * Send welcome email to newly registered user
 */
export async function sendWelcomeEmail(email: string, userName?: string): Promise<boolean> {
  const userDisplayName = userName || email.split('@')[0];

  if (!ENV.SENDGRID_API_KEY) {
    console.log(`[Welcome Email] Would send to ${email} for user: ${userDisplayName}`);
    return false;
  }

  if (!ENV.SENDGRID_FROM_EMAIL) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "SendGrid sender email is not configured.",
    });
  }

  try {
    await sendEmail({
      to: email,
      subject: "Welcome to AmeriLend!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 30px; background: linear-gradient(135deg, #0033A0 0%, #002080 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px;">Welcome to AmeriLend</h1>
                      <p style="color: #ffffff; margin: 0; font-size: 16px;">Your Trusted Lending Partner</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #0033A0; margin: 0 0 20px 0; font-size: 24px;">Hi ${userDisplayName}!</h2>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        Thank you for creating your AmeriLend account! We're excited to help you find the perfect loan solution.
                      </p>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        Your account is now active and ready to use. Here's what you can do next:
                      </p>
                      
                      <ul style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0; padding-left: 20px;">
                        <li style="margin-bottom: 10px;"><strong>Browse Loan Options</strong> - Explore our various loan products tailored to your needs</li>
                        <li style="margin-bottom: 10px;"><strong>Complete Your Profile</strong> - Add more information to get personalized loan recommendations</li>
                        <li style="margin-bottom: 10px;"><strong>Apply for a Loan</strong> - Start your application with just a few clicks</li>
                        <li style="margin-bottom: 10px;"><strong>Track Your Application</strong> - Monitor your application status in real-time</li>
                      </ul>
                      
                      <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #0033A0; margin: 30px 0; border-radius: 4px;">
                        <p style="color: #333333; font-size: 14px; line-height: 20px; margin: 0;">
                          <strong>💡 Tip:</strong> Keep your account information up to date to ensure faster loan approvals and better rates.
                        </p>
                      </div>
                      
                      <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        If you have any questions or need assistance, our support team is here to help. Contact us anytime!
                      </p>
                      
                      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                      
                      <p style="color: #999999; font-size: 12px; line-height: 18px; margin: 0;">
                        <strong>Security Note:</strong> We'll never ask for your password via email. Keep your login credentials safe and secure.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 30px; background-color: #f8f9fa; border-top: 1px solid #eeeeee;">
                      <p style="color: #999999; font-size: 11px; line-height: 16px; margin: 0;">
                        AmeriLend - Your Trusted Lending Partner<br>
                        © 2025 AmeriLend, LLC. All Rights Reserved<br>
                        This is an automated message, please do not reply to this email.<br>
                        Questions? Call us at (945) 212-1609 or visit our website
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `Welcome to AmeriLend!\n\nHi ${userDisplayName},\n\nThank you for creating your AmeriLend account! Your account is now active and ready to use.\n\nYou can now:\n- Browse loan options\n- Complete your profile\n- Apply for a loan\n- Track your application\n\nIf you have any questions, contact our support team.\n\nSecurity Note: We'll never ask for your password via email. Keep your login credentials safe!\n\nBest regards,\nThe AmeriLend Team`,
    });

    console.log(`[Welcome Email] ✅ Welcome email sent to ${email}`);
    return true;
  } catch (error: any) {
    console.error("[Welcome Email] Failed to send welcome email:", error);
    // Don't throw - continue with signup even if welcome email fails
    return false;
  }
}

/**
 * Send email verification link + OTP code to user
 */
export async function sendEmailVerification(
  email: string,
  verificationToken: string,
  otpCode: string,
  userName?: string
): Promise<boolean> {
  const userDisplayName = userName || email.split('@')[0];

  if (!ENV.SENDGRID_API_KEY) {
    console.log(`[Email Verification] Would send to ${email} with token: ${verificationToken} and code: ${otpCode}`);
    return false;
  }

  if (!ENV.SENDGRID_FROM_EMAIL) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "SendGrid sender email is not configured.",
    });
  }

  try {
    const verificationLink = `${process.env.VITE_APP_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: email,
      subject: "Verify Your AmeriLend Email Address",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 30px; background: linear-gradient(135deg, #0033A0 0%, #002080 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px;">Verify Your Email</h1>
                      <p style="color: #ffffff; margin: 0; font-size: 16px;">Complete your AmeriLend account setup</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #0033A0; margin: 0 0 20px 0; font-size: 24px;">Hi ${userDisplayName}!</h2>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        Thank you for creating your AmeriLend account. To complete your registration, please verify your email address.
                      </p>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                        Choose one of the following verification methods:
                      </p>
                      
                      <div style="background-color: #f0f7ff; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
                        <h3 style="color: #0033A0; margin: 0 0 15px 0; font-size: 16px;">Option 1: Click Verification Link</h3>
                        <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 0 0 15px 0;">
                          Click the button below to instantly verify your email:
                        </p>
                        <div style="text-align: center; margin: 20px 0;">
                          <a href="${verificationLink}" style="display: inline-block; padding: 12px 30px; background-color: #0033A0; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                            Verify Email Now
                          </a>
                        </div>
                        <p style="color: #999999; font-size: 12px; line-height: 18px; margin: 0; word-break: break-all;">
                          Or copy this link: ${verificationLink}
                        </p>
                      </div>
                      
                      <div style="background-color: #fff8f0; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
                        <h3 style="color: #0033A0; margin: 0 0 15px 0; font-size: 16px;">Option 2: Enter Verification Code</h3>
                        <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 0 0 15px 0;">
                          If you prefer, enter this code in the verification form:
                        </p>
                        <div style="background-color: #ffffff; border: 2px solid #0033A0; padding: 20px; text-align: center; border-radius: 6px; margin: 15px 0;">
                          <p style="color: #0033A0; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                            ${otpCode}
                          </p>
                        </div>
                        <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 10px 0 0 0;">
                          This code will expire in 30 minutes.
                        </p>
                      </div>
                      
                      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                      
                      <p style="color: #999999; font-size: 12px; line-height: 18px; margin: 0;">
                        <strong>Security Note:</strong> We'll never ask for your password via email. If you didn't create this account, please contact us immediately.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 30px; background-color: #f8f9fa; border-top: 1px solid #eeeeee;">
                      <p style="color: #999999; font-size: 11px; line-height: 16px; margin: 0;">
                        AmeriLend - Your Trusted Lending Partner<br>
                        © 2025 AmeriLend, LLC. All Rights Reserved<br>
                        This is an automated message, please do not reply to this email.<br>
                        Questions? Call us at (945) 212-1609 or visit our website
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `Verify Your Email\n\nHi ${userDisplayName},\n\nThank you for creating your AmeriLend account. To complete your registration, please verify your email address.\n\nOption 1: Click this link to verify: ${verificationLink}\n\nOption 2: Enter this code: ${otpCode}\n\nThis code will expire in 30 minutes.\n\nIf you didn't create this account, please contact us immediately.\n\nBest regards,\nThe AmeriLend Team`,
    });

    console.log(`[Email Verification] ✅ Verification email sent to ${email}`);
    return true;
  } catch (error: any) {
    console.error("[Email Verification] Failed to send verification email:", error);
    return false;
  }
}

/**
 * Send OTP code via Twilio SMS
 */
export async function sendSMSOTP(payload: SMSOTPPayload): Promise<boolean> {
  const { to, code, expiryMinutes = 15 } = payload;

  if (!twilioClient || !ENV.TWILIO_PHONE_NUMBER) {
    console.log(`[SMS OTP] Would send to ${to}: ${code} (expires in ${expiryMinutes}min)`);
    console.log("[SMS OTP] Twilio not configured - code logged to console");
    return false;
  }

  try {
    await twilioClient.messages.create({
      body: `Your AmeriLend verification code is: ${code}\n\nExpires in ${expiryMinutes} minutes.`,
      from: ENV.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log(`[SMS OTP] Sent to ${to}`);
    return true;
  } catch (error) {
    console.error("[SMS OTP] Failed to send:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to send verification SMS. Please try again.",
    });
  }
}

/**
 * Dispatches a project-owner notification through the Manus Notification Service.
 * Returns `true` if the request was accepted, `false` when the upstream service
 * cannot be reached (callers can fall back to email/slack). Validation errors
 * bubble up as TRPC errors so callers can fix the payload.
 */
export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  const { title, content } = validatePayload(payload);

  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured.",
    });
  }

  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured.",
    });
  }

  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

/**
 * Send SMS notification for loan application status updates
 */
export async function sendLoanStatusSMS(
  phoneNumber: string,
  status: string,
  applicationId: number,
  additionalInfo?: string
): Promise<boolean> {
  if (!twilioClient || !ENV.TWILIO_PHONE_NUMBER) {
    console.log(`[Loan Status SMS] Would send to ${phoneNumber}: Status ${status}`);
    return false;
  }

  const statusMessages: Record<string, string> = {
    pending: `Your AmeriLend loan application #${applicationId} has been received and is under review. We'll notify you of the decision within 24-48 hours.`,
    under_review: `Your AmeriLend loan application #${applicationId} is currently being reviewed by our team. We'll update you soon.`,
    approved: `Great news! Your AmeriLend loan application #${applicationId} has been APPROVED! ${additionalInfo || 'Log in to complete the next steps.'}`,
    rejected: `We're unable to approve your loan application #${applicationId} at this time. ${additionalInfo || 'Please call (945) 212-1609 for more information.'}`,
    fee_pending: `Your loan #${applicationId} is approved! Please pay the processing fee to proceed with disbursement. Log in at amerilendloan.com`,
    fee_paid: `Payment received for loan #${applicationId}! Your funds will be disbursed within 1-2 business days.`,
    disbursed: `Your loan #${applicationId} has been funded! Funds should appear in your account within 24 hours. Thank you for choosing AmeriLend!`,
  };

  const message = statusMessages[status] || `Your AmeriLend loan application #${applicationId} status has been updated. Log in to view details.`;

  try {
    await twilioClient.messages.create({
      body: message,
      from: ENV.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    console.log(`[Loan Status SMS] Sent ${status} notification to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error("[Loan Status SMS] Failed to send:", error);
    return false;
  }
}

/**
 * Send email notification for loan application status updates
 */
export async function sendLoanStatusEmail(
  email: string,
  status: string,
  applicationId: number,
  applicantName: string,
  loanAmount?: number,
  additionalInfo?: string
): Promise<boolean> {
  if (!ENV.SENDGRID_API_KEY || !ENV.SENDGRID_FROM_EMAIL) {
    console.log(`[Loan Status Email] Would send to ${email}: Status ${status}`);
    return false;
  }

  const statusConfig: Record<string, { subject: string; heading: string; color: string; }> = {
    pending: {
      subject: "Application Received - Under Review",
      heading: "We've Received Your Application",
      color: "#FFA500"
    },
    approved: {
      subject: "Congratulations! Your Loan is Approved",
      heading: "Your Loan Has Been Approved!",
      color: "#00A86B"
    },
    rejected: {
      subject: "Application Decision",
      heading: "Application Status Update",
      color: "#DC143C"
    },
    fee_pending: {
      subject: "Action Required: Pay Processing Fee",
      heading: "Complete Your Application",
      color: "#FFA500"
    },
    fee_paid: {
      subject: "Payment Confirmed - Disbursement Pending",
      heading: "Payment Received!",
      color: "#00A86B"
    },
    disbursed: {
      subject: "Your Loan Has Been Funded!",
      heading: "Funds Disbursed Successfully",
      color: "#00A86B"
    }
  };

  const config = statusConfig[status] || {
    subject: "Loan Application Status Update",
    heading: "Application Status Update",
    color: "#0033A0"
  };

  const formattedAmount = loanAmount ? `$${(loanAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '';

  const statusContent: Record<string, string> = {
    pending: `
      <p style="color: #666666; font-size: 16px; line-height: 24px;">
        Thank you for applying for a loan with AmeriLend. We've received your application and our team is currently reviewing it.
      </p>
      <p style="color: #666666; font-size: 16px; line-height: 24px;">
        <strong>Application ID:</strong> #${applicationId}<br>
        <strong>Status:</strong> Under Review<br>
        <strong>Expected Decision:</strong> Within 24-48 hours
      </p>
    `,
    approved: `
      <p style="color: #666666; font-size: 16px; line-height: 24px;">
        Congratulations! We're pleased to inform you that your loan application has been approved.
      </p>
      <p style="color: #666666; font-size: 16px; line-height: 24px;">
        <strong>Application ID:</strong> #${applicationId}<br>
        <strong>Approved Amount:</strong> ${formattedAmount}<br>
        <strong>Next Step:</strong> Pay processing fee to proceed
      </p>
      ${additionalInfo ? `<p style="color: #666666; font-size: 16px; line-height: 24px;">${additionalInfo}</p>` : ''}
    `,
    rejected: `
      <p style="color: #666666; font-size: 16px; line-height: 24px;">
        Thank you for your interest in AmeriLend. After careful review, we're unable to approve your loan application at this time.
      </p>
      <p style="color: #666666; font-size: 16px; line-height: 24px;">
        <strong>Application ID:</strong> #${applicationId}
      </p>
      ${additionalInfo ? `<p style="color: #666666; font-size: 16px; line-height: 24px;">${additionalInfo}</p>` : ''}
      <p style="color: #666666; font-size: 16px; line-height: 24px;">
        If you have questions, please call us at (945) 212-1609.
      </p>
    `,
    fee_pending: `
      <p style="color: #666666; font-size: 16px; line-height: 24px;">
        Your loan application has been approved! To proceed with disbursement, please pay the processing fee.
      </p>
      <p style="color: #666666; font-size: 16px; line-height: 24px;">
        <strong>Application ID:</strong> #${applicationId}<br>
        <strong>Approved Amount:</strong> ${formattedAmount}
      </p>
    `,
    fee_paid: `
      <p style="color: #666666; font-size: 16px; line-height: 24px;">
        We've received your processing fee payment. Your loan will be disbursed within 1-2 business days.
      </p>
      <p style="color: #666666; font-size: 16px; line-height: 24px;">
        <strong>Application ID:</strong> #${applicationId}<br>
        <strong>Loan Amount:</strong> ${formattedAmount}<br>
        <strong>Disbursement Time:</strong> 1-2 business days
      </p>
    `,
    disbursed: `
      <p style="color: #666666; font-size: 16px; line-height: 24px;">
        Great news! Your loan has been successfully funded and the funds should appear in your account within 24 hours.
      </p>
      <p style="color: #666666; font-size: 16px; line-height: 24px;">
        <strong>Application ID:</strong> #${applicationId}<br>
        <strong>Loan Amount:</strong> ${formattedAmount}
      </p>
      <p style="color: #666666; font-size: 16px; line-height: 24px;">
        Thank you for choosing AmeriLend!
      </p>
    `
  };

  const content = statusContent[status] || `<p style="color: #666666; font-size: 16px; line-height: 24px;">Your loan application #${applicationId} status has been updated. Please log in to your account to view the details.</p>`;

  try {
    await sgMail.send({
      to: email,
      from: {
        email: ENV.SENDGRID_FROM_EMAIL,
        name: 'AmeriLend'
      },
      subject: `AmeriLend: ${config.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 30px; border-bottom: 4px solid ${config.color};">
                      <h1 style="color: #0033A0; margin: 0 0 10px 0; font-size: 24px;">AmeriLend</h1>
                      <h2 style="color: ${config.color}; margin: 0; font-size: 20px; font-weight: 600;">${config.heading}</h2>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        Hello ${applicantName},
                      </p>
                      ${content}
                      ${status === 'approved' || status === 'fee_pending' ? `
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="https://amerilendloan.com/dashboard" style="display: inline-block; padding: 15px 40px; background-color: ${config.color}; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                              View Application
                            </a>
                          </td>
                        </tr>
                      </table>
                      ` : ''}
                      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                      <p style="color: #999999; font-size: 12px; line-height: 18px; margin: 0;">
                        Need help? Contact us at (945) 212-1609 or reply to this email.<br>
                        AmeriLend - Your Trusted Lending Partner
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      categories: ['loan-status-update', status]
    });

    console.log(`[Loan Status Email] Sent ${status} notification to ${email}`);
    return true;
  } catch (error) {
    console.error("[Loan Status Email] Failed to send:", error);
    return false;
  }
}

/**
 * Send enhanced loan status email using professional templates
 * This function sends beautifully formatted HTML emails with proper branding
 * for submitted, approved, more_info, and declined statuses.
 */
export async function sendLoanStatusEmailEnhanced(data: {
  email: string;
  status: "submitted" | "approved" | "more_info" | "declined";
  loanId: string;
  recipientName: string;
  loanAmount?: number;
  loanType?: string;
  approvalAmount?: number;
  declineReason?: string;
  additionalInfo?: string; // For more_info: what info is needed
}): Promise<boolean> {
  if (!ENV.SENDGRID_API_KEY || !ENV.SENDGRID_FROM_EMAIL) {
    console.log(
      `[Enhanced Loan Status Email] Would send to ${data.email}: Status ${data.status}`
    );
    return false;
  }

  try {
    const emailData: LoanEmailData = {
      type: data.status,
      recipientEmail: data.email,
      recipientName: data.recipientName,
      loanId: data.loanId,
      loanAmount: data.loanAmount,
      loanType: data.loanType,
      approvalAmount: data.approvalAmount,
      declineReason: data.declineReason,
      additionalInfo: data.additionalInfo,
    };

    const template = getLoanEmailTemplate(emailData);

    await sgMail.send({
      to: data.email,
      from: {
        email: ENV.SENDGRID_FROM_EMAIL,
        name: "AmeriLend",
      },
      replyTo: ENV.SENDGRID_FROM_EMAIL,
      subject: template.subject,
      html: template.html,
      text: template.text,
      categories: ["loan-status-update", data.status],
    });

    console.log(
      `[Enhanced Loan Status Email] Sent ${data.status} notification to ${data.email}`
    );
    return true;
  } catch (error) {
    console.error("[Enhanced Loan Status Email] Failed to send:", error);
    return false;
  }
}
