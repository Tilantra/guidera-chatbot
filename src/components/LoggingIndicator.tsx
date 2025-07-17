import { useState, useEffect } from "react";
import { Settings, Brain, Shield } from "lucide-react";

export const LoadingIndicator = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      icon: Settings,
      text: "Picking the right model..",
      duration: 1000
    },
    {
      icon: Brain,
      text: "Fetching response...",
      duration: 1500
    },
    {
      icon: Shield,
      text: "Checking policies",
      duration: 1000
    }
  ];

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    let totalTime = 0;

    steps.forEach((step, index) => {
      const timer = setTimeout(() => {
        setCurrentStep(index);
      }, totalTime);
      
      timers.push(timer);
      totalTime += step.duration;
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="flex items-center justify-center space-x-3 py-8">
      <div className="relative">
        <CurrentIcon className="h-6 w-6 text-primary animate-pulse" />
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin border-t-primary" />
      </div>
      <span className="text-foreground font-medium animate-pulse">
        {steps[currentStep].text}
      </span>
    </div>
  );
};