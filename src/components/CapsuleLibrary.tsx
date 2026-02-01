import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Download, Clock, Users, Tag, Trash2, RefreshCw } from "lucide-react";
import type { SearchResult } from "@/lib/capsule-types";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ChatgptLogo from "./assets/ChatgptLogo.png";
import GeminiLogo from "./assets/GeminiLogo.png";
import ExtensionLogo from "./assets/ExtensionLogo.png";
import ClaudeLogo from "./assets/ClaudeLogo.png";
import DeepseekLogo from "./assets/DeepseekLogo.png";
import CapsulePng from "./assets/capsule.png";
import TilantraLogo from "./assets/logo-small.jpeg";
import GmailLogo from "./assets/GmailLogo.png";

interface CapsuleLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capsules: SearchResult[];
  loading: boolean;
  onLoadCapsule: (capsuleId: string, versionId: string) => Promise<void>;
  onDeleteCapsule: (capsuleId: string) => Promise<void>;
  onRefresh: () => void;
  teams?: string[];
  teamIdMap?: Record<string, string>; // Map team name -> team ID
}

export function CapsuleLibrary({
  open,
  onOpenChange,
  capsules,
  loading,
  onLoadCapsule,
  onDeleteCapsule,
  onRefresh,
  teams = [],
  teamIdMap = {},
}: CapsuleLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [loadingCapsuleId, setLoadingCapsuleId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [capsuleToDelete, setCapsuleToDelete] = useState<string | null>(null);

  // Create reverse mapping: team ID -> team name
  const teamNameMap: Record<string, string> = {};
  Object.entries(teamIdMap).forEach(([name, id]) => {
    teamNameMap[id] = name;
  });

  useEffect(() => {
    if (open) {
      onRefresh();
    }
  }, [open, onRefresh]);

  const filteredCapsules = capsules.filter((capsule) => {
    const matchesSearch =
      !searchQuery ||
      capsule.tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capsule.summary?.toLowerCase().includes(searchQuery.toLowerCase());

    // Convert selected team name to ID for comparison
    const selectedTeamId = selectedTeam !== "all" && selectedTeam !== "personal"
      ? teamIdMap[selectedTeam]
      : selectedTeam;

    const matchesTeam =
      selectedTeam === "all" ||
      (selectedTeam === "personal" && !capsule.team) ||
      capsule.team === selectedTeamId;

    return matchesSearch && matchesTeam;
  });

  const handleLoad = async (capsuleId: string, versionId: string) => {
    setLoadingCapsuleId(capsuleId);
    try {
      await onLoadCapsule(capsuleId, versionId);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to load capsule:", error);
    } finally {
      setLoadingCapsuleId(null);
    }
  };

  const handleDelete = async () => {
    if (!capsuleToDelete) return;

    try {
      await onDeleteCapsule(capsuleToDelete);
      setDeleteDialogOpen(false);
      setCapsuleToDelete(null);
    } catch (error) {
      console.error("Failed to delete capsule:", error);
    }
  };

  const confirmDelete = (capsuleId: string) => {
    setCapsuleToDelete(capsuleId);
    setDeleteDialogOpen(true);
  };

  // Helper to get platform logo
  const getPlatformLogo = (platform: string) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('chatgpt') || platformLower.includes('gpt')) {
      return ChatgptLogo;
    } else if (platformLower.includes('gemini')) {
      return GeminiLogo;
    } else if (platformLower.includes('claude')) {
      return ClaudeLogo;
    } else if (platformLower.includes('deepseek')) {
      return DeepseekLogo;
    } else if (platformLower.includes('guidera')) {
      return TilantraLogo;
    } else if (platformLower.includes('mail') || platformLower.includes('gmail')) {
      return GmailLogo;
    }
    return null;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[450px] w-full flex flex-col p-0 overflow-hidden bg-card/95 backdrop-blur-2xl border-border/40 shadow-2xl">
        <SheetHeader className="p-6 pb-4 border-b border-border/20 bg-background/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <img src={CapsulePng} alt="Capsule" className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-xl font-black tracking-tight">My Capsules</SheetTitle>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh library"
              className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search tags or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-10 bg-background/40 border-border/40 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>

            {teams.length > 0 && (
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-full h-10 bg-background/40 border-border/40 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold uppercase tracking-wider">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-border/40">
                  <SelectItem value="all" className="text-xs font-bold uppercase tracking-wider">All Sources</SelectItem>
                  <SelectItem value="personal" className="text-xs font-bold uppercase tracking-wider">Personal</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team} value={team} className="text-xs font-bold uppercase tracking-wider">
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCapsules.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-muted-foreground text-sm">
                {searchQuery || selectedTeam !== "all"
                  ? "No capsules match your filters"
                  : "No capsules yet. Save your first conversation!"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCapsules.map((capsule) => (
                <div
                  key={capsule.capsule_id}
                  className="group relative p-3 border border-border/40 rounded-xl bg-card/40 backdrop-blur-sm hover:bg-card/60 hover:border-primary/20 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
                >
                  {/* Floating Actions */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 pointer-events-none z-10">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleLoad(capsule.capsule_id, capsule.latest_version_id!)
                      }
                      disabled={loadingCapsuleId !== null}
                      className="h-7 px-2.5 bg-background/90 backdrop-blur-md border border-border/40 text-[10px] font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all duration-300 pointer-events-auto opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                    >
                      {loadingCapsuleId === capsule.capsule_id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : "Drop"}
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => confirmDelete(capsule.capsule_id)}
                      disabled={loadingCapsuleId !== null}
                      className="h-7 w-7 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all duration-300 pointer-events-auto opacity-0 group-hover:opacity-100 transform translate-x-12 group-hover:translate-x-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <h3 className="font-bold text-sm text-foreground/90 truncate group-hover:text-primary transition-colors">
                            {capsule.tag || "Untitled"}
                          </h3>
                          <Badge variant="secondary" className="h-3.5 px-1 text-[8px] font-black bg-primary/10 text-primary border-none">
                            v{capsule.version_count}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-muted-foreground/60">
                          {capsule.team ? (
                            <span className="flex items-center gap-1 font-bold">
                              <Users className="h-2.5 w-2.5" />
                              {teamNameMap[capsule.team] || capsule.team}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 font-bold">
                              <Tag className="h-2.5 w-2.5" />
                              Personal
                            </span>
                          )}
                          {capsule.created_by && (
                            <span className="flex items-center gap-1 font-bold">
                              <span className="opacity-30">•</span>
                              by {capsule.created_by}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Top-aligned Platform Logos - Visible by default, hidden on hover */}
                      <div className="flex items-center gap-1 flex-shrink-0 pt-0.5 transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:scale-95">
                        {capsule.extracted_from.slice(0, 3).map((source, idx) => {
                          const logo = getPlatformLogo(source);
                          return logo ? (
                            <img
                              key={idx}
                              src={logo}
                              alt={source}
                              className="h-5 w-5 object-contain"
                              title={source}
                            />
                          ) : null;
                        })}
                      </div>
                    </div>

                    {/* Compact Summary */}
                    {capsule.summary && !capsule.summary.includes("**ACTIVE CAPSULE CONTEXT**") && (
                      <p className="text-[11px] text-muted-foreground/60 line-clamp-1 leading-normal italic">
                        {capsule.summary}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border/20 bg-background/50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {filteredCapsules.length} context{filteredCapsules.length !== 1 ? "s" : ""}
          </p>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-8 px-4 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-muted transition-all"
          >
            Close
          </Button>
        </div>
      </SheetContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this capsule and all its versions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCapsuleToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
