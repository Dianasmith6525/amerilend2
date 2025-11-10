import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Sparkles, MessageCircle, X, ExternalLink, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

export type AISupportChatProps = {
  /**
   * Optional loan application ID for context
   */
  loanApplicationId?: number;
  
  /**
   * Show as floating chat widget (default) or embedded
   */
  mode?: "floating" | "embedded";
  
  /**
   * Custom className
   */
  className?: string;
};

/**
 * AI-powered support chat component
 * Provides automated customer support with context-aware responses
 */
export function AISupportChat({
  loanApplicationId,
  mode = "floating",
  className,
}: AISupportChatProps) {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(mode === "embedded");
  
  // Different initial messages based on authentication
  const getInitialMessage = (): string => {
    if (isAuthenticated && user) {
      return `👋 Hi ${user.name || 'there'}! I'm your AmeriLend AI assistant. I have access to your full account dashboard. How can I help you today?`;
    } else {
      return `👋 Hi! I'm your AmeriLend AI assistant. I can help with general loan questions and public information. To access your account details, please log in. How can I help?`;
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: getInitialMessage()
    }
  ]);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);

  // Get suggested questions
  const { data: suggestions } = trpc.aiSupport.getSuggestions.useQuery(
    { loanApplicationId },
    { enabled: isOpen }
  );

  // Chat mutation
  const chatMutation = trpc.aiSupport.chat.useMutation({
    onSuccess: (response) => {
      const assistantMessage: Message = {
        role: "assistant",
        content: response.message
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update conversation history with limit
      setConversationHistory(prev => {
        const updated = [...prev, { role: "assistant" as const, content: response.message }];
        return updated.slice(-6);
      });

      // Handle action required
      if (response.actionRequired) {
        setTimeout(() => {
          if (response.actionRequired?.type === "redirect") {
            toast.info(response.actionRequired.description, {
              action: {
                label: "Go",
                onClick: () => window.location.href = response.actionRequired!.target
              }
            });
          } else if (response.actionRequired?.type === "contact") {
            toast.info(response.actionRequired.description, {
              action: {
                label: "Contact",
                onClick: () => window.open(response.actionRequired!.target, "_blank")
              }
            });
          }
        }, 500);
      }
    },
    onError: (error) => {
      // Check if it's a configuration error
      const errorMessage = error.message || "";
      if (errorMessage.includes("AI Support is not configured") || errorMessage.includes("BUILT_IN_FORGE_API_KEY")) {
        toast.error("AI Support needs configuration", {
          description: "Please contact support to enable AI chat features.",
          duration: 5000
        });
        
        // Add a message to the chat
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "⚠️ AI Support is currently not configured. Please contact our support team for assistance:\n\n📞 Call: 1-800-AMERILEND\n📧 Email: support@amerilendloan.com"
        }]);
      } else {
        toast.error("Failed to get response. Please try again.");
      }
      console.error("AI Support error:", error);
    }
  });

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      role: "user",
      content
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Limit conversation history to last 6 messages to prevent repetition
    setConversationHistory(prev => {
      const updated = [...prev, { role: "user" as const, content }];
      return updated.slice(-6);
    });

    chatMutation.mutate({
      message: content,
      loanApplicationId,
      conversationHistory
    });
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  // Floating chat widget
  if (mode === "floating") {
    return (
      <>
        {/* Chat Widget Button - Mobile Responsive */}
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 z-50 flex-shrink-0"
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}

        {/* Chat Widget - Mobile Responsive */}
        {isOpen && (
          <>
            {/* Mobile: Full screen backdrop overlay */}
            <div 
              className="fixed inset-0 bg-black/30 z-40 sm:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Chat Card - Desktop: Fixed position, Mobile: Center overlay */}
            <Card className="fixed z-50 shadow-2xl flex flex-col bg-white
              /* Mobile: Full screen with safe area */ 
              bottom-0 left-0 right-0 top-0 sm:top-auto sm:bottom-6 sm:right-6 sm:left-auto
              w-full sm:w-96
              h-screen sm:h-[600px]
              rounded-none sm:rounded-lg
            ">
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-none sm:rounded-t-lg flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Sparkles className="h-5 w-5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">AI Support</h3>
                    <p className="text-xs opacity-90 truncate">
                      {isAuthenticated ? "✓ Full account access" : "Limited access • Log in"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 flex-shrink-0 ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Chat Area - Responsive */}
              <div className="flex-1 overflow-hidden">
                <AIChatBox
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={chatMutation.isPending}
                  placeholder="Ask me anything..."
                  height="100%"
                  suggestedPrompts={suggestions}
                />
              </div>

              {/* Footer with quick actions - Mobile optimized */}
              <div className="p-2 sm:p-3 border-t bg-muted/30 flex-shrink-0">
                <div className="flex gap-1 sm:gap-2 text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 px-2 sm:px-3 h-9 sm:h-10"
                    onClick={() => window.location.href = "tel:945-212-1609"}
                  >
                    <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="hidden sm:inline">Call</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 px-2 sm:px-3 h-9 sm:h-10"
                    onClick={() => window.location.href = "mailto:support@amerilendloan.com"}
                  >
                    <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="hidden sm:inline">Email</span>
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </>
    );
  }

  // Embedded mode - Mobile responsive
  return (
    <Card className={`${className} w-full overflow-hidden`}>
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base sm:text-lg truncate">AI Support Assistant</h3>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {isAuthenticated ? "✓ Full account access" : "General support"}
          </p>
        </div>
        <Badge variant="secondary" className={`flex-shrink-0 ${isAuthenticated ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
          <span className={`h-2 w-2 rounded-full mr-2 ${isAuthenticated ? "bg-green-500" : "bg-blue-500"} animate-pulse`} />
          <span className="text-xs">{isAuthenticated ? "Auth" : "Guest"}</span>
        </Badge>
      </div>

      {/* Suggested Questions - Mobile optimized */}
      {messages.length <= 1 && suggestions && suggestions.length > 0 && (
        <div className="p-2 sm:p-4 border-b bg-muted/30">
          <p className="text-xs sm:text-sm font-medium mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {suggestions.slice(0, 4).map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedQuestion(question)}
                className="text-xs flex-shrink-0"
              >
                {question.length > 20 ? question.substring(0, 20) + "..." : question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Area - Responsive height */}
      <AIChatBox
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={chatMutation.isPending}
        placeholder="Ask your question..."
        height="500px"
        suggestedPrompts={suggestions}
      />

      {/* Contact Options - Mobile stack vertical on small screens */}
      <div className="p-2 sm:p-4 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground mb-2">Need more help?</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "tel:945-212-1609"}
            className="flex-1 text-xs sm:text-sm"
          >
            <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
            <span className="truncate">Call</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "mailto:support@amerilendloan.com"}
            className="flex-1 text-xs sm:text-sm"
          >
            <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
            <span className="truncate">Email</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
