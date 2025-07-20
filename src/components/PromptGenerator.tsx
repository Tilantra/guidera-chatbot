import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, Wand2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export const PromptGenerator = ({ client }: { client: any }) => {
  const [userInput, setUserInput] = useState("");
  const [suggestion, setSuggestion] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePrompt = async () => {
    if (!userInput.trim()) {
      toast.error("Please enter your requirements first");
      return;
    }
    setIsGenerating(true);
    setSuggestion("");
    try {
      const res = await client.getSuggestions(userInput.trim());
      if (res) {
        // Show the entire raw JSON response as a string
        setSuggestion(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
        toast.success("Prompt suggestion generated successfully!");
      } else {
        toast.error("No suggestion received from server.");
      }
    } catch (err: any) {
      toast.error("Failed to generate suggestion: " + (err.message || err));
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(suggestion);
      setCopied(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy prompt");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          Prompt Generator
        </h2>
        <p className="text-muted-foreground">
          Generate professionally engineered prompts for optimal AI responses
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="requirements" className="text-foreground font-medium">
            Describe your requirements
          </Label>
          <Textarea
            id="requirements"
            placeholder="Example: I need to check a research paper for plagiarism and ensure it meets academic compliance standards..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>

        <Button 
          onClick={generatePrompt}
          disabled={isGenerating || !userInput.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Professional Prompt
            </>
          )}
        </Button>
      </Card>

      {suggestion && (
        <Card className="p-6 space-y-4">
          <Label className="text-foreground font-medium mb-2 block">Generated Suggestion</Label>
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
              {suggestion}
            </pre>
          </div>
        </Card>
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
  );
};