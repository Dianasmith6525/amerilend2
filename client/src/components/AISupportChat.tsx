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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your AmeriLend AI assistant. How can I help you today?"
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
          content: "⚠️ AI Support is currently not configured. Please contact our support team for assistance:\n\n📞 Call: 1-800-AMERILEND\n📧 Email: support@amerilend.com"
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
        {/* Chat Widget Button */}
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 z-50"
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}

        {/* Chat Widget */}
        {isOpen && (
          <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">AI Support</h3>
                  <p className="text-xs opacity-90">Always here to help</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Area */}
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

            {/* Footer with quick actions */}
            <div className="p-3 border-t bg-muted/30">
              <div className="flex gap-2 text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.location.href = "tel:945-212-1609"}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.location.href = "mailto:support@amerilend.com"}
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Button>
              </div>
            </div>
          </Card>
        )}
      </>
    );
  }

  // Embedded mode
  return (
    <Card className={className}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">AI Support Assistant</h3>
          <p className="text-sm text-muted-foreground">
            Get instant answers to your questions
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          Online
        </Badge>
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && suggestions && suggestions.length > 0 && (
        <div className="p-4 border-b bg-muted/30">
          <p className="text-sm font-medium mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 4).map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedQuestion(question)}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <AIChatBox
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={chatMutation.isPending}
        placeholder="Ask me anything about your loan application..."
        height="500px"
        suggestedPrompts={suggestions}
      />

      {/* Contact Options */}
      <div className="p-4 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground mb-2">
          Need more help? Contact our support team:
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "tel:945-212-1609"}
          >
            <Phone className="h-3 w-3 mr-2" />
            Call (945) 212-1609
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "mailto:support@amerilend.com"}
          >
            <Mail className="h-3 w-3 mr-2" />
            Email Support
          </Button>
        </div>
      </div>
    </Card>
  );
}
