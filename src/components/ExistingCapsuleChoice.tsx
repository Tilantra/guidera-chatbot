import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ExistingCapsuleChoiceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capsuleTag: string;
  onNewVersion: () => void;
  onNewCapsule: () => void;
  isLoading?: boolean;
}

export function ExistingCapsuleChoice({
  open,
  onOpenChange,
  capsuleTag,
  onNewVersion,
  onNewCapsule,
  isLoading = false,
}: ExistingCapsuleChoiceProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Existing Capsule</DialogTitle>
          <DialogDescription className="text-center pt-2">
            A capsule is already mapped to this conversation. What would you like to do?
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="text-center mb-6">
            <p className="text-lg font-semibold">{capsuleTag}</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onNewVersion}
              disabled={isLoading}
              className="w-full h-12 text-base bg-primary hover:bg-primary/90"
            >
              New Version
            </Button>
            
            <Button
              onClick={onNewCapsule}
              disabled={isLoading}
              variant="outline"
              className="w-full h-12 text-base"
            >
              New Capsule
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="link"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground p-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
