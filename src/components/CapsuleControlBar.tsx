import { Button } from "@/components/ui/button";
import { Sparkles, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CapsuleIcon from '../components/assets/capsule.png';

interface CapsuleControlBarProps {
  onGenerateCapsule: () => void;
  onDropCapsule: () => void;
  disabled?: boolean;
}

export function CapsuleControlBar({
  onGenerateCapsule,
  onDropCapsule,
  disabled = false,
}: CapsuleControlBarProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          id="capsule-hub-button"
          disabled={disabled}
          className="h-8 w-8 p-0 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-all shadow-sm active:scale-95"
          title="Capsule Actions"
        >
          <img src={CapsuleIcon} alt="Capsule" className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onGenerateCapsule} className="cursor-pointer">
          <Sparkles className="h-4 w-4 mr-2" />
          <span className="font-medium">Generate Capsule</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDropCapsule} className="cursor-pointer">
          <Download className="h-4 w-4 mr-2" />
          <span className="font-medium">Drop Capsule</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
