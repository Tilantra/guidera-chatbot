import { useState, useEffect } from "react";
import { ChevronDown, Brain, Zap, Sparkles, Bot, Star, Cpu, Lightbulb, Shield, Cloud } from "lucide-react";
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
  "gpt4-mini": {
    id: "gpt4-mini",
    name: "GPT-4 Mini",
    provider: "OpenAI",
    icon: <Zap className="w-4 h-4" />,
    description: "Compact version of GPT-4"
  },
  "gpt4-nano": {
    id: "gpt4-nano",
    name: "GPT-4 Nano",
    provider: "OpenAI",
    icon: <Zap className="w-4 h-4" />,
    description: "Ultra-fast lightweight model"
  },
  "gpt4.5": {
    id: "gpt4.5",
    name: "GPT-4.5 Preview",
    provider: "OpenAI",
    icon: <Star className="w-4 h-4" />,
    description: "Next-generation preview model"
  },
  "chatgpt4o": {
    id: "chatgpt4o",
    name: "ChatGPT-4o Latest",
    provider: "OpenAI",
    icon: <Bot className="w-4 h-4" />,
    description: "Latest ChatGPT optimized model"
  },
  "o3-high": {
    id: "o3-high",
    name: "o3 High",
    provider: "OpenAI",
    icon: <Brain className="w-4 h-4" />,
    description: "Advanced reasoning at high performance"
  },
  "o3-medium": {
    id: "o3-medium",
    name: "o3 Medium",
    provider: "OpenAI",
    icon: <Brain className="w-4 h-4" />,
    description: "Balanced reasoning performance"
  },
  "o4-mini-high": {
    id: "o4-mini-high",
    name: "o4 Mini High",
    provider: "OpenAI",
    icon: <Brain className="w-4 h-4" />,
    description: "Compact reasoning at high performance"
  },
  "o4-mini-medium": {
    id: "o4-mini-medium",
    name: "o4 Mini Medium",
    provider: "OpenAI",
    icon: <Brain className="w-4 h-4" />,
    description: "Compact reasoning at medium performance"
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
  "claude3-sonnet-thinking": {
    id: "claude3-sonnet-thinking",
    name: "Claude 3 Sonnet Thinking",
    provider: "Anthropic",
    icon: <Brain className="w-4 h-4" />,
    description: "Advanced reasoning with thinking process"
  },
  "claude3-sonnet": {
    id: "claude3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    icon: <Brain className="w-4 h-4" />,
    description: "Balanced performance model"
  },
  "claude4-opus-thinking": {
    id: "claude4-opus-thinking",
    name: "Claude 4 Opus Thinking",
    provider: "Anthropic",
    icon: <Sparkles className="w-4 h-4" />,
    description: "Most powerful Claude with reasoning"
  },
  "claude4-sonnet-thinking": {
    id: "claude4-sonnet-thinking",
    name: "Claude 4 Sonnet Thinking",
    provider: "Anthropic",
    icon: <Brain className="w-4 h-4" />,
    description: "Advanced Sonnet with reasoning"
  },
  "claude4-opus": {
    id: "claude4-opus",
    name: "Claude 4 Opus",
    provider: "Anthropic",
    icon: <Sparkles className="w-4 h-4" />,
    description: "Most powerful Claude model"
  },
  "claude4-sonnet": {
    id: "claude4-sonnet",
    name: "Claude 4 Sonnet",
    provider: "Anthropic",
    icon: <Brain className="w-4 h-4" />,
    description: "Next-gen balanced model"
  },

  // Google Models
  "gemini2-flash": {
    id: "gemini2-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    icon: <Zap className="w-4 h-4" />,
    description: "Latest fast Google model"
  },
  "gemini2.5-flash": {
    id: "gemini2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    icon: <Zap className="w-4 h-4" />,
    description: "Fast and efficient multimodal model"
  },
  "gemini2.5-pro": {
    id: "gemini2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google", 
    icon: <Sparkles className="w-4 h-4" />,
    description: "Advanced reasoning and analysis"
  },
  "gemini2.5-pro-old": {
    id: "gemini2.5-pro-old",
    name: "Gemini 2.5 Pro (Legacy)",
    provider: "Google",
    icon: <Sparkles className="w-4 h-4" />,
    description: "Previous version of Gemini 2.5 Pro"
  },
  "gemini2.5-flash-old": {
    id: "gemini2.5-flash-old",
    name: "Gemini 2.5 Flash (Legacy)",
    provider: "Google",
    icon: <Zap className="w-4 h-4" />,
    description: "Previous version of Gemini 2.5 Flash"
  },
  "gemini2-flash-lite": {
    id: "gemini2-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    provider: "Google",
    icon: <Zap className="w-4 h-4" />,
    description: "Lightweight version of Gemini Flash"
  },
  "learnlm2-flash": {
    id: "learnlm2-flash",
    name: "LearnLM 2.0 Flash",
    provider: "Google",
    icon: <Lightbulb className="w-4 h-4" />,
    description: "Educational AI model"
  },
  "learnlm1.5-pro": {
    id: "learnlm1.5-pro",
    name: "LearnLM 1.5 Pro",
    provider: "Google",
    icon: <Lightbulb className="w-4 h-4" />,
    description: "Advanced educational model"
  },

  // Meta Models
  "llama3": {
    id: "llama3",
    name: "Llama 3.3 70B",
    provider: "Meta",
    icon: <Brain className="w-4 h-4" />,
    description: "Open-source reasoning model"
  },
  "llama4": {
    id: "llama4",
    name: "Llama 4 Maverick",
    provider: "Meta",
    icon: <Star className="w-4 h-4" />,
    description: "Next-generation Llama model"
  },
  "gemma3": {
    id: "gemma3",
    name: "Gemma 3 27B",
    provider: "Google",
    icon: <Brain className="w-4 h-4" />,
    description: "Open-source instruction-tuned model"
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
  "deepseek-r1-llama": {
    id: "deepseek-r1-llama",
    name: "DeepSeek R1 Llama",
    provider: "DeepSeek",
    icon: <Brain className="w-4 h-4" />,
    description: "R1 distilled into Llama architecture"
  },
  "deepseek-r1-qwen": {
    id: "deepseek-r1-qwen",
    name: "DeepSeek R1 Qwen",
    provider: "DeepSeek",
    icon: <Brain className="w-4 h-4" />,
    description: "R1 distilled into Qwen architecture"
  },

  // Alibaba Models
  "qwen2.5": {
    id: "qwen2.5",
    name: "Qwen 2.5 72B",
    provider: "Alibaba",
    icon: <Brain className="w-4 h-4" />,
    description: "Multilingual reasoning model"
  },
  "qwen2.5-7b": {
    id: "qwen2.5-7b",
    name: "Qwen 2.5 7B",
    provider: "Alibaba",
    icon: <Zap className="w-4 h-4" />,
    description: "Compact multilingual model"
  },
  "qwen2.5-max": {
    id: "qwen2.5-max",
    name: "Qwen 2.5 Max",
    provider: "Alibaba",
    icon: <Sparkles className="w-4 h-4" />,
    description: "Maximum capability Qwen model"
  },
  "qwen3-large": {
    id: "qwen3-large",
    name: "Qwen 3 Large",
    provider: "Alibaba",
    icon: <Sparkles className="w-4 h-4" />,
    description: "Large-scale thinking model"
  },
  "qwen3-medium": {
    id: "qwen3-medium",
    name: "Qwen 3 Medium",
    provider: "Alibaba",
    icon: <Brain className="w-4 h-4" />,
    description: "Balanced performance and efficiency"
  },
  "qwen3-small": {
    id: "qwen3-small",
    name: "Qwen 3 Small",
    provider: "Alibaba",
    icon: <Zap className="w-4 h-4" />,
    description: "Compact thinking model"
  },
  "qwq": {
    id: "qwq",
    name: "QwQ 32B",
    provider: "Alibaba",
    icon: <Brain className="w-4 h-4" />,
    description: "Question-answering specialist"
  },

  // Mistral Models
  "mistral-small": {
    id: "mistral-small",
    name: "Mistral Small",
    provider: "Mistral AI",
    icon: <Zap className="w-4 h-4" />,
    description: "Fast and cost-effective model"
  },
  "mistral-medium": {
    id: "mistral-medium",
    name: "Mistral Medium",
    provider: "Mistral AI",
    icon: <Brain className="w-4 h-4" />,
    description: "Balanced performance model"
  },
  "mistral-large": {
    id: "mistral-large",
    name: "Mistral Large",
    provider: "Mistral AI",
    icon: <Sparkles className="w-4 h-4" />,
    description: "Most capable Mistral model"
  },

  // xAI Models
  "grok3": {
    id: "grok3",
    name: "Grok 3 Beta",
    provider: "xAI",
    icon: <Star className="w-4 h-4" />,
    description: "Conversational AI with personality"
  },
  "grok3-mini-high": {
    id: "grok3-mini-high",
    name: "Grok 3 Mini High",
    provider: "xAI",
    icon: <Zap className="w-4 h-4" />,
    description: "Compact Grok with high performance"
  },

  // Microsoft Models
  "phi4": {
    id: "phi4",
    name: "Phi-4 Reasoning",
    provider: "Microsoft",
    icon: <Brain className="w-4 h-4" />,
    description: "Small but powerful reasoning model"
  },
  "step2": {
    id: "step2",
    name: "Step-2 16K",
    provider: "Microsoft",
    icon: <Brain className="w-4 h-4" />,
    description: "Multi-step reasoning model"
  },

  // Cohere Models
  "command-r": {
    id: "command-r",
    name: "Command R",
    provider: "Cohere",
    icon: <Bot className="w-4 h-4" />,
    description: "Retrieval-augmented generation"
  },
  "command-r-plus": {
    id: "command-r-plus",
    name: "Command R+",
    provider: "Cohere",
    icon: <Sparkles className="w-4 h-4" />,
    description: "Enhanced RAG capabilities"
  },

  // Amazon Models
  "nova-pro": {
    id: "nova-pro",
    name: "Nova Pro",
    provider: "Amazon",
    icon: <Cloud className="w-4 h-4" />,
    description: "Professional multimodal model"
  },
  "nova-lite": {
    id: "nova-lite",
    name: "Nova Lite",
    provider: "Amazon",
    icon: <Zap className="w-4 h-4" />,
    description: "Lightweight multimodal model"
  },
  "nova-micro": {
    id: "nova-micro",
    name: "Nova Micro",
    provider: "Amazon",
    icon: <Zap className="w-4 h-4" />,
    description: "Ultra-compact model"
  },

  // Specialized Models
  "hunyuan": {
    id: "hunyuan",
    name: "Hunyuan Turbo",
    provider: "Tencent",
    icon: <Zap className="w-4 h-4" />,
    description: "Fast Chinese language model"
  },
  "dracarys2": {
    id: "dracarys2",
    name: "Dracarys2 72B",
    provider: "Dracarys",
    icon: <Brain className="w-4 h-4" />,
    description: "High-performance instruct model"
  },
  "dracarys2-llama": {
    id: "dracarys2-llama",
    name: "Dracarys2 Llama 70B",
    provider: "Dracarys",
    icon: <Brain className="w-4 h-4" />,
    description: "Llama-based instruction model"
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
