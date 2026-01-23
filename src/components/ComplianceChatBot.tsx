import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatMessage, type ChatResponse, type PerformanceMetrics } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { CompliancePolicyManager } from "./CompliancePolicyManager";

// UUID generator function (uses crypto.randomUUID if available, otherwise fallback)
const generateUUID = (): string => {
  // Try to use native crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {
      console.warn('crypto.randomUUID() failed, using fallback:', e);
    }
  }
  
  // Fallback UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

import { LoadingIndicator } from "./LoggingIndicator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar } from "./Avatar";
import { useTheme } from "./ThemeProvider";
import { Shield, Brain, RotateCcw, Settings, MessageSquare, Bot, BarChart3, ShieldCheck, User, LogOut, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import GuideraLogo from '../components/assets/Guidera.png';
import { SettingsPage } from "./SettingsPage";
import { SaveCapsuleDialog } from "./SaveCapsuleDialog";
import type { SaveCapsuleData } from "./SaveCapsuleDialog";
import { ExistingCapsuleChoice } from "./ExistingCapsuleChoice";
import { CapsuleLibrary } from "./CapsuleLibrary";
import { CapsuleIndicator } from "./CapsuleIndicator";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { TeamManagementDialog } from "./TeamManagementDialog";
import { TeamDetailsPanel } from "./TeamDetailsPanel";
import { InteractiveTutorial } from "./InteractiveTutorial";
import { useCapsules } from "@/hooks/use-capsules";
import type { ChatMessage as CapsuleChatMessage } from "@/lib/capsule-types";

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

export const ComplianceChatBot = ({ onGenerate, client, onLogout }: { onGenerate?: (prompt: string, cpValue: number, complianceEnabled: boolean, redactionEnabled: boolean, controlgrid: number) => Promise<any>, client: any, onLogout?: () => void }) => {
  const { userProfile } = useTheme();
  const [messages, setMessages] = useState<ChatResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [complianceEnabled, setComplianceEnabled] = useState(true);
  const [redactionEnabled, setRedactionEnabled] = useState(false);
  const [cpValue, setCpValue] = useState<[number, number]>([0.5, 0.5]);
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
  const [capsuleContext, setCapsuleContext] = useState<ChatResponse[]>([]); // Hidden context from capsule

  // Model preference state
  const [usePreferredModel, setUsePreferredModel] = useState<boolean>(true);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

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

  // Capsule state
  const [saveCapsuleDialogOpen, setSaveCapsuleDialogOpen] = useState(false);
  const [existingCapsuleChoiceOpen, setExistingCapsuleChoiceOpen] = useState(false);
  const [dropCapsuleDialogOpen, setDropCapsuleDialogOpen] = useState(false);
  const [userTeams, setUserTeams] = useState<string[]>([]);
  const [teamIdMap, setTeamIdMap] = useState<Record<string, string>>({}); // Map team name -> team ID
  const [capsuleSaving, setCapsuleSaving] = useState(false);
  
  // Track the capsule associated with this chat session
  const [sessionCapsuleId, setSessionCapsuleId] = useState<string | null>(null);
  const [sessionCapsuleTag, setSessionCapsuleTag] = useState<string>("");

  // Team management state
  const [teamManagementOpen, setTeamManagementOpen] = useState(false);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [teamDetailsOpen, setTeamDetailsOpen] = useState(false);
  const [selectedTeamForDetails, setSelectedTeamForDetails] = useState<string | null>(null);
  const [teamsWithDetails, setTeamsWithDetails] = useState<Array<{
    id: string;
    name: string;
    color?: string;
    description?: string;
    role?: string;
    members?: number;
  }>>([]);

  // Tutorial state
  const [tutorialOpen, setTutorialOpen] = useState(false);

  // Initialize capsule hook
  const capsuleHook = useCapsules(client);

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

  // Fetch user's capsules and teams on mount
  useEffect(() => {
    if (client && userProfile?.email) {
      capsuleHook.fetchUserCapsules();
      fetchUserTeams();
    }
  }, [client, userProfile?.email]);

  // Fetch user's teams
  const fetchUserTeams = async () => {
    if (!client || !userProfile?.email) {
      // Set placeholder teams if we can't fetch
      const placeholderTeams = [
        { id: "plant", name: "plant", color: "#10b981", description: "Plant team", role: "member" },
        { id: "house", name: "house", color: "#6366f1", description: "House team", role: "admin" },
        { id: "Test", name: "Test", color: "#f59e0b", description: "Test team", role: "member" },
        { id: "Research", name: "Research", color: "#3b82f6", description: "Research team", role: "member" },
        { id: "Legal", name: "Legal", color: "#ec4899", description: "Legal team", role: "member" },
      ];
      setUserTeams(["plant", "house", "Test", "Research", "Legal"]);
      setTeamIdMap({
        "plant": "plant",
        "house": "house",
        "Test": "Test",
        "Research": "Research",
        "Legal": "Legal",
      });
      setTeamsWithDetails(placeholderTeams);
      return;
    }
    try {
      const userDetails = await client.getSingleUser(userProfile.email);
      
      // Use real teams from backend if available, otherwise use placeholders
      const teamNames: string[] = [];
      const idMap: Record<string, string> = {};
      const detailedTeams: typeof teamsWithDetails = [];
      
      if (userDetails && userDetails.teams && userDetails.teams.length > 0) {
        // Use real teams from backend
        userDetails.teams.forEach((team: any) => {
          if (typeof team === 'string') {
            teamNames.push(team);
            idMap[team] = team;
            detailedTeams.push({ id: team, name: team });
          } else if (typeof team === 'object' && team !== null) {
            const teamId = team.team_id || team.id || team._id;
            const teamName = team.name || teamId;
            if (teamId && teamName) {
              teamNames.push(teamName);
              idMap[teamName] = teamId;
              detailedTeams.push({
                id: teamId,
                name: teamName,
                color: team.color,
                description: team.description,
                role: team.role,
              });
            }
          }
        });
      } else {
        // No teams from backend, use placeholders with correct names
        const placeholderTeams = [
          { id: "plant", name: "plant", color: "#10b981", description: "Plant team", role: "member" },
          { id: "house", name: "house", color: "#6366f1", description: "House team", role: "admin" },
          { id: "Test", name: "Test", color: "#f59e0b", description: "Test team", role: "member" },
          { id: "Research", name: "Research", color: "#3b82f6", description: "Research team", role: "member" },
          { id: "Legal", name: "Legal", color: "#ec4899", description: "Legal team", role: "member" },
        ];
        placeholderTeams.forEach((placeholder) => {
          teamNames.push(placeholder.name);
          idMap[placeholder.name] = placeholder.id;
          detailedTeams.push(placeholder);
        });
      }
      
      setUserTeams(teamNames);
      setTeamIdMap(idMap);
      setTeamsWithDetails(detailedTeams);
      
      if (teamNames.length > 0) {
        toast.success(`Loaded ${teamNames.length} team${teamNames.length !== 1 ? 's' : ''}`, {
          description: `${teamNames.slice(0, 3).join(', ')}${teamNames.length > 3 ? '...' : ''}`
        });
      }
    } catch (error) {
      console.error('[ComplianceChatBot] Failed to fetch user teams:', error);
      toast.error('Failed to load teams', {
        description: 'Using placeholder teams'
      });
      // Keep placeholder teams on error with correct names
      const placeholderTeams = [
        { id: "plant", name: "plant", color: "#10b981", description: "Plant team", role: "member" },
        { id: "house", name: "house", color: "#6366f1", description: "House team", role: "admin" },
        { id: "Test", name: "Test", color: "#f59e0b", description: "Test team", role: "member" },
        { id: "Research", name: "Research", color: "#3b82f6", description: "Research team", role: "member" },
        { id: "Legal", name: "Legal", color: "#ec4899", description: "Legal team", role: "member" },
      ];
      setUserTeams(["plant", "house", "Test", "Research", "Legal"]);
      setTeamIdMap({
        "plant": "plant",
        "house": "house",
        "Test": "Test",
        "Research": "Research",
        "Legal": "Legal",
      });
      setTeamsWithDetails(placeholderTeams);
    }
  };

  // Team management handlers
  const handleManageTeams = () => {
    setTeamManagementOpen(true);
  };

  const handleCreateTeam = async (name: string, description: string, color: string) => {
    try {
      // TODO: Call backend to create team
      toast.success("Team created!", {
        description: `${name} has been created successfully`
      });
      // Refresh teams
      await fetchUserTeams();
    } catch (error) {
      console.error("Failed to create team:", error);
      toast.error("Failed to create team", {
        description: error instanceof Error ? error.message : "Please try again"
      });
      throw error;
    }
  };

  const handleSelectTeamFromManagement = (teamId: string) => {
    const team = teamsWithDetails.find(t => t.id === teamId);
    if (team) {
      setSelectedTeamForDetails(teamId);
      setTeamDetailsOpen(true);
      setTeamManagementOpen(false);
    }
  };

  const handleAddMember = async (email: string) => {
    try {
      // TODO: Call backend to add member
      toast.success("Member added!", {
        description: `${email} has been added to the team`
      });
    } catch (error) {
      console.error("Failed to add member:", error);
      toast.error("Failed to add member", {
        description: error instanceof Error ? error.message : "Please try again"
      });
      throw error;
    }
  };

  const handleRemoveMember = async (email: string) => {
    try {
      // TODO: Call backend to remove member
      toast.success("Member removed!", {
        description: `${email} has been removed from the team`
      });
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Failed to remove member", {
        description: error instanceof Error ? error.message : "Please try again"
      });
      throw error;
    }
  };

  const handleDeleteTeam = async () => {
    try {
      // TODO: Call backend to delete team
      toast.success("Team deleted!", {
        description: "The team has been deleted"
      });
      setTeamDetailsOpen(false);
      setTeamManagementOpen(false);
      await fetchUserTeams();
    } catch (error) {
      console.error("Failed to delete team:", error);
      toast.error("Failed to delete team", {
        description: error instanceof Error ? error.message : "Please try again"
      });
      throw error;
    }
  };

  // Handle model preference changes
  const handleModelChange = (modelId: string | null, usePreferred: boolean) => {
    setSelectedModelId(modelId);
    setUsePreferredModel(usePreferred);
  };

  const handleSendMessage = async (messageContent: string) => {
    // If capsule context is active, prepend it to the message sent to backend
    let finalPrompt = messageContent;
    if (capsuleContext.length > 0) {
      // Format capsule context as conversation history
      const contextString = capsuleContext
        .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');
      
      finalPrompt = `**CAPSULE CONTEXT** (Previous conversation for reference):\n\n${contextString}\n\n---\n\nCurrent question: ${messageContent}`;
    }
    
    // Add user message (show original message in UI, not with context)
    const userMessage: ChatResponse = {
      id: generateUUID(),
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Add loading assistant message
    const loadingMessageId = generateUUID();
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
      // Call API (use real client call instead of mock/onGenerate)
      let response;
      if (client) {
        // Use the real client with model preferences
        // Send finalPrompt (with context if active) to backend
        response = await client.generate(
          finalPrompt,  // Use finalPrompt instead of messageContent
          cpValue[0], // cp_tradeoff_parameter
          complianceEnabled,
          redactionEnabled,
          cpValue[1], // controlgrid
          usePreferredModel
        );
      } else if (onGenerate) {
        // Fallback to onGenerate prop (for backward compatibility)
        response = await onGenerate(finalPrompt, cpValue[0], complianceEnabled, redactionEnabled, cpValue[1]);
      } else {
        // Fallback to mock
        response = await mockApiCall(finalPrompt);
      }

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

  const handleClearChat = async () => {
    if (client) {
      await client.clearChat();
    }
    setMessages([]);
    setCapsuleContext([]); // Also clear capsule context
    setSessionCapsuleId(null); // Clear session capsule tracking
    setSessionCapsuleTag("");
    toast.success("Chat history cleared");
  };

  // ============================================
  // CAPSULE HELPER FUNCTIONS
  // ============================================

  // Convert Guidera messages to Capsule format
  const convertToCapsuleMessages = (messages: ChatResponse[]): CapsuleChatMessage[] => {
    return messages
      .filter(msg => msg.type === 'user' || msg.type === 'assistant')
      .map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      }));
  };

  // Convert Capsule messages to Guidera format
  const convertFromCapsuleMessages = (capsuleMessages: CapsuleChatMessage[]): ChatResponse[] => {
    return capsuleMessages.map(msg => ({
      id: generateUUID(),
      type: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
      timestamp: new Date(msg.timestamp || new Date()),
    }));
  };

  // Handle "Generate Capsule" button click
  const handleGenerateCapsuleClick = () => {
    if (sessionCapsuleId && sessionCapsuleTag) {
      // Show existing capsule choice dialog
      setExistingCapsuleChoiceOpen(true);
    } else {
      // Show normal save dialog
      setSaveCapsuleDialogOpen(true);
    }
  };

  // Handle save capsule (new or version)
  const handleSaveCapsule = async (data: SaveCapsuleData) => {
    setCapsuleSaving(true);
    try {
      const capsuleMessages = convertToCapsuleMessages(messages);
      
      if (data.mode === "new") {
        // Create new capsule
        let teamId: string | undefined = undefined;
        if (data.team && data.team !== "__personal__") {
          teamId = teamIdMap[data.team] || data.team;
        }
        
        const response = await capsuleHook.createCapsule(
          capsuleMessages,
          data.tag || 'Untitled',
          teamId
        );
        
        // Track this capsule for the current session
        if (response) {
          setSessionCapsuleId(response.capsule_id);
          setSessionCapsuleTag(data.tag || 'Untitled');
        }
      } else if (data.mode === "version" && data.capsuleId) {
        // Add version to existing capsule
        await capsuleHook.createVersion(data.capsuleId, capsuleMessages);
      }
    } finally {
      setCapsuleSaving(false);
    }
  };

  // Handle "New Version" from existing capsule choice
  const handleNewVersion = async () => {
    if (!sessionCapsuleId) return;
    
    setCapsuleSaving(true);
    setExistingCapsuleChoiceOpen(false);
    
    try {
      const capsuleMessages = convertToCapsuleMessages(messages);
      await capsuleHook.createVersion(sessionCapsuleId, capsuleMessages);
    } finally {
      setCapsuleSaving(false);
    }
  };

  // Handle "New Capsule" from existing capsule choice (create fresh capsule)
  const handleNewCapsuleFromExisting = () => {
    setExistingCapsuleChoiceOpen(false);
    setSaveCapsuleDialogOpen(true);
  };

  // Handle drop capsule (load)
  const handleDropCapsule = async (capsuleId: string, versionId: string) => {
    const capsuleMessages = await capsuleHook.loadCapsule(capsuleId, versionId);
    const guideraMessages = convertFromCapsuleMessages(capsuleMessages);
    
    // Store as hidden context (don't add to visible messages)
    // This will be sent to backend on next user message
    setCapsuleContext(guideraMessages);
    setDropCapsuleDialogOpen(false);
    
    // Show a visual indicator that context was added
    toast.success("Capsule context added!", {
      description: `${capsuleMessages.length} messages loaded as context`
    });
  };

  // Handle clear capsule
  const handleClearCapsule = () => {
    capsuleHook.clearActiveCapsule();
    setCapsuleContext([]); // Clear the hidden context
  };

  return (
    <div className="flex flex-col h-screen bg-background text-left relative overflow-hidden">
      {/* Subtle Background Elements (Matching Login) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary/10 dark:bg-primary/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <div className="px-4 pt-3 pb-1 relative z-10">
        <Card className="p-3 border-border/40 bg-card/80 backdrop-blur-md shadow-elegant rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-primary shadow-md shadow-primary/20">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-foreground">Guidera ChatBot</h1>
                <p className="text-[11px] text-muted-foreground/70 font-medium leading-none mt-0.5">
                  Enterprise AI Orchestration Simplified
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Help Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTutorialOpen(true)}
                className="h-9 w-9"
                title="Tutorial"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearChat}
                className="h-8 px-2.5 border-border/50 hover:bg-secondary/80 transition-all rounded-lg text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                Clear
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="ml-1 cursor-pointer">
                    <Avatar
                      style={userProfile.avatarStyle}
                      seed={userProfile.avatarSeed}
                      size={32}
                      className="border border-border hover:border-primary transition-colors"
                    />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10 flex flex-col min-h-0 container mx-auto px-4 overflow-hidden">
        {/* Settings Page - Rendered Outside Tabs */}
        {activeTab === 'settings' && (
          <div className="flex-1 flex flex-col min-h-0 py-4">
            <div className="flex items-center gap-2 mb-4 p-2 border-b bg-background/50 backdrop-blur-sm rounded-t-xl">
              <Button variant="outline" size="sm" onClick={() => setActiveTab('chat')}>
                ← Back
              </Button>
              <h1 className="text-lg font-semibold">Settings</h1>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <SettingsPage />
            </div>
          </div>
        )}

        {/* Tabs Content - Only when NOT in settings */}
        {activeTab !== 'settings' && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="py-2 sticky top-0 z-20 bg-background/0">
              <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/30 backdrop-blur-md rounded-xl border border-border/40 shadow-sm">
                <TabsTrigger
                  value="chat"
                  className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm hover:text-foreground/80"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="policies"
                  className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm hover:text-foreground/80"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Policies
                </TabsTrigger>
                <TabsTrigger
                  value="dashboard"
                  className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-elegant hover:text-foreground/80"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Dashboard
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 data-[state=inactive]:hidden pb-4">
              {/* Active Capsule Indicator */}
              {capsuleHook.activeCapsule && (
                <div className="mb-4 px-1">
                  <CapsuleIndicator
                    onClear={handleClearCapsule}
                  />
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1 min-h-0">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center min-h-[300px]">
                    <Card className="p-6 text-center border-dashed border-2 border-border/40 bg-card/30 backdrop-blur-sm shadow-none max-w-xl w-full">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl"></div>
                        <img src={GuideraLogo} alt="Guidera Logo" className="h-16 w-auto mx-auto relative object-contain" />
                      </div>
                      <h3 className="text-xl font-bold mb-1 tracking-tight text-foreground">Welcome to Guidera</h3>
                      <p className="text-[13px] text-muted-foreground max-w-md mx-auto mb-6 font-medium">
                        The intelligent control layer for your AI workflows. Start a conversation to analyze compliance and optimize performance.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                        <div className="p-3 rounded-xl border border-border/40 bg-background/40 hover:bg-background/70 transition-colors group">
                          <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <p className="font-bold text-xs text-foreground mb-1">Compliance</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed text-center">Privacy & policy validation</p>
                        </div>
                        <div className="p-3 rounded-xl border border-border/40 bg-background/40 hover:bg-background/70 transition-colors group">
                          <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                            <Brain className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <p className="font-bold text-xs text-foreground mb-1">Plagiarism</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed text-center">Intellectual property protection</p>
                        </div>
                        <div className="p-3 rounded-xl border border-border/40 bg-background/40 hover:bg-background/70 transition-colors group">
                          <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                            <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <p className="font-bold text-xs text-foreground mb-1">Optimization</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed text-center">Cost-efficient AI processing</p>
                        </div>
                      </div>
                    </Card>
                  </div>
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
              <div className="pt-2 pb-0 z-20 bg-transparent">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  complianceEnabled={complianceEnabled}
                  onComplianceToggle={setComplianceEnabled}
                  cpValue={cpValue}
                  onCpChange={(value) => {
                    if (Array.isArray(value)) setCpValue(value as [number, number]);
                    else setCpValue([value as number, cpValue[1]]);
                  }}
                  redactionEnabled={redactionEnabled}
                  onRedactionToggle={setRedactionEnabled}
                  client={client}
                  onModelChange={handleModelChange}
                  onGenerateCapsule={handleGenerateCapsuleClick}
                  onDropCapsule={() => setDropCapsuleDialogOpen(true)}
                  capsuleDisabled={isLoading}
                />
              </div>
            </TabsContent>
            <TabsContent value="policies" className="flex-1 flex flex-col min-h-0 overflow-y-auto data-[state=inactive]:hidden px-1 pb-4">
              <CompliancePolicyManager client={client} isActive={activeTab === "policies"} />
            </TabsContent>
            <TabsContent value="dashboard" className="flex-1 flex flex-col min-h-0 overflow-y-auto data-[state=inactive]:hidden px-1 pb-4">
              <AnalyticsDashboard client={client} />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Capsule Dialogs */}
      {client && (
        <>
          <ExistingCapsuleChoice
            open={existingCapsuleChoiceOpen}
            onOpenChange={setExistingCapsuleChoiceOpen}
            capsuleTag={sessionCapsuleTag}
            onNewVersion={handleNewVersion}
            onNewCapsule={handleNewCapsuleFromExisting}
            isLoading={capsuleSaving}
          />

          <SaveCapsuleDialog
            open={saveCapsuleDialogOpen}
            onOpenChange={setSaveCapsuleDialogOpen}
            onSave={handleSaveCapsule}
            messageCount={messages.length}
            userCapsules={capsuleHook.userCapsules}
            teams={userTeams}
            teamIdMap={teamIdMap}
            isLoading={capsuleSaving}
          />

          <CapsuleLibrary
            open={dropCapsuleDialogOpen}
            onOpenChange={setDropCapsuleDialogOpen}
            capsules={capsuleHook.userCapsules}
            loading={capsuleHook.loading}
            onLoadCapsule={handleDropCapsule}
            onDeleteCapsule={capsuleHook.deleteCapsule}
            onRefresh={capsuleHook.fetchUserCapsules}
            teams={userTeams}
            teamIdMap={teamIdMap}
          />

          <TeamManagementDialog
            open={teamManagementOpen}
            onOpenChange={setTeamManagementOpen}
            teams={teamsWithDetails}
            loading={false}
            onSelectTeam={handleSelectTeamFromManagement}
            onCreateTeam={() => {
              setTeamManagementOpen(false);
              setCreateTeamOpen(true);
            }}
            onWorkPrivately={() => {
              setTeamManagementOpen(false);
            }}
            onRefresh={fetchUserTeams}
          />

          <CreateTeamDialog
            open={createTeamOpen}
            onOpenChange={setCreateTeamOpen}
            onCreateTeam={handleCreateTeam}
            isLoading={false}
          />

          <TeamDetailsPanel
            open={teamDetailsOpen && selectedTeamForDetails !== null}
            onOpenChange={setTeamDetailsOpen}
            team={
              selectedTeamForDetails
                ? (() => {
                    const foundTeam = teamsWithDetails.find(t => t.id === selectedTeamForDetails);
                    return foundTeam
                      ? {
                          id: foundTeam.id,
                          name: foundTeam.name,
                          description: foundTeam.description,
                          color: foundTeam.color,
                          members: [],
                          userRole: foundTeam.role || "member",
                        }
                      : null;
                  })()
                : null
            }
            loading={false}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onDeleteTeam={handleDeleteTeam}
            onBack={() => {
              setTeamDetailsOpen(false);
              setTeamManagementOpen(true);
              setSelectedTeamForDetails(null);
            }}
          />

          <InteractiveTutorial
            open={tutorialOpen}
            onClose={() => setTutorialOpen(false)}
          />
        </>
      )}
    </div>
  );
};