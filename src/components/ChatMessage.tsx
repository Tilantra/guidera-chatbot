import { useState } from "react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/seperator";
import { Button } from "../components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Brain, User, ChevronDown, ChevronUp, DollarSign, Zap, Clock } from "lucide-react";

export interface PlagiarismCheck {
  percentage: number;
  sources: Array<{
    url: string;
    title: string;
    similarity: number;
  }>;
}

export interface ComplianceCheck {
  status: 'passed' | 'failed' | 'warning';
  details: Array<{
    rule: string;
    status: 'passed' | 'failed' | 'warning';
    description: string;
  }>;
}

export interface PerformanceMetrics {
  costSaved?: number;
  processingTime?: number;
  tokensUsed?: number;
  efficiency?: number;
}

export interface ChatResponse {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  model?: string;
  plagiarismCheck?: PlagiarismCheck;
  complianceCheck?: ComplianceCheck;
  performanceMetrics?: PerformanceMetrics;
  timestamp: Date;
}

interface ChatMessageProps {
  message: ChatResponse;
  isLoading?: boolean;
  complianceEnabled?: boolean;
}

export const ChatMessage = ({ message, isLoading = false, complianceEnabled = true }: ChatMessageProps) => {
  const isUser = message.type === 'user';
  const [isPlagiarismExpanded, setIsPlagiarismExpanded] = useState(false);
  const [isComplianceExpanded, setIsComplianceExpanded] = useState(false);
  
  // If compliance failed, show simplified red box
  const complianceFailed = message.complianceCheck?.status === 'failed';

  return (
    <div className={`flex w-full gap-4 animate-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        <Card className={`shadow-card ${isUser ? 'bg-gradient-primary text-primary-foreground' : 'bg-card'}`}>
          {/* Message Header */}
          <div className="flex items-center gap-2 p-4 pb-2">
            {isUser ? (
              <User className="h-4 w-4" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            {message.model && !isUser && (
              <Badge variant="secondary" className="text-xs">
                {message.model}
              </Badge>
            )}
          </div>

          {/* Main Content - Most Prominent */}
          {!complianceFailed && message.content && (
            <div className="px-4 pb-4">
              <div className="text-base leading-relaxed whitespace-pre-wrap font-medium">
                {message.content}
              </div>
            </div>
          )}

          {/* Inline Loading Indicator */}
          {isLoading && !isUser && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Generating response...</span>
              </div>
            </div>
          )}

          {/* Performance Metrics - Visible for assistant responses */}
          {message.performanceMetrics && !isUser && !complianceFailed && (
            <div className="px-4 pb-4">
              <div className="flex gap-4 text-xs">
                {message.performanceMetrics.costSaved && (
                  <div className="flex items-center gap-1 text-success">
                    <DollarSign className="h-3 w-3" />
                    <span>${message.performanceMetrics.costSaved} saved</span>
                  </div>
                )}
                {message.performanceMetrics.processingTime && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{message.performanceMetrics.processingTime}ms</span>
                  </div>
                )}
                {message.performanceMetrics.efficiency && (
                  <div className="flex items-center gap-1 text-primary">
                    <Zap className="h-3 w-3" />
                    <span>{message.performanceMetrics.efficiency}% efficiency</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compliance Failed - Simple Red Box */}
          {complianceFailed && (
            <div className="p-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-destructive font-medium">Compliance Check Failed</p>
                <p className="text-destructive/80 text-sm mt-1">Content violates compliance standards</p>
              </div>
            </div>
          )}

          {/* Collapsible Sections - Only show if compliance enabled and not failed */}
          {complianceEnabled && !complianceFailed && !isUser && (message.plagiarismCheck || message.complianceCheck) && (
            <div className="border-t border-border/50">
              
              {/* Plagiarism Section - Collapsible */}
              {message.plagiarismCheck && (
                <div>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto bg-muted/20 hover:bg-muted/30 rounded-none"
                    onClick={() => setIsPlagiarismExpanded(!isPlagiarismExpanded)}
                  >
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Plagiarism Analysis</span>
                      <Badge 
                        variant={message.plagiarismCheck.percentage < 20 ? 'default' : 
                               message.plagiarismCheck.percentage < 50 ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {message.plagiarismCheck.percentage}% Match
                      </Badge>
                    </div>
                    {isPlagiarismExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground opacity-60" />
                    )}
                  </Button>
                  
                  {isPlagiarismExpanded && (
                    <div className="p-4 bg-muted/10 animate-fade-in">
                      {message.plagiarismCheck.sources.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground mb-3">Sources detected:</p>
                          {message.plagiarismCheck.sources.map((source, index) => (
                            <div key={index} className="p-3 rounded border border-border bg-background/50">
                              <div className="flex items-start gap-2">
                                <ExternalLink className="h-3 w-3 mt-0.5 text-muted-foreground" />
                                <div className="flex-1">
                                  <p className="text-xs font-medium">{source.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{source.url}</p>
                                  <Badge variant="outline" className="text-xs mt-2">
                                    {source.similarity}% similarity
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No significant sources detected</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Compliance Section - Collapsible for passed/warning */}
              {message.complianceCheck && message.complianceCheck.status !== 'failed' && (
                <div className="border-t border-border/50">
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto bg-muted/20 hover:bg-muted/30 rounded-none"
                    onClick={() => setIsComplianceExpanded(!isComplianceExpanded)}
                  >
                    <div className="flex items-center gap-2">
                      {message.complianceCheck.status === 'passed' && (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                      {message.complianceCheck.status === 'warning' && (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                      <span className="text-sm">Compliance Details</span>
                      <Badge 
                        variant={message.complianceCheck.status === 'passed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {message.complianceCheck.status.toUpperCase()}
                      </Badge>
                    </div>
                    {isComplianceExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground opacity-60" />
                    )}
                  </Button>
                  
                  {isComplianceExpanded && (
                    <div className="p-4 bg-muted/10 animate-fade-in">
                      <div className="space-y-2">
                        {message.complianceCheck.details.map((detail, index) => (
                          <div key={index} className={`p-2 rounded border ${
                            detail.status === 'passed' ? 'border-success/20 bg-success/5' :
                            detail.status === 'warning' ? 'border-warning/20 bg-warning/5' :
                            'border-destructive/20 bg-destructive/5'
                          }`}>
                            <div className="flex items-start gap-2">
                              {detail.status === 'passed' && <CheckCircle className="h-3 w-3 text-success mt-0.5" />}
                              {detail.status === 'warning' && <AlertTriangle className="h-3 w-3 text-warning mt-0.5" />}
                              {detail.status === 'failed' && <XCircle className="h-3 w-3 text-destructive mt-0.5" />}
                              <div className="flex-1">
                                <p className="text-xs font-medium">{detail.rule}</p>
                                <p className="text-xs text-muted-foreground mt-1">{detail.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
        
        <p className="text-xs text-muted-foreground mt-1 px-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};