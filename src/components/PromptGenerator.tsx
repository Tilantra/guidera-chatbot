import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, Wand2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export const PromptGenerator = () => {
  const [userInput, setUserInput] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePrompt = async () => {
    if (!userInput.trim()) {
      toast.error("Please enter your requirements first");
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call for prompt engineering
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const engineeredPrompt = `You are a professional content compliance and plagiarism detection assistant. Your task is to analyze the following content: "${userInput.trim()}"

Please provide a comprehensive analysis that includes:

1. **Content Analysis**: Examine the text for originality, clarity, and structure
2. **Plagiarism Detection**: Check for potential similarities with existing sources and provide similarity percentages
3. **Compliance Verification**: Verify adherence to:
   - Privacy regulations (PII detection)
   - Content guidelines and community standards
   - Copyright and intellectual property rights
   - Professional ethical standards

4. **Source Attribution**: If similarities are found, provide detailed source information including URLs and similarity percentages

5. **Recommendations**: Suggest improvements for better compliance and originality

Format your response with clear sections and actionable insights. Use a professional, detailed approach while maintaining accuracy and reliability in your assessment.`;

    setGeneratedPrompt(engineeredPrompt);
    setIsGenerating(false);
    toast.success("Professional prompt generated successfully!");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
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

      {generatedPrompt && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-foreground font-medium">Generated Prompt</Label>
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
              {generatedPrompt}
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