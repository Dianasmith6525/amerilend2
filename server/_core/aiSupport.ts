/**
 * AI Support System
 * Handles automated customer support using LLM
 */

import { invokeLLM } from "./llm";
import * as db from "../db";
import { LoanApplication } from "../../drizzle/schema";

export type SupportContext = {
  userId?: number;
  userEmail?: string;
  loanApplicationId?: number;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
};

export type SupportResponse = {
  message: string;
  suggestions?: string[];
  actionRequired?: {
    type: "redirect" | "contact" | "documentation";
    target: string;
    description: string;
  };
};

/**
 * Get system prompt for AI support with empathy and transparency
 */
function getSystemPrompt(): string {
  return `You are AmeriLend's empathetic support partner. Your mission is to reduce customer stress through transparency, education, and genuine care.

**ACCESS LEVELS - FOLLOW THESE STRICTLY:**
IMPORTANT: You have context about the user's access level. Respect privacy boundaries:
- AUTHENTICATED USERS: You have access to their full dashboard data (all loans, payments, documents, personal info). Use this to provide personalized support.
- NON-AUTHENTICATED USERS: You can ONLY discuss general service information and public application status if they provide reference number and email. DO NOT ask for or share sensitive personal data.

**Your Core Approach (CRITICAL):**
1. ACKNOWLEDGE their situation first ("I see you submitted your application on Monday")
2. VALIDATE their feelings ("Waiting for approval can feel uncertain - that's completely normal")
3. PROVIDE CLARITY with context ("Here's exactly where we are and what happens next")
4. OFFER CONTROL ("Here are your options right now")
5. BUILD CONFIDENCE ("Based on similar applications, you should hear back within 2-3 business days")

**Services:**
- Personal loans: $500-$100,000
- Max APR: 195%
- Same-day funding (if approved before 12 PM CT)
- Payment: Credit/Debit cards, Crypto (BTC, ETH, USDT, USDC)
- Processing fees: 1.5%-2.5%

**Contact:**
- Phone: (945) 212-1609
- Email: support@amerilendloan.com

**Loan Statuses & Customer Comfort Tips:**
- pending → "Your application received and being prepared for review"
- under_review → "Our team is actively looking at your application"
- approved → "Congratulations! You're approved. Here's what happens now..."
- fee_pending → "One more step: the processing fee ensures we can fund you quickly"
- fee_paid → "Great! Your application is now prioritized for immediate disbursement"
- disbursed → "Your funds are on the way to your account"
- rejected → "Unfortunately we can't approve this time, but here's why and what to do next"

**Stress-Reducing Communication Rules:**
✓ ALWAYS explain the "why" behind requirements (not just "we need X", but "we need X to verify your income and protect both of us")
✓ ALWAYS provide realistic timelines BACKED BY DATA ("Most approvals at your stage come through in 2-3 business days")
✓ ALWAYS show progress, never dead ends ("While we review, here's what you can prepare...")
✓ ALWAYS end with actionable next steps ("Here's exactly what to do right now...")
✓ NEVER be robotic or scripted - vary your language naturally
✓ NEVER repeat information already said - reference "As I mentioned earlier..."
✓ NEVER use generic phrases - personalize to their situation

**Instead Of This → Say This:**
- "Your application is pending" → "Your application is being carefully reviewed. Most approvals at this stage take 2-3 business days"
- "We need your bank statement" → "We need your recent bank statement to verify your income - this helps us process your approval faster"
- "Your loan was declined" → "Unfortunately we can't approve this time because [specific reason]. Here's how to strengthen your application for next time..."
- "Payment failed" → "I see the payment didn't go through. Let me help you troubleshoot - what payment method were you using?"
- "Waiting for approval" → "Your application is in great hands. Here's what's happening behind the scenes and when you should expect to hear from us..."

**Empathy Triggers (Use When Relevant):**
- Customer mentions waiting/frustration → Acknowledge frustration, provide timeline, show progress
- Customer mentions rejection → Validate disappointment, offer rebuild path, show support
- Customer mentions urgency/stress → Acknowledge need, explain process, prioritize them
- Customer repeating question → Show you listened, avoid repetition, add new helpful info

**Tone Requirements:**
- Warm and genuine (not corporate/cold)
- Competent and confident (customer should feel in good hands)
- Transparent (explain everything fully)
- Respectful (their time and concerns matter)
- Encouraging (they can do this)

**NEVER:**
- Ask for SSN, passwords, or card numbers
- Promise specific timelines you can't guarantee
- Be dismissive of concerns
- Use script-like phrases repeatedly
- Make customers feel judged or uncertain
- Share personal data with non-authenticated users
- Discuss payment methods or account details with users not logged in
- Allow non-authenticated users to access other people's information

**PRIVACY & SECURITY RULES (CRITICAL):**
IF user is NOT logged in (Non-Authenticated):
✓ You can discuss general loan process and requirements
✓ You can help with application questions
✓ You can discuss public service information
✓ You MUST ask them to log in or use reference number + email to check status
✗ Do NOT discuss their personal profile details
✗ Do NOT share payment history without authentication
✗ Do NOT discuss their documents or verification status without authentication
✗ Do NOT refer to specific payment amounts or account numbers

IF user IS logged in (Authenticated):
✓ You have full access to their dashboard data
✓ Discuss all their loans, payments, and account details
✓ Reference their specific applications and status
✓ Provide personalized recommendations based on their history
✓ Discuss documents, verification, and disbursement details

**For Non-Authenticated Users - Response Template:**
"I'd love to help! To access your account details, you can:
1. Log in to your AmeriLend account at [login page]
2. Use our public status check with your application reference number and email
3. Call our support team at (945) 212-1609 for immediate assistance"

Remember: Your job is to reduce customer stress while protecting their privacy. Happy, secure customers are loyal customers.`;
}

