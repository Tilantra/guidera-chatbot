import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[600px] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={CapsulePng} alt="Capsule" className="h-6 w-6" />
              <DialogTitle>My Capsules</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh Capsules"
              className="h-8 w-8"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <DialogDescription>
            Load context from your saved conversations
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by tag or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {teams.length > 0 && (
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Capsule List */}
        <ScrollArea className="flex-1 pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCapsules.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-muted-foreground">
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
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <img src={CapsulePng} alt="Capsule" className="h-5 w-5 shrink-0" />
                        <h3 className="font-semibold text-lg truncate">
                          {capsule.tag || "Untitled Capsule"}
                        </h3>
                        <Badge variant="secondary" className="shrink-0">
                          v{capsule.version_count}
                        </Badge>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                        {capsule.team && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {teamNameMap[capsule.team] || capsule.team}
                          </span>
                        )}
                        {!capsule.team && (
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            Personal
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(capsule.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {capsule.created_by && (
                          <span className="text-xs">by {capsule.created_by}</span>
                        )}
                      </div>

                      {/* Summary */}
                      {capsule.summary && !capsule.summary.includes("**ACTIVE CAPSULE CONTEXT**") && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {capsule.summary}
                        </p>
                      )}

                      {/* Sources with logos */}
                      {capsule.extracted_from.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {capsule.extracted_from.map((source, idx) => {
                            const logo = getPlatformLogo(source);
                            return logo ? (
                              <img 
                                key={idx} 
                                src={logo} 
                                alt={source}
                                className="h-5 w-5 object-contain rounded"
                                title={source}
                              />
                            ) : (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {source}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleLoad(capsule.capsule_id, capsule.latest_version_id!)
                        }
                        disabled={loadingCapsuleId !== null}
                        className="w-24"
                      >
                        {loadingCapsuleId === capsule.capsule_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-1" />
                            Load
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => confirmDelete(capsule.capsule_id)}
                        disabled={loadingCapsuleId !== null}
                        className="w-24"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {filteredCapsules.length} capsule{filteredCapsules.length !== 1 ? "s" : ""} found
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>

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
    </Dialog>
  );
}
