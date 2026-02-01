import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface TutorialStep {
  title: string;
  content: string;
  targetElement?: string; // CSS selector
  position?: "top" | "bottom" | "left" | "right";
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Welcome to Guidera Chatbot!",
    content: "This quick tutorial will show you how to use capsules to save and reuse conversation context. Click Next to continue.",
  },
  {
    title: "Generate Capsule",
    content: "Click the capsule icon to save your current conversation. You can create a new capsule or add a version to an existing one.",
    targetElement: '[title="Generate Capsule"]',
    position: "bottom",
  },
  {
    title: "Drop Capsule",
    content: "Load previous conversations into your current chat to continue where you left off or reference past discussions.",
    targetElement: '[title="Drop Capsule"]',
    position: "bottom",
  },
  {
    title: "Team Collaboration",
    content: "Select a team to share capsules with your teammates, or work privately for personal capsules.",
  },
  {
    title: "Manage Teams",
    content: "Create new teams, invite members, and organize your collaborative workspaces.",
  },
  {
    title: "You're All Set!",
    content: "Start chatting and use capsules to build a knowledge base across conversations. Happy chatting!",
  },
];

interface InteractiveTutorialProps {
  open: boolean;
  onClose: () => void;
}

export function InteractiveTutorial({ open, onClose }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const step = TUTORIAL_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      setHighlightedElement(null);
      return;
    }

    if (step.targetElement) {
      const element = document.querySelector(step.targetElement) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      setHighlightedElement(null);
    }
  }, [open, currentStep, step.targetElement]);

  useEffect(() => {
    if (highlightedElement) {
      highlightedElement.classList.add("tutorial-highlight");
      return () => {
        highlightedElement.classList.remove("tutorial-highlight");
      };
    }
  }, [highlightedElement]);

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 tutorial-backdrop"
        onClick={onClose}
      />

      {/* Tutorial Box */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 bg-background border rounded-lg shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {step.content}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {TUTORIAL_STEPS.length}
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={isFirstStep}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
              >
                {isLastStep ? "Finish" : "Next"}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .tutorial-highlight {
          position: relative;
          z-index: 51;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5);
          border-radius: 8px;
          transition: box-shadow 0.3s ease;
        }

        .tutorial-backdrop {
          pointer-events: none;
        }
      `}</style>
    </>
  );
}