/**
 * Generate contextual information based on user data with empathy focus
 */
async function getContextualInfo(context: SupportContext): Promise<string> {
  let contextInfo = "";
  
  // Check if user is authenticated
  const isAuthenticated = !!context.userId;

  // ============================================================================
  // AUTHENTICATED USER - FULL DATA ACCESS
  // ============================================================================
  if (isAuthenticated && context.userId) {
    // Get user profile
    const user = await db.getUserById(context.userId);
    if (user) {
      contextInfo += `\n\n**Customer Profile:**`;
      contextInfo += `\n- Name: ${user.name || 'N/A'}`;
      contextInfo += `\n- Email: ${user.email}`;
      contextInfo += `\n- Account Created: ${new Date(user.createdAt).toLocaleDateString('en-US')}`;
      contextInfo += `\n- Member Duration: ${Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days`;
    }

    // Get ALL user's loan applications
    const allApplications = await db.getLoanApplicationsByUserId(context.userId);
    if (allApplications && allApplications.length > 0) {
      contextInfo += `\n\n**Complete Loan History:**`;
      contextInfo += `\n- Total Applications: ${allApplications.length}`;
      
      const approved = allApplications.filter(a => a.status === "approved" || a.status === "fee_paid" || a.status === "disbursed").length;
      const disbursed = allApplications.filter(a => a.status === "disbursed").length;
      const pending = allApplications.filter(a => a.status === "pending" || a.status === "under_review").length;
      const rejected = allApplications.filter(a => a.status === "rejected").length;
      
      if (approved > 0) {
        contextInfo += `\n- Approved: ${approved}`;
      }
      if (disbursed > 0) {
        contextInfo += `\n- Successfully Disbursed: ${disbursed}`;
      }
      if (pending > 0) {
        contextInfo += `\n- Pending Review: ${pending}`;
      }
      if (rejected > 0) {
        contextInfo += `\n- Rejected/Declined: ${rejected}`;
      }
      
      contextInfo += `\n- Success Rate: ${Math.round((approved / allApplications.length) * 100)}%`;

      // Show most recent application details
      const mostRecent = allApplications[allApplications.length - 1];
      contextInfo += `\n\n**Most Recent Application:**`;
      contextInfo += `\n- Reference: ${mostRecent.applicationReferenceNumber}`;
      contextInfo += `\n- Status: ${mostRecent.status}`;
      contextInfo += `\n- Amount Requested: $${(mostRecent.requestedAmount / 100).toFixed(2)}`;
      if (mostRecent.approvedAmount) {
        contextInfo += `\n- Amount Approved: $${(mostRecent.approvedAmount / 100).toFixed(2)}`;
      }
      contextInfo += `\n- Submitted: ${new Date(mostRecent.createdAt).toLocaleDateString('en-US')}`;
      contextInfo += `\n- Days in Process: ${Math.floor((Date.now() - new Date(mostRecent.createdAt).getTime()) / (1000 * 60 * 60 * 24))}`;
    }

    // Get payments for authenticated user
    const allPayments = await db.getPaymentsByUserId(context.userId);
    if (allPayments && allPayments.length > 0) {
      contextInfo += `\n\n**Payment History:**`;
      contextInfo += `\n- Total Payments: ${allPayments.length}`;
      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
      contextInfo += `\n- Total Amount Paid: $${(totalPaid / 100).toFixed(2)}`;
      
      const successful = allPayments.filter(p => p.status === "succeeded").length;
      contextInfo += `\n- Successful Payments: ${successful}`;
      
      const pending = allPayments.filter(p => p.status === "pending").length;
      if (pending > 0) {
        contextInfo += `\n- Pending Payments: ${pending}`;
      }

      // Show recent payment
      const lastPayment = allPayments[allPayments.length - 1];
      contextInfo += `\n- Last Payment: $${(lastPayment.amount / 100).toFixed(2)} on ${new Date(lastPayment.createdAt).toLocaleDateString('en-US')}`;
    }

    // Get current application details if specified
    if (context.loanApplicationId) {
      const application = await db.getLoanApplicationById(context.loanApplicationId);
      if (application && application.userId === context.userId) {
        contextInfo += `\n\n**Current Loan Application Context:**`;
        contextInfo += `\n- Application ID: #${application.id}`;
        contextInfo += `\n- Reference Number: ${application.applicationReferenceNumber}`;
        contextInfo += `\n- Status: ${application.status}`;
        contextInfo += `\n- Submitted: ${new Date(application.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        contextInfo += `\n- Days Pending: ${Math.floor((Date.now() - new Date(application.createdAt).getTime()) / (1000 * 60 * 60 * 24))}`;
        contextInfo += `\n- Requested Amount: $${(application.requestedAmount / 100).toFixed(2)}`;
        
        if (application.approvedAmount) {
          contextInfo += `\n- Approved Amount: $${(application.approvedAmount / 100).toFixed(2)}`;
        }
        
        if (application.processingFeeAmount) {
          contextInfo += `\n- Processing Fee: $${(application.processingFeeAmount / 100).toFixed(2)}`;
        }

        if (application.identityVerificationStatus) {
          contextInfo += `\n- Identity Verification: ${application.identityVerificationStatus}`;
        }
        
        // Add comprehensive status context
        contextInfo += `\n\n**Status Details:**`;
        if (application.status === "under_review") {
          contextInfo += `\n- Application is actively being reviewed by our team`;
          contextInfo += `\n- Typical Timeline: 2-4 business days for approval decision`;
          contextInfo += `\n- What's Happening: Our team is verifying your information and assessing eligibility`;
        } else if (application.status === "approved" || application.status === "fee_pending") {
          contextInfo += `\n- APPROVED! Congratulations!`;
          contextInfo += `\n- Next Step: Pay processing fee ($${(application.processingFeeAmount! / 100).toFixed(2)}) to unlock immediate disbursement`;
          contextInfo += `\n- After Payment: Funds disbursed within 24 hours`;
        } else if (application.status === "fee_paid") {
          contextInfo += `\n- Payment confirmed! Application prioritized for disbursement`;
          contextInfo += `\n- Next Step: Our team is preparing your funds for transfer`;
          contextInfo += `\n- Typical Timeline: Within 24 hours of payment confirmation`;
        } else if (application.status === "disbursed") {
          contextInfo += `\n- Funds successfully disbursed!`;
          contextInfo += `\n- Disbursed Date: ${application.disbursedAt ? new Date(application.disbursedAt).toLocaleDateString() : 'N/A'}`;
          contextInfo += `\n- Next Step: Monitor your bank account for incoming funds`;
        } else if (application.status === "rejected") {
          contextInfo += `\n- Application could not be approved at this time`;
          if (application.rejectionReason) {
            contextInfo += `\n- Reason: ${application.rejectionReason}`;
          }
          contextInfo += `\n- Next Steps: Address the concerns and reapply in 30 days, or speak with support`;
        }
      }
    }
  }
  // ============================================================================
  // NON-AUTHENTICATED USER - LIMITED PUBLIC ACCESS ONLY
  // ============================================================================
  else {
    // Non-authenticated users can only see general service information
    contextInfo += `\n\n**User Status: Not Logged In**`;
    contextInfo += `\n- Access Level: Limited (General Service Information)`;
    contextInfo += `\n- To view your loan details, payment history, and documents, please log in to your account`;
    
    // Only show loan details if they have reference number and email for public status check
    if (context.userEmail) {
      contextInfo += `\n\n**Limited Access - Email Verified:** ${context.userEmail}`;
      contextInfo += `\n- Can check application status using reference number`;
      contextInfo += `\n- Cannot access full payment history or personal details`;
      
      // If they provided a specific loan application ID (from public status check), add that
      if (context.loanApplicationId) {
        const application = await db.getLoanApplicationById(context.loanApplicationId);
        if (application && application.email.toLowerCase() === context.userEmail.toLowerCase()) {
          contextInfo += `\n\n**Public Application Status:**`;
          contextInfo += `\n- Reference: ${application.applicationReferenceNumber}`;
          contextInfo += `\n- Status: ${application.status}`;
          contextInfo += `\n- Requested Amount: $${(application.requestedAmount / 100).toFixed(2)}`;
          if (application.approvedAmount) {
            contextInfo += `\n- Approved Amount: $${(application.approvedAmount / 100).toFixed(2)}`;
          }
        }
      }
    }
  }

  return contextInfo;
}

