import { useState, useEffect } from "react";
import { ChevronDown, Brain, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ModelSelectorProps {
  client: any;
  onModelChange?: (modelId: string | null, usePreferred: boolean) => void;
}

interface ModelOption {
  id: string;
  name: string;
  provider: string;
  icon: JSX.Element;
  description: string;
}

// Model display mapping with friendly names and icons
const MODEL_DISPLAY_MAP: Record<string, ModelOption> = {
  // OpenAI Models
  "gpt4": {
    id: "gpt4",
    name: "GPT-4",
    provider: "OpenAI",
    icon: <Sparkles className="w-4 h-4" />,
    description: "Most capable model for complex reasoning"
  },
  "gpt4o": {
    id: "gpt4o",
    name: "GPT-4o",
    provider: "OpenAI", 
    icon: <Sparkles className="w-4 h-4" />,
    description: "Multimodal model with vision capabilities"
  },
  "gpt4o-mini": {
    id: "gpt4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    icon: <Zap className="w-4 h-4" />,
    description: "Fast and efficient for most tasks"
  },

  // Anthropic Models
  "claude3.5-sonnet": {
    id: "claude3.5-sonnet",
    name: "Claude 3.5 Sonnet", 
    provider: "Anthropic",
    icon: <Brain className="w-4 h-4" />,
    description: "Excellent for analysis and reasoning"
  },
  "claude3.5-haiku": {
    id: "claude3.5-haiku",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    icon: <Zap className="w-4 h-4" />,
    description: "Fast and efficient Claude model"
  },

  // Google Models
  "gemini2-flash": {
    id: "gemini2-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    icon: <Zap className="w-4 h-4" />,
    description: "Latest fast Google model"
  },
  "gemini2.5-pro": {
    id: "gemini2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google", 
    icon: <Sparkles className="w-4 h-4" />,
    description: "Advanced reasoning and analysis"
  },

  // Meta Models
  "llama3": {
    id: "llama3",
    name: "Llama 3.3 70B",
    provider: "Meta",
    icon: <Brain className="w-4 h-4" />,
    description: "Open-source reasoning model"
  },

  // DeepSeek Models
  "deepseek-v3": {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    icon: <Sparkles className="w-4 h-4" />,
    description: "Advanced reasoning model"
  },
  "deepseek-r1": {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    icon: <Brain className="w-4 h-4" />,
    description: "Reasoning-focused model"
  },

  // Alibaba Models
  "qwen2.5": {
    id: "qwen2.5",
    name: "Qwen 2.5 72B",
    provider: "Alibaba",
    icon: <Brain className="w-4 h-4" />,
    description: "Multilingual reasoning model"
  },
  "qwq": {
    id: "qwq",
    name: "QwQ 32B",
    provider: "Alibaba",
    icon: <Brain className="w-4 h-4" />,
    description: "Question-answering specialist"
  }
};

export const ModelSelector = ({ client, onModelChange }: ModelSelectorProps) => {
  const [selectedModel, setSelectedModel] = useState<string>("auto");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's current preference and available models
  useEffect(() => {
    const loadModelData = async () => {
      if (!client) return;
      
      try {
        setIsLoading(true);
        const data = await client.getPreferredModel();
        
        setAvailableModels(data.accessible_models || []);
        
                 // Set current selection based on preference, default to auto
         if (data.preferred_model) {
           setSelectedModel(data.preferred_model);
           onModelChange?.(data.preferred_model, true);
         } else {
           setSelectedModel("auto");
           onModelChange?.(null, false);
         }
      } catch (error) {
        console.error("Failed to load model preferences:", error);
        toast.error("Failed to load model preferences");
      } finally {
        setIsLoading(false);
      }
    };

    loadModelData();
  }, [client, onModelChange]);

  const handleModelSelect = async (value: string) => {
    if (!client || isLoading) return;

    try {
      setIsLoading(true);
      
      if (value === "auto") {
        // User selected Auto - clear preference
        await client.clearPreferredModel();
        setSelectedModel("auto");
        onModelChange?.(null, false);
        toast.success("Switched to intelligent routing");
      } else {
        // User selected a specific model - set preference
        await client.setPreferredModel(value);
        setSelectedModel(value);
        onModelChange?.(value, true);
        const modelName = MODEL_DISPLAY_MAP[value]?.name || value;
        toast.success(`Switched to ${modelName}`);
      }
    } catch (error: any) {
      console.error("Failed to update model preference:", error);
      toast.error(error.message || "Failed to update model preference");
      // Revert selection on error
      const currentData = await client.getPreferredModel();
      setSelectedModel(currentData.preferred_model || "auto");
    } finally {
      setIsLoading(false);
    }
  };

   const getDisplayValue = () => {
     if (selectedModel === "auto") {
       return (
         <>
           <Brain className="w-4 h-4 text-purple-600" />
           <span>Auto</span>
         </>
       );
     }
     
     const model = MODEL_DISPLAY_MAP[selectedModel];
     if (model) {
       return (
         <>
           {model.icon}
           <span>{model.name}</span>
         </>
       );
     }
     
     return <span>{selectedModel}</span>;
   };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-10 px-3 gap-2 text-sm font-normal hover:bg-accent"
          disabled={isLoading}
        >
          {getDisplayValue()}
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[280px]" align="start">
        {/* Auto option */}
        <DropdownMenuItem onClick={() => handleModelSelect("auto")}>
          <div className="flex items-center gap-2 w-full">
            <Brain className="w-4 h-4 text-purple-600" />
            <div className="flex flex-col">
              <span>Auto</span>
              <span className="text-xs text-muted-foreground">Smart routing</span>
            </div>
          </div>
        </DropdownMenuItem>
        
        {/* Available models */}
        {availableModels.map((modelId) => {
          const model = MODEL_DISPLAY_MAP[modelId];
          if (!model) {
            return (
              <DropdownMenuItem key={modelId} onClick={() => handleModelSelect(modelId)}>
                <span>{modelId}</span>
              </DropdownMenuItem>
            );
          }
          
          return (
            <DropdownMenuItem key={modelId} onClick={() => handleModelSelect(modelId)}>
              <div className="flex items-center gap-2 w-full">
                {model.icon}
                <div className="flex flex-col">
                  <span>{model.name}</span>
                  <span className="text-xs text-muted-foreground">{model.provider} • {model.description}</span>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
