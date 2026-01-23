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
          disabled={disabled}
          className="h-9 w-9 rounded-full p-0 hover:bg-muted transition-all"
        >
          <img src={CapsuleIcon} alt="Capsule" className="h-6 w-6" />
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