/**
 * Analyze user query to determine intent
 */
function analyzeIntent(query: string): {
  category: string;
  needsAuthentication: boolean;
  suggestedActions: string[];
} {
  const lowerQuery = query.toLowerCase();
  
  // Status check intent
  if (lowerQuery.includes("status") || lowerQuery.includes("application") || lowerQuery.includes("where is")) {
    return {
      category: "status_check",
      needsAuthentication: true,
      suggestedActions: ["Check Application Status", "View Dashboard"]
    };
  }
  
  // Payment intent
  if (lowerQuery.includes("payment") || lowerQuery.includes("fee") || lowerQuery.includes("pay")) {
    return {
      category: "payment",
      needsAuthentication: false,
      suggestedActions: ["View Payment Methods", "Pay Processing Fee"]
    };
  }
  
  // Application process
  if (lowerQuery.includes("apply") || lowerQuery.includes("how to") || lowerQuery.includes("requirement")) {
    return {
      category: "application_process",
      needsAuthentication: false,
      suggestedActions: ["Start Application", "View Requirements"]
    };
  }
  
  // Account questions
  if (lowerQuery.includes("account") || lowerQuery.includes("login") || lowerQuery.includes("password")) {
    return {
      category: "account",
      needsAuthentication: false,
      suggestedActions: ["Login", "Reset Password"]
    };
  }
  
  // Contact/support
  if (lowerQuery.includes("contact") || lowerQuery.includes("speak") || lowerQuery.includes("human")) {
    return {
      category: "contact_support",
      needsAuthentication: false,
      suggestedActions: ["Call Support", "Send Email"]
    };
  }
  
  return {
    category: "general",
    needsAuthentication: false,
    suggestedActions: ["Browse FAQs", "Start Application"]
  };
}

