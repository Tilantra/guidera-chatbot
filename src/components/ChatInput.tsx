import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Send, Loader2, Shield, Grid, Wand2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useTheme } from "./ThemeProvider";
import { PromptSuggestionsDialog } from "./PromptSuggestionsDialog";
import { ModelSelector } from "./ModelSelector";
import { CapsuleControlBar } from "./CapsuleControlBar";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  complianceEnabled?: boolean;
  onComplianceToggle?: (enabled: boolean) => void;
  cpValue?: number | [number, number];
  onCpChange?: (value: number | [number, number]) => void;
  redactionEnabled?: boolean;
  onRedactionToggle?: (enabled: boolean) => void;
  client?: any;
  onModelChange?: (modelId: string | null, usePreferred: boolean) => void;
  // Capsule props
  onGenerateCapsule?: () => void;
  onDropCapsule?: () => void;
  capsuleDisabled?: boolean;
}

interface AxisValues {
  performance: number;  // 0-1, right axis
  cost: number;         // 0-1, left axis  
  deterministic: number;// 0-1, top axis
  creative: number;     // 0-1, bottom axis
}

export const ChatInput = ({
  onSendMessage,
  isLoading,
  placeholder = "Type your message for plagiarism and compliance check...",
  complianceEnabled = true,
  onComplianceToggle,
  cpValue = 0.5,
  onCpChange,
  redactionEnabled = false,
  onRedactionToggle,
  client,
  onModelChange,
  onGenerateCapsule,
  onDropCapsule,
  capsuleDisabled = false,
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { theme } = useTheme();

  // Initialize axis values from cpValue
  const initializeAxisValues = (cp: number | [number, number]): AxisValues => {
    // Start with all axes at 1 (end position)
    return {
      performance: 1,
      cost: 1,
      deterministic: 1,
      creative: 1,
    };
  };

  const [axisValues, setAxisValues] = useState<AxisValues>(() => initializeAxisValues(cpValue));

  // Convert axis values to cp values using tradeoff formulas
  const calculateCpValues = (values: AxisValues): [number, number] => {
    // Tradeoff mapping:
    // cp[0]: 0 = cost-favored, 1 = performance-favored
    // cp[1]: 0 = deterministic-favored, 1 = creative-favored

    const { performance, cost, deterministic, creative } = values;

    // X-axis: Performance vs Cost tradeoff
    // X = (performance^2 + 0.1) / (performance^2 + cost^2 + 0.2)
    const pSquared = performance * performance;
    const coSquared = cost * cost;
    const cpX = (pSquared + 0.1) / (pSquared + coSquared + 0.2);

    // Y-axis: Creative vs Deterministic tradeoff  
    // Y = (creative^2 + 0.1) / (creative^2 + deterministic^2 + 0.2)
    const crSquared = creative * creative;
    const dSquared = deterministic * deterministic;
    const cpY = (crSquared + 0.1) / (crSquared + dSquared + 0.2);

    return [
      Math.max(0, Math.min(1, cpX)),
      Math.max(0, Math.min(1, cpY))
    ];
  };

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

  const handleMagicButtonClick = () => {
    if (!message.trim()) {
      return; // Don't open dialog if no input
    }
    setDialogOpen(true);
  };

  const handlePromptSelect = (selectedPrompt: string) => {
    setMessage(selectedPrompt);
  };

  // Calculate current cp values from axis values
  const cp = calculateCpValues(axisValues);

  // Axis label color variables
  const AXIS_COLORS = {
    top: '#bf4e08',
    right: '#3d734b',
    bottom: '#5667C7',
    left: '#900F32',
  };

  // Dark mode axis colors
  const DARK_AXIS_COLORS = {
    top: '#bf4e08',
    right: '#3d734b',
    bottom: '#5667C7',
    left: '#fbbf24',     // yellow for Cost-Savings in dark mode
  };

  const currentColors = theme === 'dark' ? DARK_AXIS_COLORS : AXIS_COLORS;

  return (
    <Card className="p-3 bg-card/70 backdrop-blur-md border border-border/40 shadow-elegant rounded-xl relative z-10">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative group">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 min-h-[90px] resize-none border border-border/20 bg-background/30 px-3 py-2 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-200 text-sm placeholder:text-muted-foreground/50"
            disabled={isLoading}
          />
          {client && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleMagicButtonClick}
              disabled={!message.trim() || isLoading}
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-all shadow-sm active:scale-95"
              title="Generate prompt suggestions"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left side - ControlGrid and Model Selector */}
          <div className="flex items-end gap-3">
            {/* ControlGrid Button and Popover */}
            <div className="flex flex-col flex-1 max-w-xs">
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="min-w-[100px] h-8 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Grid className="w-3.5 h-3.5" />
                      ControlGrid
                    </button>
                    <span className="flex items-center gap-1">
                      <span
                        className="px-2.5 py-1 rounded-full bg-primary/10 text-[10px] text-primary font-bold font-mono border border-primary/20 shadow-sm"
                        title="X value"
                      >
                        X:{cp[0].toFixed(1)}
                      </span>
                      <span
                        className="px-2.5 py-1 rounded-full bg-primary/10 text-[10px] text-primary font-bold font-mono border border-primary/20 shadow-sm"
                        title="Y value"
                      >
                        Y:{cp[1].toFixed(1)}
                      </span>
                    </span>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-3 flex flex-col items-center min-w-[240px] bg-card/95 backdrop-blur-xl border-border/40 shadow-2xl">
                  <div className="flex flex-col items-center">
                    {/* Top label */}
                    <div className="flex justify-center w-full mb-1">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: AXIS_COLORS.top }}>Deterministic</span>
                    </div>
                    <div className="flex flex-row items-center justify-center">
                      {/* Left label */}
                      <div className="flex flex-col justify-center items-center h-full mr-2" style={{ height: '176px' }}>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: theme === 'dark' ? '#fbbf24' : currentColors.left, writingMode: 'vertical-rl', transform: 'rotate(-180deg)' }}>Cost-Savings</span>
                      </div>
                      <div className="relative" style={{ width: '176px', height: '176px' }}>
                        <div className={`absolute inset-0 rounded-lg border ${theme === 'dark'
                          ? 'bg-gradient-to-br from-gray-800/50 via-gray-850/50 to-gray-900/50 border-gray-600/50 shadow-inner'
                          : 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-200/50 shadow-inner'
                          }`} />

                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                          {/* Horizontal axis */}
                          <line
                            x1="0" y1="50" x2="100" y2="50"
                            stroke={theme === 'dark' ? '#4b5563' : '#e5e7eb'}
                            strokeWidth="1"
                          />
                          {/* Vertical axis */}
                          <line
                            x1="50" y1="0" x2="50" y2="100"
                            stroke={theme === 'dark' ? '#4b5563' : '#e5e7eb'}
                            strokeWidth="1"
                          />
                        </svg>

                        {/* Colored area formed by the four dots */}
                        <FourDotArea axisValues={axisValues} theme={theme} />

                        {/* Four axis dots */}
                        <AxisDot
                          position="top"
                          value={axisValues.deterministic}
                          color={currentColors.top}
                          onChange={(value) => {
                            const newValues = { ...axisValues, deterministic: value };
                            setAxisValues(newValues);
                            onCpChange?.(calculateCpValues(newValues));
                          }}
                        />
                        <AxisDot
                          position="right"
                          value={axisValues.performance}
                          color={currentColors.right}
                          onChange={(value) => {
                            const newValues = { ...axisValues, performance: value };
                            setAxisValues(newValues);
                            onCpChange?.(calculateCpValues(newValues));
                          }}
                        />
                        <AxisDot
                          position="bottom"
                          value={axisValues.creative}
                          color={currentColors.bottom}
                          onChange={(value) => {
                            const newValues = { ...axisValues, creative: value };
                            setAxisValues(newValues);
                            onCpChange?.(calculateCpValues(newValues));
                          }}
                        />
                        <AxisDot
                          position="left"
                          value={axisValues.cost}
                          color={theme === 'dark' ? '#fbbf24' : currentColors.left}
                          onChange={(value) => {
                            const newValues = { ...axisValues, cost: value };
                            setAxisValues(newValues);
                            onCpChange?.(calculateCpValues(newValues));
                          }}
                        />
                      </div>
                      {/* Right label */}
                      <div className="flex flex-col justify-center items-center h-full ml-2" style={{ height: '176px' }}>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: currentColors.right, writingMode: 'vertical-rl' }}>Performance</span>
                      </div>
                    </div>
                    {/* Bottom label */}
                    <div className="flex justify-center w-full mt-1">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: currentColors.bottom }}>Creative</span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Model Selector - positioned after ControlGrid */}
            <ModelSelector
              client={client}
              onModelChange={onModelChange}
            />

            {/* Capsule Button - positioned after Model Selector */}
            {onGenerateCapsule && onDropCapsule && (
              <div className="ml-2">
                <CapsuleControlBar
                  onGenerateCapsule={onGenerateCapsule}
                  onDropCapsule={onDropCapsule}
                  disabled={capsuleDisabled}
                />
              </div>
            )}
          </div>

          {/* Right side - Compliance Toggle, Redaction Toggle, and Send Button */}
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="compliance-toggle" className="text-xs">Compliance</Label>
            <Switch
              id="compliance-toggle"
              checked={complianceEnabled}
              onCheckedChange={onComplianceToggle}
            />
            <Label htmlFor="redaction-toggle" className="text-xs ml-2">Redaction</Label>
            <Switch
              id="redaction-toggle"
              checked={redactionEnabled}
              onCheckedChange={onRedactionToggle}
            />
            <Button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="min-w-[100px] h-9 rounded-lg bg-primary shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 text-sm font-bold"
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

      <PromptSuggestionsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userInput={message}
        client={client}
        onPromptSelect={handlePromptSelect}
      />
    </Card >
  );
};

