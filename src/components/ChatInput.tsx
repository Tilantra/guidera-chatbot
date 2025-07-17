import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Send, Loader2, Shield } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  complianceEnabled?: boolean;
  onComplianceToggle?: (enabled: boolean) => void;
  cpValue?: number;
  onCpChange?: (value: number) => void;
}

export const ChatInput = ({ 
  onSendMessage, 
  isLoading, 
  placeholder = "Type your message for plagiarism and compliance check...",
  complianceEnabled = true,
  onComplianceToggle,
  cpValue = 0.5,
  onCpChange
}: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Card className="p-4 shadow-card border-border/50 bg-card">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[80px] resize-none border-border/50 focus:border-primary/50 transition-colors"
          disabled={isLoading}
        />
        
        {/* Controls Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left side - CP Parameter Slider */}
          <div className="flex flex-col flex-1 max-w-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Cost Saving</span>
              <span className="text-xs text-muted-foreground">Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="cp-slider" className="text-xs whitespace-nowrap">CP:</Label>
              <div className="flex-1 px-2">
                <div className="flex justify-center mb-1">
                  <span className="text-xs font-semibold text-primary">{cpValue.toFixed(1)}</span>
                </div>
                <Slider
                  id="cp-slider"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[cpValue]}
                  onValueChange={(value) => onCpChange?.(value[0])}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Right side - Compliance Toggle and Send Button */}
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="compliance-toggle" className="text-xs">Compliance</Label>
            <Switch
              id="compliance-toggle"
              checked={complianceEnabled}
              onCheckedChange={onComplianceToggle}
            />
            <Button 
              type="submit" 
              disabled={!message.trim() || isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};