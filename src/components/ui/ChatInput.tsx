import { useState } from "react";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { Card } from "./card";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInput = ({ 
  onSendMessage, 
  isLoading, 
  placeholder = "Type your message for plagiarism and compliance check..." 
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
    <Card className="p-4 shadow-card border-border/50 bg-gradient-card">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[80px] resize-none border-border/50 focus:border-primary/50 transition-colors"
          disabled={isLoading}
        />
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </div>
          
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
      </form>
    </Card>
  );
}; 