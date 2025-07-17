import { useState } from "react";
import { Card } from "./card";
import { Button } from "./button";
import { ChatMessage, type ChatResponse } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Shield, Brain, RotateCcw, Settings } from "lucide-react";
import { toast } from "sonner";

// Mock API call - replace with your actual API endpoint
const mockApiCall = async (message: string): Promise<Omit<ChatResponse, 'id' | 'type' | 'timestamp'>> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  const scenarios = [
    {
      content: "Your content has been analyzed and meets all compliance standards. The text appears to be original with minimal similarity to existing sources. This analysis demonstrates our advanced AI capabilities while maintaining cost efficiency through optimized processing algorithms.",
      model: "GPT-4-Compliance-v2.1",
      performanceMetrics: {
        costSaved: 0.43,
        processingTime: 1850,
        tokensUsed: 2400,
        efficiency: 94
      },
      plagiarismCheck: {
        percentage: 12,
        sources: [
          {
            url: "https://example.com/article1",
            title: "Similar Academic Paper on AI Ethics",
            similarity: 8
          },
          {
            url: "https://research.org/paper2", 
            title: "Technology Standards Documentation",
            similarity: 4
          }
        ]
      },
      complianceCheck: {
        status: 'passed' as const,
        details: [
          {
            rule: "Privacy Compliance",
            status: 'passed' as const,
            description: "No personal information detected"
          },
          {
            rule: "Content Guidelines", 
            status: 'passed' as const,
            description: "Content adheres to community standards"
          },
          {
            rule: "Copyright Check",
            status: 'passed' as const,
            description: "No copyright violations found"
          }
        ]
      }
    },
    {
      content: "",
      model: "GPT-4-Compliance-v2.1",
      performanceMetrics: {
        costSaved: 0.12,
        processingTime: 920,
        tokensUsed: 850,
        efficiency: 67
      },
      complianceCheck: {
        status: 'failed' as const,
        details: [
          {
            rule: "Privacy Compliance",
            status: 'failed' as const,
            description: "Content contains potential personal identifiable information (PII) that violates privacy standards"
          },
          {
            rule: "Content Guidelines",
            status: 'failed' as const,
            description: "Content may violate community guidelines regarding sensitive topics"
          },
          {
            rule: "Copyright Check",
            status: 'warning' as const,
            description: "Potential copyright concern detected - manual review recommended"
          }
        ]
      }
    },
    {
      content: "Your content has been processed with some considerations. The analysis shows moderate similarity to existing sources and requires attention to certain compliance aspects. Our optimized processing ensures efficient analysis while maintaining thorough verification standards.",
      model: "GPT-4-Compliance-v2.1",
      performanceMetrics: {
        costSaved: 0.28,
        processingTime: 1340,
        tokensUsed: 1950,
        efficiency: 78
      },
      plagiarismCheck: {
        percentage: 35,
        sources: [
          {
            url: "https://wikipedia.org/article",
            title: "Wikipedia Article on Related Topic",
            similarity: 22
          },
          {
            url: "https://news.com/article",
            title: "Recent News Article", 
            similarity: 13
          }
        ]
      },
      complianceCheck: {
        status: 'warning' as const,
        details: [
          {
            rule: "Privacy Compliance",
            status: 'passed' as const,
            description: "No privacy violations detected"
          },
          {
            rule: "Content Guidelines",
            status: 'warning' as const,
            description: "Content contains potentially sensitive material - review recommended"
          },
          {
            rule: "Copyright Check",
            status: 'passed' as const,
            description: "No copyright violations found"
          }
        ]
      }
    }
  ];
  const scenarioIndex = message.toLowerCase().includes('fail') ? 1 : 
                       message.toLowerCase().includes('warn') ? 2 : 0;
  return scenarios[scenarioIndex];
};

export const ComplianceChatBot = () => {
  const [messages, setMessages] = useState<ChatResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (messageContent: string) => {
    const userMessage: ChatResponse = {
      id: crypto.randomUUID(),
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await mockApiCall(messageContent);
      const assistantMessage: ChatResponse = {
        id: crypto.randomUUID(),
        type: 'assistant',
        timestamp: new Date(),
        ...response
      };
      setMessages(prev => [...prev, assistantMessage]);
      if (response.complianceCheck?.status === 'failed') {
        toast.error("Compliance check failed - content blocked");
      } else if (response.complianceCheck?.status === 'warning') {
        toast.warning("Content compliance warning - review recommended");
      } else if (response.complianceCheck?.status === 'passed') {
        toast.success("Content passed all compliance checks");
      }
    } catch (error) {
      toast.error("Failed to analyze content. Please try again.");
      console.error('API Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success("Chat history cleared");
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      {/* Header */}
      <Card className="p-4 m-4 mb-2 shadow-card border-border/50 bg-gradient-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Compliance ChatBot</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered content verification with plagiarism and compliance checking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="professional" size="sm" onClick={handleClearChat}>
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
            <Button variant="professional" size="sm">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </Card>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-4">
        {messages.length === 0 ? (
          <Card className="p-8 text-center shadow-card bg-gradient-card">
            <Brain className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Welcome to Compliance ChatBot</h3>
            <p className="text-muted-foreground mb-4">
              Send a message to analyze it for plagiarism and compliance violations. 
              Our AI will check your content against multiple compliance standards and provide detailed feedback.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded border border-border bg-background/50">
                <Shield className="h-5 w-5 text-primary mb-2" />
                <p className="font-medium">Compliance Check</p>
                <p className="text-muted-foreground">Privacy, content guidelines, and policy validation</p>
              </div>
              <div className="p-3 rounded border border-border bg-background/50">
                <Brain className="h-5 w-5 text-primary mb-2" />
                <p className="font-medium">Plagiarism Detection</p>
                <p className="text-muted-foreground">Source identification and similarity analysis</p>
              </div>
              <div className="p-3 rounded border border-border bg-background/50">
                <Settings className="h-5 w-5 text-primary mb-2" />
                <p className="font-medium">AI Model Info</p>
                <p className="text-muted-foreground">Transparency in AI processing and analysis</p>
              </div>
            </div>
          </Card>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
      </div>
      {/* Input */}
      <div className="p-4 pt-0">
        <ChatInput 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}; 