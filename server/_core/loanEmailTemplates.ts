/**
 * Loan Application Status Email Templates
 * Handles sending emails for loan application status changes:
 * - Application Submitted
 * - Application Approved
 * - More Information Requested
 * - Application Declined
 */

export type LoanEmailType = "submitted" | "approved" | "more_info" | "declined";

export interface LoanEmailData {
  type: LoanEmailType;
  recipientEmail: string;
  recipientName: string;
  loanAmount?: number;
  loanType?: string;
  loanId: string;
  applicationDate?: string;
  additionalInfo?: string; // For "more_info" type: what info is needed
  approvalAmount?: number; // For "approved" type: approved amount
  requestedAmount?: number; // For "approved" type: originally requested amount
  declineReason?: string; // For "declined" type: reason for decline
  companyLogo?: string; // URL to company logo image
  companyName?: string; // Company name (defaults to AmeriLend)
}

/**
 * Generate HTML email for loan application submitted
 */
export function getApplicationSubmittedTemplate(data: LoanEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const formattedAmount = data.loanAmount
    ? `$${data.loanAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "N/A";

  const companyName = data.companyName || "AmeriLend";
  const logoHtml = data.companyLogo 
    ? `<img src="${data.companyLogo}" alt="${companyName} Logo" style="max-width: 200px; max-height: 60px; margin-bottom: 20px;">`
    : "";

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
      .header { background: linear-gradient(135deg, #0033A0 0%, #002080 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
      .logo-section { margin-bottom: 20px; }
      .header h1 { margin: 0; font-size: 24px; }
      .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
      .info-box { background: #e8f4fd; border-left: 4px solid #0033A0; padding: 15px; margin: 20px 0; border-radius: 4px; }
      .loan-details { background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0; }
      .loan-details p { margin: 8px 0; }
      .label { font-weight: 600; color: #0033A0; display: inline-block; min-width: 120px; }
      .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; margin-top: 30px; }
      .cta-button { display: inline-block; background: #0033A0; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; margin-top: 20px; font-weight: 600; }
      .cta-button:hover { background: #002080; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        ${logoHtml ? `<div class="logo-section">${logoHtml}</div>` : ""}
        <h1>✓ Application Submitted</h1>
        <p style="margin: 10px 0 0 0;">Thank you for choosing ${companyName}</p>
      </div>

      <div class="content">
        <p>Dear ${data.recipientName},</p>

        <p>We're excited to inform you that your loan application has been successfully submitted!</p>

        <div class="info-box">
          <strong>📋 What Happens Next?</strong>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Our team will review your application thoroughly</li>
            <li>We typically make decisions within <strong>24 hours</strong></li>
            <li>You'll receive updates via email</li>
            <li>Track your application status in your <a href="https://amerilend.com/dashboard" style="color: #0033A0; text-decoration: none;">dashboard</a></li>
          </ul>
        </div>

        <div class="loan-details">
          <p><span class="label">Application ID:</span> ${data.loanId}</p>
          <p><span class="label">Loan Amount:</span> ${formattedAmount}</p>
          ${data.loanType ? `<p><span class="label">Loan Type:</span> ${data.loanType.replace(/_/g, " ")}</p>` : ""}
          ${data.applicationDate ? `<p><span class="label">Submitted:</span> ${data.applicationDate}</p>` : ""}
        </div>

        <p><strong>⏱️ Need faster processing?</strong></p>
        <p>Complete any additional information we might request immediately to speed up our review process. Check your email regularly for updates.</p>

        <p>If you have any questions, our support team is here to help:</p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>📞 Call: (945) 212-1609</li>
          <li>📧 Email: support@amerilend.com</li>
          <li>💬 Chat: Available on our website</li>
        </ul>

        <p>Best regards,<br><strong>The ${companyName} Team</strong></p>

        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
          <a href="https://amerilend.com/dashboard" style="color: #0033A0; text-decoration: none;">View Application Status</a>
        </p>
      </div>

      <div class="footer">
        <p>© 2024 ${companyName}. All rights reserved.</p>
        <p style="margin-top: 10px;">This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  </body>
</html>
  `;

  const text = `
APPLICATION SUBMITTED - THANK YOU!

Dear ${data.recipientName},

We're excited to inform you that your loan application has been successfully submitted!

WHAT HAPPENS NEXT?
• Our team will review your application thoroughly
• We typically make decisions within 24 hours
• You'll receive updates via email
• Track your application status in your dashboard at https://amerilend.com/dashboard

APPLICATION DETAILS
Application ID: ${data.loanId}
Loan Amount: ${formattedAmount}
${data.loanType ? `Loan Type: ${data.loanType.replace(/_/g, " ")}\n` : ""}${data.applicationDate ? `Submitted: ${data.applicationDate}\n` : ""}

NEED FASTER PROCESSING?
Complete any additional information we might request immediately to speed up our review process.

NEED HELP?
📞 Call: (945) 212-1609
📧 Email: support@amerilend.com

Best regards,
The ${companyName} Team

---
© 2024 ${companyName}. All rights reserved.
This is an automated message. Please do not reply to this email.
  `;

  return {
    subject: `Application Submitted - Reference #${data.loanId}`,
    html,
    text,
  };
}

