import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  targetId?: string;
  action?: 'open-control-grid' | 'close-popovers';
}

interface InteractiveTutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStepChange?: (step: TutorialStep) => void;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  open,
  onOpenChange,
  onStepChange
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Guidera',
      content: 'Hi, welcome to Guidera Chatbots tutorial. Let\'s explore the power of our enterprise control layer.',
    },
    {
      id: 'chat',
      targetId: 'control-grid-trigger',
      title: 'Control Grid',
      content: 'Use the control grid to control your responses. Balance performance, cost, and creativity in real-time.',
      action: 'open-control-grid'
    },
    {
      id: 'chat',
      targetId: 'compliance-toggle',
      title: 'Policy Compliance',
      content: 'On enabling this, your responses will be checked based on the policies you set in the policies section.',
      action: 'close-popovers'
    },
    {
      id: 'chat',
      targetId: 'redaction-toggle',
      title: 'Privacy Redaction',
      content: 'Enabling this will redact all sensitive information in the prompt input and response.',
    },
    {
      id: 'chat',
      targetId: 'capsule-hub-button',
      title: 'Capsule Hub',
      content: 'Access capsule hub features inside Guidera, allowing you to generate and drop AI context across platforms.',
    },
    {
      id: 'chat',
      targetId: 'magic-wand-button',
      title: 'Magic Wand',
      content: 'Enhance your prompts to get accurate responses instantly.',
    },
    {
      id: 'policies',
      targetId: 'add-policy-button',
      title: 'Policy Management',
      content: 'Add as many compliance policies as you like to safeguard your communications.',
    },
    {
      id: 'dashboard',
      targetId: 'dashboard-tab-trigger',
      title: 'Analytics Dashboard',
      content: 'View your analytics here. Track performance, usage, and compliance metrics.',
    }
  ];

  const updateTargetRect = useCallback(() => {
    const step = steps[currentStep];
    if (step.targetId) {
      const element = document.getElementById(step.targetId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());

        // Handle specialized actions
        if (step.action === 'open-control-grid') {
          // If the element is the trigger itself and the popover isn't open, we might need a way to trigger it.
          // Since we are an overlay, we'll rely on the parent component's onStepChange to handle state if needed,
          // but if we can just click it or send a custom event, that might work too.
          // For now, onStepChange in ComplianceChatBot will handle specialized triggers based on targetId.
        }

        return;
      }
    }
    setTargetRect(null);
  }, [currentStep, steps]);

  useEffect(() => {
    if (open) {
      updateTargetRect();
      onStepChange?.(steps[currentStep]);
    } else {
      setCurrentStep(0);
    }
  }, [open, currentStep, updateTargetRect, onStepChange]);

  useEffect(() => {
    const handleUpdate = () => updateTargetRect();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    // Also observe DOM changes to catch when targeted elements appear (e.g., after tab switches)
    const observer = new MutationObserver(() => {
      updateTargetRect();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
      observer.disconnect();
    };
  }, [updateTargetRect]);

  if (!open) return null;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onOpenChange(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      <AnimatePresence>
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute pointer-events-none z-[201]"
            style={{
              top: targetRect.top + targetRect.height / 2,
              left: targetRect.left + targetRect.width / 2,
            }}
          >
            {/* Horizontal Moving Circle Animation */}
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{
                  x: [-30, 30, -30],
                  opacity: [0.4, 1, 0.4],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "easeInOut"
                }}
                className="h-5 w-5 rounded-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.9)] border-2 border-white/20"
              />
              <div className="absolute h-1 w-16 bg-primary/20 rounded-full blur-sm" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="absolute bg-card border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 rounded-2xl w-[340px] pointer-events-auto h-fit"
          style={targetRect ? {
            top: currentStepData.action === 'open-control-grid'
              ? Math.max(20, targetRect.top - 380)
              : (targetRect.top > window.innerHeight / 2
                ? Math.max(20, targetRect.top - 260)
                : Math.min(window.innerHeight - 300, targetRect.bottom + 40)),
            left: currentStepData.action === 'open-control-grid'
              ? Math.min(window.innerWidth - 360, targetRect.left + 60)
              : Math.min(window.innerWidth - 360, Math.max(20, targetRect.left - 170 + targetRect.width / 2)),
          } : {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 'auto',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold tracking-tight">{currentStepData.title}</h4>
              <p className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-wider">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-lg hover:bg-secondary/50 text-muted-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed font-medium mb-6">
            {currentStepData.content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'bg-primary w-4' : 'bg-secondary'}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="h-8 px-3 text-xs"
              >
                Back
              </Button>
              <Button
                size="sm"
                onClick={nextStep}
                className="h-8 px-4 text-xs font-bold"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