// AxisDot component - dots that move along specific axes
function AxisDot({ position, value, color, onChange }: {
  position: 'top' | 'right' | 'bottom' | 'left';
  value: number;
  color: string;
  onChange: (value: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const clamp = (v: number) => Math.max(0, Math.min(1, Math.round(v * 10) / 10));

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();

    let newValue: number;
    if (position === 'top' || position === 'bottom') {
      // Vertical axis - use Y coordinate
      newValue = (e.clientY - rect.top) / rect.height;
      if (position === 'top') newValue = 1 - newValue; // Invert for top axis
    } else {
      // Horizontal axis - use X coordinate  
      newValue = (e.clientX - rect.left) / rect.width;
      if (position === 'left') newValue = 1 - newValue; // Invert for left axis
    }

    onChange(clamp(newValue));
  };

  const handlePointerUp = () => setDragging(false);

  // Calculate position based on axis and value
  let left: string, top: string;
  if (position === 'top') {
    left = 'calc(50% - 7px)';
    top = `calc(${(1 - value) * 50}% - 7px)`; // From center to top
  } else if (position === 'right') {
    left = `calc(${50 + value * 50}% - 7px)`; // From center to right
    top = 'calc(50% - 7px)';
  } else if (position === 'bottom') {
    left = 'calc(50% - 7px)';
    top = `calc(${50 + value * 50}% - 7px)`; // From center to bottom
  } else { // left
    left = `calc(${50 - value * 50}% - 7px)`; // From center to left
    top = 'calc(50% - 7px)';
  }

  return (
    <div
      className="absolute"
      style={{ left, top, zIndex: 10 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      tabIndex={0}
      role="slider"
      aria-valuenow={value}
      aria-valuetext={`${position}: ${value.toFixed(1)}`}
      aria-valuemin={0}
      aria-valuemax={1}
    >
      <div
        className="w-3 h-3 rounded-full border-2 border-white shadow cursor-pointer transition-transform active:scale-110"
        style={{ background: color }}
      />
    </div>
  );
}

// FourDotArea component - creates colored area from the four dots
function FourDotArea({ axisValues, theme }: { axisValues: AxisValues; theme: string }) {
  // Calculate the four points of the area
  const points = [
    { x: 50, y: 50 - axisValues.deterministic * 50 }, // Top
    { x: 50 + axisValues.performance * 50, y: 50 },   // Right  
    { x: 50, y: 50 + axisValues.creative * 50 },      // Bottom
    { x: 50 - axisValues.cost * 50, y: 50 },          // Left
  ];

  const pathData = `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y} L ${points[2].x} ${points[2].y} L ${points[3].x} ${points[3].y} Z`;

  // Create a sophisticated gradient based on corner influences
  const createGradientId = 'fourDotGradient';

  const getCornerInfluences = () => {
    const { performance, cost, deterministic, creative } = axisValues;

    // Define corner colors with intensity based on values - using brighter, more vibrant colors
    const corners = [
      { // Top-Right: Performance + Deterministic
        x: 75, y: 25,
        influence: (performance * 0.5 + deterministic * 0.5) * Math.max(performance, deterministic),
        color: theme === 'dark' ? '#00ff88' : '#00cc66', // Bright neon green
        name: 'performance-deterministic'
      },
      { // Top-Left: Cost + Deterministic  
        x: 25, y: 25,
        influence: (cost * 0.5 + deterministic * 0.5) * Math.max(cost, deterministic),
        color: theme === 'dark' ? '#ffaa00' : '#ff8800', // Bright orange
        name: 'cost-deterministic'
      },
      { // Bottom-Right: Performance + Creative
        x: 75, y: 75,
        influence: (performance * 0.5 + creative * 0.5) * Math.max(performance, creative),
        color: theme === 'dark' ? '#aa44ff' : '#9933ff', // Bright purple
        name: 'performance-creative'
      },
      { // Bottom-Left: Cost + Creative
        x: 25, y: 75,
        influence: (cost * 0.5 + creative * 0.5) * Math.max(cost, creative),
        color: theme === 'dark' ? '#ff4444' : '#ff2222', // Bright red
        name: 'cost-creative'
      }
    ];

    return corners.filter(corner => corner.influence > 0);
  };

  const influences = getCornerInfluences();
  const totalInfluence = influences.reduce((sum, corner) => sum + corner.influence, 0);

  // Create base color based on weighted influences
  const getAreaColor = () => {
    if (totalInfluence === 0) {
      return theme === 'dark' ? 'rgba(75, 85, 99, 0.4)' : 'rgba(209, 213, 219, 0.4)';
    }

    // Single dominant corner
    if (influences.length === 1) {
      const corner = influences[0];
      const alpha = Math.min(0.8, 0.4 + corner.influence * 0.4); // Increased base alpha for more vibrancy
      return corner.color.replace(')', `, ${alpha})`).replace('#', 'rgba(').replace(/(.{2})(.{2})(.{2})/, (_, r, g, b) =>
        `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${alpha})`
      );
    }

    // Blend multiple corners
    let r = 0, g = 0, b = 0;
    influences.forEach(corner => {
      const weight = corner.influence / totalInfluence;
      const rgb = corner.color.replace('#', '');
      r += parseInt(rgb.substr(0, 2), 16) * weight;
      g += parseInt(rgb.substr(2, 2), 16) * weight;
      b += parseInt(rgb.substr(4, 2), 16) * weight;
    });

    const alpha = Math.min(0.8, 0.4 + totalInfluence * 0.4); // Increased base alpha
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
  };

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
      <defs>
        <radialGradient id={createGradientId} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={getAreaColor()} />
          <stop offset="70%" stopColor={getAreaColor().replace(/[\d.]+\)$/, '0.6)')} />
          <stop offset="100%" stopColor={theme === 'dark' ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.2)'} />
        </radialGradient>
        {/* Add a glow effect filter */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={pathData}
        fill={`url(#${createGradientId})`}
        stroke={totalInfluence > 0 ? getAreaColor().replace(/[\d.]+\)$/, '0.9)') : (theme === 'dark' ? '#6b7280' : '#9ca3af')}
        strokeWidth={totalInfluence > 0 ? "1" : "0.5"}
        filter={totalInfluence > 0.3 ? "url(#glow)" : "none"}
        opacity="0.9"
      />
    </svg>
  );
}