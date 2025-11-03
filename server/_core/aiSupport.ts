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
 * Get system prompt for AI support
 */
function getSystemPrompt(): string {
  return `You are AmeriLend's friendly AI assistant. Help customers naturally and conversationally.

**Services:**
- Personal loans: $500-$100,000
- Max APR: 195%
- Same-day funding (if approved before 12 PM CT)
- Payment: Credit/Debit cards, Crypto (BTC, ETH, USDT, USDC)
- Processing fees: 1.5%-2.5%

**Contact:**
- Phone: (945) 212-1609
- Email: support@amerilend.com

**Loan Statuses:**
- pending → under_review → approved → fee_pending → fee_paid → disbursed
- Or: rejected/withdrawn

**Rules:**
- Be conversational and helpful, not robotic
- Keep responses brief (2-3 sentences max unless asked for details)
- Never repeat information already said in the conversation
- If you already answered something, say "As I mentioned earlier..." and be brief
- NEVER ask for SSN, passwords, or card numbers
- For sensitive issues, direct to human support
- Vary your language - don't use the same phrases repeatedly

Remember: You're having a conversation, not giving a scripted response each time.`;
}

/**
 * Generate contextual information based on user data
 */
async function getContextualInfo(context: SupportContext): Promise<string> {
  let contextInfo = "";

  // Get loan application details if available
  if (context.loanApplicationId) {
    const application = await db.getLoanApplicationById(context.loanApplicationId);
    if (application) {
      contextInfo += `\n\n**Current Loan Application Context:**`;
      contextInfo += `\n- Application ID: #${application.id}`;
      contextInfo += `\n- Status: ${application.status}`;
      contextInfo += `\n- Requested Amount: $${(application.requestedAmount / 100).toFixed(2)}`;
      
      if (application.approvedAmount) {
        contextInfo += `\n- Approved Amount: $${(application.approvedAmount / 100).toFixed(2)}`;
      }
      
      if (application.processingFeeAmount) {
        contextInfo += `\n- Processing Fee: $${(application.processingFeeAmount / 100).toFixed(2)}`;
      }
      
      if (application.status === "approved" || application.status === "fee_pending") {
        contextInfo += `\n- Next Step: Pay processing fee to proceed with disbursement`;
      } else if (application.status === "fee_paid") {
        contextInfo += `\n- Next Step: Awaiting disbursement by our team`;
      } else if (application.status === "disbursed") {
        contextInfo += `\n- Funds have been disbursed to your account`;
      }
    }
  }

  // Get user's loan history if userId is available
  if (context.userId) {
    const applications = await db.getLoanApplicationsByUserId(context.userId);
    if (applications && applications.length > 0) {
      contextInfo += `\n\n**Loan History:**`;
      contextInfo += `\n- Total Applications: ${applications.length}`;
      
      const statuses = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      contextInfo += `\n- Status Summary: ${JSON.stringify(statuses)}`;
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
 * Generate AI support response
 */
export async function generateSupportResponse(
  userQuery: string,
  context: SupportContext = {}
): Promise<SupportResponse> {
  try {
    // Analyze user intent
    const intent = analyzeIntent(userQuery);
    
    // Get contextual information
    const contextualInfo = await getContextualInfo(context);
    
    // Build conversation messages
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: getSystemPrompt() + contextualInfo }
    ];
    
    // Add conversation history if available (limit to last 6 messages to prevent repetition)
    if (context.conversationHistory && context.conversationHistory.length > 0) {
      const recentHistory = context.conversationHistory.slice(-6);
      messages.push(...recentHistory);
    }
    
    // Add current user query
    messages.push({ role: "user", content: userQuery });
    
    // Get AI response
    const response = await invokeLLM({
      messages,
      maxTokens: 300, // Reduced to encourage concise responses
    });
    
    const aiMessage = response.choices[0]?.message?.content;
    
    if (!aiMessage || typeof aiMessage !== 'string') {
      throw new Error("Invalid AI response");
    }
    
    // Determine action required based on intent
    let actionRequired;
    
    if (intent.category === "status_check" && intent.needsAuthentication && !context.userId) {
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
    
    // Fallback response
    return {
      message: "I apologize, but I'm having trouble processing your request right now. Please contact our support team at (945) 212-1609 or email support@amerilend.com for immediate assistance.",
      suggestions: ["Call Support: (945) 212-1609", "Email: support@amerilend.com", "Visit FAQs"],
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
