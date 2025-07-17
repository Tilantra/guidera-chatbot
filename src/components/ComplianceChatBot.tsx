import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatMessage, type ChatResponse, type PerformanceMetrics } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { PromptGenerator } from "./PromptGenerator";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { CompliancePolicyManager } from "./CompliancePolicyManager";
import { ThemeToggle } from "./ThemeToggle";
import { LoadingIndicator } from "./LoggingIndicator";
import { Shield, Brain, RotateCcw, Settings, MessageSquare, Wand2, Bot, BarChart3, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import GuideraLogo from '../components/assets/Guidera.png';

// Mock API call - replace with your actual API endpoint
const mockApiCall = async (message: string): Promise<Omit<ChatResponse, 'id' | 'type' | 'timestamp'>> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock response with different scenarios
  const scenarios = [
    // Compliance passed scenario
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
    // Compliance failed scenario
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
    // Warning scenario
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
  
  // Randomly select a scenario or choose based on message content
  const scenarioIndex = message.toLowerCase().includes('fail') ? 1 : 
                       message.toLowerCase().includes('warn') ? 2 : 0;
  
  return scenarios[scenarioIndex];
};

export const ComplianceChatBot = ({ onGenerate }: { onGenerate?: (prompt: string, cpValue: number, complianceEnabled: boolean) => Promise<any> }) => {
  const [messages, setMessages] = useState<ChatResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [complianceEnabled, setComplianceEnabled] = useState(true);
  const [cpValue, setCpValue] = useState(0.5);
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    totalCostSaved: 0,
    totalRequests: 0,
    complianceChecks: 0,
    redactions: 0,
    plagiarismChecks: 0,
    modelUsage: {} as Record<string, number>,
    costSavingsOverTime: [] as Array<{ time: string; savings: number; cumulative: number }>,
    dailyActivity: [] as Array<{ day: string; requests: number; compliance: number; redactions: number }>
  });

  // Update analytics when new messages are processed
  useEffect(() => {
    if (messages.length === 0) return;

    const assistantMessages = messages.filter(m => m.type === 'assistant');
    if (assistantMessages.length === 0) return;

    // Calculate analytics from assistant messages
    let totalCostSaved = 0;
    let complianceChecks = 0;
    let redactions = 0;
    let plagiarismChecks = 0;
    const modelUsage: Record<string, number> = {};
    const costSavingsOverTime: Array<{ time: string; savings: number; cumulative: number }> = [];
    let cumulativeSavings = 0;

    assistantMessages.forEach((msg, index) => {
      if (msg.performanceMetrics) {
        totalCostSaved += msg.performanceMetrics.costSaved;
        cumulativeSavings += msg.performanceMetrics.costSaved;
        
        costSavingsOverTime.push({
          time: `Request ${index + 1}`,
          savings: msg.performanceMetrics.costSaved,
          cumulative: cumulativeSavings
        });
      }

      if (msg.complianceCheck) {
        complianceChecks++;
        if (msg.complianceCheck.status === 'failed') {
          redactions++;
        }
      }

      if (msg.plagiarismCheck) {
        plagiarismChecks++;
      }

      if (msg.model) {
        modelUsage[msg.model] = (modelUsage[msg.model] || 0) + 1;
      }
    });

    // Generate daily activity (simplified for demo)
    const dailyActivity = [
      { day: 'Today', requests: assistantMessages.length, compliance: complianceChecks, redactions }
    ];

    setAnalyticsData({
      totalCostSaved,
      totalRequests: assistantMessages.length,
      complianceChecks,
      redactions,
      plagiarismChecks,
      modelUsage,
      costSavingsOverTime,
      dailyActivity
    });
  }, [messages]);


  const handleSendMessage = async (messageContent: string) => {
    // Add user message
    const userMessage: ChatResponse = {
      id: crypto.randomUUID(),
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Add loading assistant message
    const loadingMessageId = crypto.randomUUID();
    const loadingMessage: ChatResponse = {
      id: loadingMessageId,
      type: 'assistant',
      content: '',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    setIsLoading(true);
    setLoadingMessageId(loadingMessageId);

    try {
      // Call API (use onGenerate if provided)
      let response = onGenerate
        ? await onGenerate(messageContent, cpValue, complianceEnabled)
        : await mockApiCall(messageContent);

      // If onGenerate, prettify the response
      let content: string;
      if (onGenerate && typeof response === 'string') {
        // Remove status lines and parse JSON
        const lines = response.split(/\r?\n/).filter(line => {
          return !/^(Picking best model for you|Checking compliance and generating response|Running policy checks|Running compliance checks)/.test(line.trim());
        });
        const jsonLine = lines.find(line => line.trim().startsWith('{'));
        if (jsonLine) {
          try {
            const parsed = JSON.parse(jsonLine);
            // Remove 'ner' from compliance_report if present
            if (parsed && typeof parsed === 'object' && 'compliance_report' in parsed) {
              const cr = parsed['compliance_report'];
              if (cr && typeof cr === 'object' && 'ner' in cr) {
                delete cr['ner'];
              }
            }
            content = JSON.stringify(parsed, null, 2);
          } catch {
            content = lines.join('\n');
          }
        } else {
          content = lines.join('\n');
        }
      } else if (onGenerate) {
        // If response is already an object
        // Remove 'ner' from compliance_report if present
        let parsed = response;
        if (parsed && typeof parsed === 'object' && 'compliance_report' in parsed) {
          const cr = parsed['compliance_report'];
          if (cr && typeof cr === 'object' && 'ner' in cr) {
            delete cr['ner'];
          }
        }
        content = JSON.stringify(parsed, null, 2);
      } else {
        content = response.content || '';
      }

      const assistantMessage: ChatResponse = {
        id: loadingMessageId,
        type: 'assistant',
        timestamp: new Date(),
        content
      };

      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessageId ? assistantMessage : msg
      ));
      
      // Show toast based on compliance status (only if compliance is enabled)
      if (complianceEnabled) {
        if (response.complianceCheck?.status === 'failed') {
          toast.error("Compliance check failed - content blocked");
        } else if (response.complianceCheck?.status === 'warning') {
          toast.warning("Content compliance warning - review recommended");
        } else if (response.complianceCheck?.status === 'passed') {
          toast.success("Content passed all compliance checks");
        }
      }
      
    } catch (error) {
      // Remove loading message on error
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));
      toast.error("Failed to analyze content. Please try again.");
      console.error('API Error:', error);
    } finally {
      setIsLoading(false);
      setLoadingMessageId(null);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success("Chat history cleared");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <Card className="p-4 m-4 mb-2 shadow-card border-border/50 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Guidera ChatBot</h1>
              <p className="text-sm text-muted-foreground">
              Enterprise AI Orchestration. Simplified
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleClearChat}>
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content with Tabs */}
      <div className="flex-1 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="prompt-generator" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Prompt Generator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {messages.length === 0 ? (
                <Card className="p-8 text-center shadow-card bg-card">
                  <img src={GuideraLogo} alt="Guidera Logo" className="h-25 w-25 mx-auto mb-4 object-contain" />
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Welcome to Guidera ChatBot</h3>
                  <p className="text-muted-foreground mb-6">
                    Send a message to analyze it for plagiarism and compliance violations. 
                    Our AI will check your content against multiple compliance standards and provide detailed feedback.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 rounded border border-border bg-secondary/50">
                      <p className="font-medium text-foreground flex items-center gap-2 justify-center text-center mb-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Compliance Check
                      </p>
                      <p className="text-muted-foreground text-center">Privacy, content guidelines, and policy validation</p>
                    </div>
                    <div className="p-3 rounded border border-border bg-secondary/50">
                      <p className="font-medium text-foreground flex items-center gap-2 justify-center text-center mb-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Plagiarism Detection
                      </p>
                      <p className="text-muted-foreground text-center">Source identification and similarity analysis</p>
                    </div>
                    <div className="p-3 rounded border border-border bg-secondary/50">
                      <p className="font-medium text-foreground flex items-center gap-2 justify-center text-center mb-2">
                        <Settings className="h-5 w-5 text-primary" />
                        AI Model Info
                      </p>
                      <p className="text-muted-foreground text-center">Transparency in AI processing and analysis</p>
                    </div>
                  </div>
                </Card>
              ) : (
                messages.map((message) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    isLoading={message.id === loadingMessageId && isLoading}
                    complianceEnabled={complianceEnabled}
                  />
                ))
              )}
            </div>

            {/* Chat Input */}
            <div className="py-4">
              <ChatInput 
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                complianceEnabled={complianceEnabled}
                onComplianceToggle={setComplianceEnabled}
                cpValue={cpValue}
                onCpChange={setCpValue}
              />
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="flex-1">
            <AnalyticsDashboard 
              data={analyticsData} 
              isEmpty={messages.filter(m => m.type === 'assistant').length === 0} 
            />
          </TabsContent>

          <TabsContent value="policies" className="flex-1">
            <CompliancePolicyManager complianceEnabled={complianceEnabled} />
          </TabsContent>

          <TabsContent value="prompt-generator" className="flex-1">
            <PromptGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};