/**
 * Generate HTML email for loan application approved
 */
export function getApplicationApprovedTemplate(data: LoanEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const formattedApprovedAmount = data.approvalAmount
    ? `$${data.approvalAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "N/A";

  const formattedRequestedAmount = data.requestedAmount
    ? `$${data.requestedAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "N/A";

  const companyName = data.companyName || "AmeriLend";
  const logoHtml = data.companyLogo 
    ? `<img src="${data.companyLogo}" alt="${companyName} Logo" style="max-width: 200px; max-height: 60px; margin-bottom: 20px;">`
    : "";

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
      .header { background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
      .logo-section { margin-bottom: 20px; }
      .header h1 { margin: 0; font-size: 24px; }
      .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
      .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; }
      .loan-details { background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0; }
      .loan-details p { margin: 8px 0; }
      .label { font-weight: 600; color: #28a745; display: inline-block; min-width: 120px; }
      .next-steps { background: #e8f5e9; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; }
      .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; margin-top: 30px; }
      .cta-button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; margin-top: 20px; font-weight: 600; }
      .cta-button:hover { background: #1e7e34; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        ${logoHtml ? `<div class="logo-section">${logoHtml}</div>` : ""}
        <h1>🎉 Application Approved!</h1>
        <p style="margin: 10px 0 0 0;">Congratulations! Your loan has been approved</p>
      </div>

      <div class="content">
        <p>Dear ${data.recipientName},</p>

        <div class="success-box">
          <strong>✓ Congratulations!</strong> Your loan application has been <strong>APPROVED</strong>.
        </div>

        <p>We're thrilled to inform you that your loan application has been approved! Here are the details:</p>

        <div class="loan-details">
          <p><span class="label">Application ID:</span> ${data.loanId}</p>
          ${data.requestedAmount ? `<p><span class="label">You Applied For:</span> ${formattedRequestedAmount}</p>` : ""}
          <p><span class="label">Approved Amount:</span> <strong>${formattedApprovedAmount}</strong></p>
          ${data.loanType ? `<p><span class="label">Loan Type:</span> ${data.loanType.replace(/_/g, " ")}</p>` : ""}
        </div>

        <div class="next-steps">
          <strong>📋 Next Steps:</strong>
          <ol style="margin: 10px 0; padding-left: 20px;">
            <li><strong>Review Terms:</strong> Log into your dashboard to review the complete loan agreement and terms</li>
            <li><strong>E-Sign Agreement:</strong> Electronically sign your loan agreement (takes ~5 minutes)</li>
            <li><strong>Choose Disbursement:</strong> Select how you'd like to receive your funds</li>
            <li><strong>Receive Funds:</strong> Once signed, funds are typically disbursed within 1 business day</li>
          </ol>
        </div>

        <a href="https://amerilend.com/dashboard" class="cta-button">Go to Your Dashboard</a>

        <p style="margin-top: 30px;"><strong>💡 Common Questions:</strong></p>
        <ul style="padding-left: 20px;">
          <li><strong>When will I get my money?</strong> After you e-sign the agreement, funds are typically available within 1 business day</li>
          <li><strong>What are the interest rates?</strong> Check your dashboard for complete loan terms including APR and fees</li>
          <li><strong>Can I pay early?</strong> Yes! There are no prepayment penalties</li>
        </ul>

        <p>If you have any questions, our support team is ready to help:</p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>📞 Call: (945) 212-1609</li>
          <li>📧 Email: support@amerilend.com</li>
        </ul>

        <p>Congratulations again!<br><strong>The ${companyName} Team</strong></p>
      </div>

      <div class="footer">
        <p>© 2024 ${companyName}. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
  `;

  const text = `
🎉 CONGRATULATIONS - YOUR LOAN IS APPROVED!

Dear ${data.recipientName},

We're thrilled to inform you that your loan application has been APPROVED!

APPLICATION DETAILS:
${data.requestedAmount ? `You Applied For: ${formattedRequestedAmount}\n` : ""}Approved Amount: ${formattedApprovedAmount}
Application ID: ${data.loanId}
${data.loanType ? `Loan Type: ${data.loanType.replace(/_/g, " ")}\n` : ""}

NEXT STEPS:
1. Review Terms - Log into your dashboard to review the complete loan agreement
2. E-Sign Agreement - Electronically sign your loan agreement (takes ~5 minutes)
3. Choose Disbursement - Select how you'd like to receive your funds
4. Receive Funds - Once signed, funds are typically available within 1 business day

👉 Go to Your Dashboard: https://amerilend.com/dashboard

COMMON QUESTIONS:
Q: When will I get my money?
A: After you e-sign the agreement, funds are typically available within 1 business day

Q: What are the interest rates?
A: Check your dashboard for complete loan terms including APR and fees

Q: Can I pay early?
A: Yes! There are no prepayment penalties

NEED HELP?
📞 Call: (945) 212-1609
📧 Email: support@amerilend.com

Congratulations!
The ${companyName} Team

---
© 2024 ${companyName}. All rights reserved.
  `;

  return {
    subject: `🎉 Congratulations! Your Loan Has Been Approved - ${companyName}`,
    html,
    text,
  };
}

/**
 * Generate HTML email for more information requested
 */
export function getMoreInfoRequestedTemplate(data: LoanEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
      .header { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; }
      .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
      .warning-box { background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px; }
      .info-needed { background: #ffe0b2; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px; }
      .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; margin-top: 30px; }
      .cta-button { display: inline-block; background: #ff9800; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; margin-top: 20px; font-weight: 600; }
      .cta-button:hover { background: #f57c00; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>📋 Additional Information Needed</h1>
        <p style="margin: 10px 0 0 0;">We're reviewing your application</p>
      </div>

      <div class="content">
        <p>Dear ${data.recipientName},</p>

        <p>Thank you for submitting your loan application! We're reviewing it carefully and need a bit more information to move forward.</p>

        <div class="info-needed">
          <strong>📝 Information Requested:</strong>
          <p style="margin: 10px 0 0 0;">${data.additionalInfo || "Please log into your dashboard to see the specific documents or information we need"}</p>
        </div>

        <div class="warning-box">
          <strong>⏰ Timeline:</strong> Please provide the requested information within <strong>5 business days</strong> to avoid delays in processing your application.
        </div>

        <p><strong>How to Submit Information:</strong></p>
        <ol style="padding-left: 20px;">
          <li>Log into your <a href="https://amerilend.com/dashboard" style="color: #ff9800; text-decoration: none;">AmeriLend dashboard</a></li>
          <li>Navigate to your application</li>
          <li>Upload the requested documents</li>
          <li>Submit for review</li>
        </ol>

        <a href="https://amerilend.com/dashboard" class="cta-button">Upload Documents</a>

        <p style="margin-top: 30px;"><strong>ℹ️ Important Notes:</strong></p>
        <ul style="padding-left: 20px;">
          <li>Submitting the information quickly will help us process your application faster</li>
          <li>All documents must be clear and legible</li>
          <li>We only accept recent documents (typically within 90 days)</li>
          <li>If you have questions about what we need, please contact us</li>
        </ul>

        <p>We're committed to getting you approved as quickly as possible. If you have any questions about the requested information, please don't hesitate to reach out:</p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>📞 Call: (945) 212-1609</li>
          <li>📧 Email: support@amerilend.com</li>
        </ul>

        <p>Thank you for your patience!<br><strong>The AmeriLend Team</strong></p>
      </div>

      <div class="footer">
        <p>© 2024 AmeriLend. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
  `;

  const text = `
📋 ADDITIONAL INFORMATION NEEDED

Dear ${data.recipientName},

Thank you for submitting your loan application! We're reviewing it and need more information to move forward.

REQUESTED INFORMATION:
${data.additionalInfo || "Please log into your dashboard to see the specific documents or information we need"}

⏰ IMPORTANT: Please provide the requested information within 5 BUSINESS DAYS to avoid delays.

HOW TO SUBMIT:
1. Log into your dashboard: https://amerilend.com/dashboard
2. Navigate to your application
3. Upload the requested documents
4. Submit for review

IMPORTANT NOTES:
• Submitting quickly will help us process your application faster
• All documents must be clear and legible
• We only accept recent documents (typically within 90 days)
• Contact us if you have questions

NEED HELP?
📞 Call: (945) 212-1609
📧 Email: support@amerilend.com

Thank you for your patience!
The AmeriLend Team

---
© 2024 AmeriLend. All rights reserved.
  `;

  return {
    subject: `Action Required: Additional Information Needed for Your Loan Application`,
    html,
    text,
  };
}

/**
 * Generate HTML email for loan application declined
 */
export function getApplicationDeclinedTemplate(data: LoanEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
      .header { background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; }
      .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
      .info-box { background: #ffebee; border-left: 4px solid #d32f2f; padding: 15px; margin: 20px 0; border-radius: 4px; }
      .alternatives-box { background: #f5f5f5; border-left: 4px solid #666; padding: 15px; margin: 20px 0; border-radius: 4px; }
      .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; margin-top: 30px; }
      .cta-button { display: inline-block; background: #666; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; margin-top: 20px; font-weight: 600; }
      .cta-button:hover { background: #444; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Application Decision</h1>
        <p style="margin: 10px 0 0 0;">We've completed our review of your application</p>
      </div>

      <div class="content">
        <p>Dear ${data.recipientName},</p>

        <p>Thank you for applying with AmeriLend. We appreciate the opportunity to consider your application. After careful review, we're unable to approve your loan request at this time.</p>

        <div class="info-box">
          <strong>Reason:</strong>
          <p style="margin: 10px 0 0 0;">${data.declineReason || "Based on our review of your application, we determined that this is not the right time to move forward. We encourage you to try again in the future."}</p>
        </div>

        <p><strong>What This Means:</strong></p>
        <ul style="padding-left: 20px;">
          <li>Your application has been declined for this loan request</li>
          <li>You may reapply after addressing the concerns outlined above</li>
          <li>Your personal information has been handled securely per our privacy policy</li>
        </ul>

        <div class="alternatives-box">
          <strong>💡 What You Can Do Next:</strong>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li><strong>Reapply Later:</strong> You may reapply after 30 days or if your financial situation improves</li>
            <li><strong>Alternative Solutions:</strong> Explore other lending options or products we may offer</li>
            <li><strong>Credit Building:</strong> Consider steps to improve your credit profile for future applications</li>
            <li><strong>Talk to Us:</strong> Our team can discuss options that might work better for your situation</li>
          </ul>
        </div>

        <p><strong>Questions or Concerns?</strong></p>
        <p>We value your business and would like to understand if there's anything we can help with. Our support team is available to discuss your situation:</p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>📞 Call: (945) 212-1609</li>
          <li>📧 Email: support@amerilend.com</li>
        </ul>

        <p><strong>Your Rights:</strong></p>
        <ul style="padding-left: 20px; font-size: 12px;">
          <li>You have the right to know why your application was declined</li>
          <li>You have the right to see a copy of your credit report</li>
          <li>You may dispute inaccuracies on your credit report</li>
        </ul>

        <p>We appreciate your interest in AmeriLend and wish you all the best.<br><strong>The AmeriLend Team</strong></p>
      </div>

      <div class="footer">
        <p>© 2024 AmeriLend. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
  `;

  const text = `
APPLICATION DECISION

Dear ${data.recipientName},

Thank you for applying with AmeriLend. After careful review, we're unable to approve your loan request at this time.

REASON FOR DECLINE:
${data.declineReason || "Based on our review of your application, we determined that this is not the right time to move forward. We encourage you to try again in the future."}

WHAT THIS MEANS:
• Your application has been declined for this loan request
• You may reapply after addressing the concerns outlined above
• Your personal information has been handled securely per our privacy policy

WHAT YOU CAN DO NEXT:
• Reapply Later: You may reapply after 30 days or if your financial situation improves
• Alternative Solutions: Explore other lending options or products we may offer
• Credit Building: Consider steps to improve your credit profile for future applications
• Talk to Us: Our team can discuss options that might work better for your situation

QUESTIONS OR CONCERNS?
We value your business. Contact our support team to discuss your situation:
📞 Call: (945) 212-1609
📧 Email: support@amerilend.com

YOUR RIGHTS:
• You have the right to know why your application was declined
• You have the right to see a copy of your credit report
• You may dispute inaccuracies on your credit report

We appreciate your interest in AmeriLend and wish you all the best.
The AmeriLend Team

---
© 2024 AmeriLend. All rights reserved.
  `;

  return {
    subject: `Application Decision - AmeriLend`,
    html,
    text,
  };
}

/**
 * Get template based on email type
 */
export function getLoanEmailTemplate(data: LoanEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  switch (data.type) {
    case "submitted":
      return getApplicationSubmittedTemplate(data);
    case "approved":
      return getApplicationApprovedTemplate(data);
    case "more_info":
      return getMoreInfoRequestedTemplate(data);
    case "declined":
      return getApplicationDeclinedTemplate(data);
    default:
      throw new Error(`Unknown email type: ${data.type}`);
  }
}
