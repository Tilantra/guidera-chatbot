import { useState, useCallback } from "react";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import type { SearchResult, ChatMessage } from "@/lib/capsule-types";
import { toast } from "sonner";

interface ActiveCapsule {
  capsuleId: string;
  versionId: string;
  tag?: string;
  team?: string;
  versionCount: number;
  messageCount: number;
}

export function useCapsules(client: BrowserGuideraClient) {
  const [userCapsules, setUserCapsules] = useState<SearchResult[]>([]);
  const [activeCapsule, setActiveCapsule] = useState<ActiveCapsule | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user's capsules
  const fetchUserCapsules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await client.getUserCapsules(100, 0);
      setUserCapsules(response.results);
      return response.results;
    } catch (error: any) {
      console.error("Failed to fetch capsules:", error);
      toast.error("Failed to load capsules", {
        description: error.message || "Please try again",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [client]);

  // Create new capsule
  const createCapsule = useCallback(
    async (messages: ChatMessage[], tag: string, team?: string) => {
      try {
        const response = await client.createCapsule({
          content: {
            messages,
            metadata: {
              source: "guidera-chatbot",
            },
          },
          tag,
          team: team || undefined,
          extracted_from: "guidera",
        });

        toast.success("Capsule created successfully!", {
          description: `"${tag}" has been saved`,
        });

        // Refresh capsules list
        await fetchUserCapsules();

        return response;
      } catch (error: any) {
        console.error("Failed to create capsule:", error);
        toast.error("Failed to create capsule", {
          description: error.message || "Please try again",
        });
        throw error;
      }
    },
    [client, fetchUserCapsules]
  );

  // Create new version
  const createVersion = useCallback(
    async (capsuleId: string, messages: ChatMessage[]) => {
      try {
        const response = await client.createCapsuleVersion(capsuleId, {
          content: {
            messages,
            metadata: {
              source: "guidera-chatbot",
            },
          },
          extracted_from: "guidera",
        });

        toast.success("Version created successfully!", {
          description: `New version added to capsule`,
        });

        // Refresh capsules list
        await fetchUserCapsules();

        return response;
      } catch (error: any) {
        console.error("Failed to create version:", error);
        toast.error("Failed to create version", {
          description: error.message || "Please try again",
        });
        throw error;
      }
    },
    [client, fetchUserCapsules]
  );

  // Load capsule content
  const loadCapsule = useCallback(
    async (capsuleId: string, versionId: string): Promise<ChatMessage[]> => {
      try {
        const version = await client.getCapsuleVersion(capsuleId, versionId);
        const metadata = await client.getCapsuleMetadata(capsuleId);

        setActiveCapsule({
          capsuleId,
          versionId,
          tag: metadata.tag,
          team: metadata.team,
          versionCount: metadata.version_count,
          messageCount: version.content.messages.length,
        });

        toast.success("Capsule loaded!", {
          description: `"${metadata.tag || "Untitled"}" is now active`,
        });

        return version.content.messages;
      } catch (error: any) {
        console.error("Failed to load capsule:", error);
        toast.error("Failed to load capsule", {
          description: error.message || "Please try again",
        });
        throw error;
      }
    },
    [client]
  );

  // Clear active capsule
  const clearActiveCapsule = useCallback(() => {
    setActiveCapsule(null);
    toast.info("Capsule context cleared");
  }, []);

  // Delete a capsule
  const deleteCapsule = useCallback(
    async (capsuleId: string) => {
      try {
        await client.deleteCapsule(capsuleId);
        
        // If the deleted capsule was active, clear it
        if (activeCapsule && activeCapsule.capsuleId === capsuleId) {
          setActiveCapsule(null);
        }
        
        toast.success("Capsule deleted successfully");
        
        // Refresh capsules list
        await fetchUserCapsules();
      } catch (error: any) {
        console.error("Failed to delete capsule:", error);
        toast.error("Failed to delete capsule", {
          description: error.message || "Please try again",
        });
        throw error;
      }
    },
    [client, activeCapsule, fetchUserCapsules]
  );

  return {
    // State
    userCapsules,
    activeCapsule,
    loading,

    // Actions
    fetchUserCapsules,
    createCapsule,
    createVersion,
    loadCapsule,
    clearActiveCapsule,
    deleteCapsule,
  };
}
