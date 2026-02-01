import CapsuleIcon from '../components/assets/capsule.png';

interface CapsuleIndicatorProps {
  onClear: () => void;
}

export function CapsuleIndicator({
  onClear,
}: CapsuleIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 p-4 bg-muted/30 rounded-lg border border-border/50">
      <span className="text-base font-medium text-foreground flex items-center gap-2">
        Adding Capsule Context To Conversation
        <img src={CapsuleIcon} alt="Capsule" className="h-5 w-5 inline-block" />
      </span>
    </div>
  );
}