/**
 * Analyze sentiment to detect stress/frustration
 */
function analyzeSentiment(query: string): { isFrustrated: boolean; isUrgent: boolean; needsEmpathy: boolean } {
  const lowerQuery = query.toLowerCase();
  
  const frustrationKeywords = ["why", "how long", "still waiting", "not working", "problem", "issue", "why hasn't", "frustrated", "angry", "upset", "not fair", "ridiculous"];
  const urgencyKeywords = ["urgent", "asap", "right now", "immediately", "emergency", "need soon", "critical", "today"];
  const empathyKeywords = ["waiting", "worried", "concerned", "anxious", "stressed", "unsure", "confused", "help", "support"];
  
  return {
    isFrustrated: frustrationKeywords.some(kw => lowerQuery.includes(kw)),
    isUrgent: urgencyKeywords.some(kw => lowerQuery.includes(kw)),
    needsEmpathy: empathyKeywords.some(kw => lowerQuery.includes(kw))
  };
}

/**
 * Generate AI support response with empathy and emotional intelligence
 */
export async function generateSupportResponse(
  userQuery: string,
  context: SupportContext = {}
): Promise<SupportResponse> {
  try {
    // Analyze user intent and sentiment
    const intent = analyzeIntent(userQuery);
    const sentiment = analyzeSentiment(userQuery);
    
    // Get contextual information
    const contextualInfo = await getContextualInfo(context);
    
    // Build sentiment context for the AI
    let sentimentContext = "";
    if (sentiment.isFrustrated) {
      sentimentContext += "\n\n**IMPORTANT: Customer appears frustrated. Acknowledge their frustration, apologize for any inconvenience, and provide extra reassurance with specific timelines and next steps.**";
    }
    if (sentiment.needsEmpathy) {
      sentimentContext += "\n\n**IMPORTANT: Customer appears stressed or worried. Lead with empathy and reassurance. Be warm, human, and supportive.**";
    }
    if (sentiment.isUrgent) {
      sentimentContext += "\n\n**IMPORTANT: Customer has urgent needs. Prioritize speed, be clear about timelines, and offer immediate next steps. Consider escalation to human support if needed.**";
    }
    
    // Build conversation messages
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: getSystemPrompt() + contextualInfo + sentimentContext }
    ];
    
    // Add conversation history if available (limit to last 8 messages for better context)
    if (context.conversationHistory && context.conversationHistory.length > 0) {
      const recentHistory = context.conversationHistory.slice(-8);
      messages.push(...recentHistory);
    }
    
    // Add current user query
    messages.push({ role: "user", content: userQuery });
    
    // Get AI response
    const response = await invokeLLM({
      messages,
      maxTokens: 350, // Slightly increased to allow for empathetic responses
    });
    
    const aiMessage = response.choices[0]?.message?.content;
    
    if (!aiMessage || typeof aiMessage !== 'string') {
      throw new Error("Invalid AI response");
    }
    
    // Determine action required based on intent
    let actionRequired;
    
    // Escalate to human if customer is very frustrated or urgent
    if ((sentiment.isFrustrated || sentiment.isUrgent) && intent.needsAuthentication && !context.userId) {
      actionRequired = {
        type: "contact" as const,
        target: "tel:945-212-1609",
        description: "Speak with a support representative who can help you immediately"
      };
    } else if (intent.category === "status_check" && intent.needsAuthentication && !context.userId) {
      actionRequired = {
        type: "redirect" as const,
        target: "/login",
        description: "Please log in to check your application status"
      };
    } else if (intent.category === "payment") {
      actionRequired = {
        type: "redirect" as const,
        target: "/payment",
        description: "View payment options and methods"
      };
    } else if (intent.category === "contact_support") {
      actionRequired = {
        type: "contact" as const,
        target: "tel:945-212-1609",
        description: "Speak with a support representative"
      };
    }
    
    return {
      message: aiMessage,
      suggestions: intent.suggestedActions,
      actionRequired
    };
    
  } catch (error) {
    console.error("AI Support Error:", error);
    
    // Empathetic fallback response
    return {
      message: "I apologize - I'm having trouble right now, but that doesn't mean we're leaving you hanging. Our support team at (945) 212-1609 can help you immediately. You can also email support@amerilendloan.com. We're here to help!",
      suggestions: ["Call Support: (945) 212-1609", "Email: support@amerilendloan.com", "Visit FAQs"],
      actionRequired: {
        type: "contact",
        target: "tel:945-212-1609",
        description: "Contact support for assistance"
      }
    };
  }
}

/**
 * Get suggested questions based on user context
 */
export function getSuggestedQuestions(context: SupportContext): string[] {
  const suggestions: string[] = [
    "How do I apply for a loan?",
    "What payment methods do you accept?",
    "How long does approval take?"
  ];
  
  if (context.loanApplicationId) {
    suggestions.unshift("What is my loan application status?");
    suggestions.push("When will I receive my funds?");
  }
  
  if (!context.userId) {
    suggestions.push("How do I create an account?");
  }
  
  return suggestions;
}

/**
 * Track support conversation
 */
export async function trackSupportConversation(
  userId: number | undefined,
  userQuery: string,
  aiResponse: string,
  category: string
): Promise<void> {
  try {
    // TODO: Store conversation in database for analytics and improvement
    console.log("Support Conversation:", {
      userId,
      category,
      query: userQuery.substring(0, 100),
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Error tracking conversation:", error);
  }
}
