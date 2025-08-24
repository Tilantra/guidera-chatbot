import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface PromptSuggestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userInput: string;
  client: any;
  onPromptSelect: (prompt: string) => void;
}

export const PromptSuggestionsDialog = ({ 
  open, 
  onOpenChange, 
  userInput, 
  client, 
  onPromptSelect 
}: PromptSuggestionsDialogProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate prompts when dialog opens
  useEffect(() => {
    if (open && userInput.trim()) {
      generatePrompts();
    }
  }, [open, userInput]);

  const generatePrompts = async () => {
    if (!userInput.trim()) {
      toast.error("Please enter your requirements first");
      return;
    }
    
    setIsGenerating(true);
    setSuggestions([]);
    
    try {
      const res = await client.getSuggestions(userInput);
      if (res && res.length > 0) {
        setSuggestions(res);
        toast.success("Prompt suggestions generated successfully!");
      } else {
        setSuggestions([]);
        toast.error("No suggestions received from server.");
      }
    } catch (err: any) {
      toast.error("Failed to generate suggestions: " + (err.message || err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    onPromptSelect(prompt);
    onOpenChange(false);
    toast.success("Prompt selected and inserted!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Prompt Suggestions
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Based on your input: "{userInput.length > 50 ? userInput.substring(0, 50) + "..." : userInput}"
          </div>

          {isGenerating ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
              <span>Generating prompt suggestions...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-3">
              {suggestions.map((suggestion, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-sm mb-2">Suggestion {idx + 1}</div>
                      <div className="text-sm text-foreground leading-relaxed">
                        {suggestion}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handlePromptSelect(suggestion)}
                      className="flex items-center gap-2 shrink-0"
                    >
                      <Check className="h-4 w-4" />
                      Select
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No suggestions available.</p>
              <Button onClick={generatePrompts} disabled={isGenerating}>
                <Wand2 className="h-4 w-4 mr-2" />
                Retry Generation
              </Button>
            </div>
          )}

          <Card className="p-4 bg-primary/5 border-primary/20">
            <h3 className="font-medium text-foreground mb-2">💡 Tips for Better Prompts</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Be specific about your content type (academic, business, creative)</li>
              <li>• Mention any specific compliance standards you need</li>
              <li>• Include your target audience or publication requirements</li>
              <li>• Specify the level of analysis depth you prefer</li>
            </ul>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
