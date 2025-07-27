import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Send, Loader2, Shield, Grid } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useTheme } from "./ThemeProvider";

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
  onRedactionToggle
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const { theme } = useTheme();

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

  // Support both old and new cpValue
  const cp = Array.isArray(cpValue) ? cpValue : [cpValue as number, 0.5];

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
    <Card className="p-4 shadow-card border-border/50 bg-card">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[80px] resize-none border-border/50 focus:border-primary/50 transition-colors"
          disabled={isLoading}
        />
        
        {/* Controls Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left side - ControlGrid Button and Popover */}
          <div className="flex flex-col flex-1 max-w-xs">
            <Popover>
              <PopoverTrigger asChild>
            <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="min-w-[100px] h-10 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold shadow hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <Grid className="w-4 h-4 mr-1" />
                    ControlGrid
                  </button>
                  <span className="flex items-center gap-1">
                    <span
                      className="px-2 py-0.5 rounded-full bg-purple-100 text-xs text-purple-700 font-semibold font-mono border border-purple-200"
                      title="X value"
                    >
                      {cp[0].toFixed(1)}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full bg-purple-100 text-xs text-purple-700 font-semibold font-mono border border-purple-200"
                      title="Y value"
                    >
                      {cp[1].toFixed(1)}
                    </span>
                  </span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-4 flex flex-col items-center min-w-[320px]">
                  <div className="flex flex-col items-center">
                    {/* Top label */}
                    <div className="flex justify-center w-full">
                      <span className="text-base font-bold" style={{ color: AXIS_COLORS.top, letterSpacing: 1 }}>Deterministic</span>
                    </div>
                    <div className="flex flex-row items-center justify-center mt-1 mb-1">
                      {/* Left label */}
                      <div className="flex flex-col justify-center items-center h-full mr-2" style={{height: '256px'}}>
                        <span className="text-base font-bold" style={{ color: theme === 'dark' ? '#fbbf24' : currentColors.left, writingMode: 'vertical-rl', transform: 'rotate(-180deg)', letterSpacing: 1 }}>Cost-Savings</span>
                      </div>
                      <div className="relative" style={{ width: '256px', height: '256px' }}
                        onClick={e => {
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          const clamp = (v: number) => Math.max(0, Math.min(1, Math.round(v * 10) / 10));
                          const x = clamp((e.clientX - rect.left) / rect.width);
                          const y = clamp((e.clientY - rect.top) / rect.height);
                          onCpChange?.([x, y]);
                        }}
                      >
                        <div className={`absolute inset-0 rounded-lg border border-border ${
                          theme === 'dark' 
                            ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900' 
                            : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
                        }`} />
                        {/* Grid lines */}
                        <svg className="absolute inset-0 w-full h-full" width="256" height="256" viewBox="0 0 256 256">
                          {[...Array(11)].map((_, i) => (
                            <line
                              key={"v"+i}
                              x1={`${i * 10}%`} y1="0%" x2={`${i * 10}%`} y2="100%"
                              stroke={theme === 'dark' ? '#6b7280' : '#e0e7ef'} strokeWidth={i === 5 ? 2 : 1} />
                          ))}
                          {[...Array(11)].map((_, i) => (
                            <line
                              key={"h"+i}
                              x1="0%" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`}
                              stroke={theme === 'dark' ? '#6b7280' : '#e0e7ef'} strokeWidth={i === 5 ? 2 : 1} />
                          ))}
                          {/* Center cross */}
                          <circle cx="128" cy="128" r="6" fill={theme === 'dark' ? '#9ca3af' : '#a5b4fc'} fillOpacity="0.3" />
                        </svg>
                        {/* Draggable dot */}
                        <DraggableDot
                          x={cp[0]}
                          y={cp[1]}
                          onChange={(x, y) => onCpChange?.([x, y])}
                          getColor={(x, y) => {
                            // Quadrant-based coloring
                            // Q1 (top-right): orange (#bf4e08)
                            // Q2 (top-left): green (#3d734b)
                            // Q3 (bottom-left): red (#900F32)
                            // Q4 (bottom-right): blue (#1b4279)
                            if (x >= 0.5 && y < 0.5) return currentColors.right; // Q1
                            if (x < 0.5 && y < 0.5) return currentColors.top; // Q2
                            if (x < 0.5 && y >= 0.5) return currentColors.left; // Q3
                            return currentColors.bottom; // Q4
                          }}
                        />
                      </div>
                      {/* Right label */}
                      <div className="flex flex-col justify-center items-center h-full ml-2" style={{height: '256px'}}>
                        <span className="text-base font-bold" style={{ color: currentColors.right, writingMode: 'vertical-rl', letterSpacing: 1 }}>Performance</span>
                      </div>
                    </div>
                    {/* Bottom label */}
                    <div className="flex justify-center w-full">
                      <span className="text-base font-bold" style={{ color: currentColors.bottom, letterSpacing: 1 }}>Creative</span>
              </div>
            </div>
              </PopoverContent>
            </Popover>
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
        </div>
      </form>
    </Card>
  );
};

// DraggableDot component
function DraggableDot({ x, y, onChange, getColor }: { x: number; y: number; onChange: (x: number, y: number) => void; getColor?: (x: number, y: number) => string }) {
  // Convert x/y in [0,1] to px in grid
  const gridSize = 256; // px, for 64px padding
  const step = 0.1;
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x, y });
  useEffect(() => { setPos({ x, y }); }, [x, y]);
  const clamp = (v: number) => Math.max(0, Math.min(1, Math.round(v * 10) / 10));
  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const relX = clamp((e.clientX - rect.left) / rect.width);
    const relY = clamp((e.clientY - rect.top) / rect.height);
    setPos({ x: relX, y: relY });
    onChange(clamp(relX), clamp(relY));
  };
  const handlePointerUp = () => setDragging(false);
  // Dot position in px
  const left = `calc(${pos.x * 100}% - 7px)`;
  const top = `calc(${pos.y * 100}% - 7px)`;
  const dotColor = getColor ? getColor(pos.x, pos.y) : 'black';
  return (
    <div
      className="absolute"
      style={{ left, top, zIndex: 10 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      tabIndex={0}
      role="slider"
      aria-valuenow={pos.x}
      aria-valuetext={`(${pos.x}, ${pos.y})`}
      aria-valuemin={0}
      aria-valuemax={1}
    >
      <div className="w-3 h-3 rounded-full border-2 border-white shadow cursor-pointer transition-transform active:scale-110" style={{ background: dotColor }} />
    </div>
  );
}