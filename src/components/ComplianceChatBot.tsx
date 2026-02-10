import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatMessage, type ChatResponse, type PerformanceMetrics } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { CompliancePolicyManager } from "./CompliancePolicyManager";
import { InteractiveTutorial } from "./InteractiveTutorial";

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
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar } from "./Avatar";
import { useTheme } from "./ThemeProvider";
import { Shield, Brain, RotateCcw, Settings, MessageSquare, BarChart3, ShieldCheck, LogOut, HelpCircle } from "lucide-react";
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
import { useCapsules } from "@/hooks/use-capsules";
import type { ChatMessage as CapsuleChatMessage } from "@/lib/capsule-types";

// Main component

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

  // Capsule state

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
  const [controlGridOpen, setControlGridOpen] = useState(false);

  // Initialize capsule hook
  const capsuleHook = useCapsules(client);

  // Fetch user's capsules and teams on mount

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
      toast.error('Failed to load teams');

      setUserTeams([]);
      setTeamIdMap({});
      setTeamsWithDetails([]);
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
        throw new Error("No client availability for prompt generation");
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
      {/* Header */}
      <header className="px-6 py-4 border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter text-foreground leading-none mb-1">Guidera Chatbot</h1>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  Enterprise AI Orchestration Simplified
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              id="clear-chat-button"
              onClick={handleClearChat}
              className="h-9 px-3 text-muted-foreground hover:text-destructive transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <div className="h-6 w-px bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              id="help-button"
              onClick={() => setTutorialOpen(true)}
              className="h-9 px-3 text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
            <div className="h-6 w-px bg-border mx-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 pl-3 pr-2 py-1 rounded-xl bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-all border border-border/40 shadow-sm group">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">{userProfile.name}</span>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground/70 tracking-tight">Profile</span>
                  </div>
                  <div className="h-8 w-8 rounded-lg overflow-hidden border border-border/50 shadow-sm bg-background flex items-center justify-center">
                    <Avatar
                      style={userProfile.avatarStyle}
                      seed={userProfile.avatarSeed}
                      size={24}
                    />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                  <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 container mx-auto px-6 overflow-hidden">
        {activeTab === 'settings' && (
          <div className="flex-1 flex flex-col min-h-0 py-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('chat')} className="text-muted-foreground hover:text-foreground">
                ← Back to Dashboard
              </Button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <SettingsPage />
            </div>
          </div>
        )}

        {activeTab !== 'settings' && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="py-2 sticky top-0 z-20 bg-background/0">
              <TabsList className="grid w-full grid-cols-3 h-11 p-1 bg-secondary/20 backdrop-blur-md rounded-xl border border-border/40 shadow-sm">
                <TabsTrigger
                  value="chat"
                  id="chat-tab-trigger"
                  className="flex items-center justify-center gap-2 rounded-lg py-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm hover:text-foreground/80"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Chat Console
                </TabsTrigger>
                <TabsTrigger
                  value="policies"
                  id="policies-tab-trigger"
                  className="flex items-center justify-center gap-2 rounded-lg py-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm hover:text-foreground/80"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Policy Manager
                </TabsTrigger>
                <TabsTrigger
                  value="dashboard"
                  id="dashboard-tab-trigger"
                  className="flex items-center justify-center gap-2 rounded-lg py-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm hover:text-foreground/80"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Analytics Hub
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
                  controlGridOpen={controlGridOpen}
                  onControlGridOpenChange={setControlGridOpen}
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

        <InteractiveTutorial
          open={tutorialOpen}
          onOpenChange={setTutorialOpen}
          onStepChange={(step) => {
            if (step.id === 'policies') setActiveTab('policies');
            if (step.id === 'dashboard') setActiveTab('dashboard');
            if (step.id === 'welcome' || step.id === 'chat') setActiveTab('chat');

            // Handle specialized actions
            if (step.action === 'open-control-grid') {
              setControlGridOpen(true);
            } else if (step.action === 'close-popovers') {
              setControlGridOpen(false);
              // Other popovers could be closed here if needed
            }
          }}
        />
      </main>

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

        </>
      )}
    </div>
  );
};