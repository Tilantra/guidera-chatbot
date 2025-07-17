import { useState } from "react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/seperator";
import { Button } from "../components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Brain, User, ChevronDown, ChevronUp, DollarSign, Zap, Clock } from "lucide-react";
import { Card as UiCard } from "../components/ui/card";

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

  // Try to parse the assistant's content as JSON
  let parsed = null;
  if (!isUser && message.content) {
    try {
      parsed = JSON.parse(message.content);
    } catch {
      parsed = null;
    }
  }

  // Helper for compliance status color
  const complianceColor = (status: string) =>
    status === "PASSED" ? "text-green-600" :
    status === "FAILED" ? "text-red-600" :
    "text-yellow-600";

  return (
    <div className={`flex w-full gap-4 animate-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        <Card className={`shadow-card ${isUser ? 'bg-gradient-primary text-primary-foreground' : 'bg-card'}`}>
          {/* Message Header */}
          <div className="flex items-center gap-2 p-4 pb-2">
            {isUser ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
            <span className="text-sm font-medium">{isUser ? 'You' : 'Guidera Assistant'}</span>
            {parsed && parsed.model_id && (
              <Badge variant="secondary" className="text-xs">{parsed.model_id}</Badge>
            )}
          </div>

          {/* Main Content */}
          <div className="px-4 pb-4">
            <div className="text-base leading-relaxed whitespace-pre-wrap font-medium">
              {parsed && parsed.response
                ? parsed.response.split(/\r?\n/).map((line: string, idx: number) => <div key={idx}>{line}</div>)
                : (typeof message.content === "string"
                    ? message.content.split(/\r?\n/).map((line, idx) => <div key={idx}>{line}</div>)
                    : message.content)}
            </div>
          </div>

          {/* Inline Loading Indicator */}
          {isLoading && !isUser && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Generating response...</span>
              </div>
            </div>
          )}

          {/* Compliance Section - visually distinct */}
          {parsed && parsed.compliance_report && (
            <UiCard className="bg-muted/10 border border-border/60 rounded-lg mx-4 mb-4 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-base">Compliance Report</span>
                {parsed.compliance_report.status && (
                  <span className={`ml-2 font-semibold ${complianceColor(parsed.compliance_report.status)}`}>
                    {parsed.compliance_report.status}
                  </span>
                )}
                {parsed.compliance_report.policyViolated && <XCircle className="h-4 w-4 text-red-600" />}
                {!parsed.compliance_report.policyViolated && <CheckCircle className="h-4 w-4 text-green-600" />}
              </div>
              {parsed.cost_performance_message && (
                <div className="text-xs text-blue-700 font-semibold mb-2">
                  {parsed.cost_performance_message}
                </div>
              )}
              {parsed.compliance_report.plagiarism && (
                <div className="mb-1 text-xs">
                  <Badge variant="outline" className="text-xs mr-2">
                    Plagiarism: {parsed.compliance_report.plagiarism.chance}
                  </Badge>
                </div>
              )}
              {parsed.compliance_report.plagiarism?.matched_urls?.length > 0 && (
                <div className="text-xs text-muted-foreground mb-2">
                  <span className="font-semibold">Matched URLs:</span>
                  <ul className="list-disc ml-5">
                    {parsed.compliance_report.plagiarism.matched_urls.map((url: string, idx: number) => (
                      <li key={idx}><a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{url}</a></li>
                    ))}
                  </ul>
                </div>
              )}
              {parsed.compliance_report.plagiarism?.elements?.length > 0 && (
                <div className="text-xs text-muted-foreground mb-2">
                  <span className="font-semibold">Elements:</span> {parsed.compliance_report.plagiarism.elements.join(', ')}
                </div>
              )}
            </UiCard>
          )}

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground mt-1 px-1">
            {message.timestamp.toLocaleTimeString()}
          </p>
        </Card>
      </div>
    </div>
  );
};