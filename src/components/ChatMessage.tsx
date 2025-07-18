import { useState } from "react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/seperator";
import { Button } from "../components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Brain, User, ChevronDown, ChevronUp, DollarSign, Zap, Clock, Newspaper } from "lucide-react";
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
            <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {/* Special case: policy violation error */}
              {parsed && parsed.error && parsed.issues?.policy?.violation ? (
                <div>{parsed.error}</div>
              ) : parsed && parsed.response
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
          {parsed && ((parsed.compliance_report) || (parsed.error && parsed.issues?.policy?.violation)) && (
            <UiCard className="bg-muted/10 border border-border/60 rounded-lg mx-4 mb-4 p-4">
              {/* Compliance Report Dropdown */}
              <details className="rounded border border-border/40 bg-background/60 mb-2 group" open={!!(parsed.error && parsed.issues?.policy?.violation)}>
                <summary className="flex items-center gap-2 cursor-pointer py-2 px-3 font-medium select-none">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Compliance Details</span>
                  {parsed && parsed.compliance_report && <span className="ml-2 px-2 py-1 rounded bg-green-600 text-white text-xs font-semibold align-middle">PASSED</span>}
                  {parsed && parsed.error && parsed.issues?.policy?.violation && <span className="ml-2 px-2 py-1 rounded bg-red-600 text-white text-xs font-semibold align-middle">FAILED</span>}
                  <span className="ml-auto">
                    <ChevronDown className="h-4 w-4 group-open:hidden" />
                    <ChevronUp className="h-4 w-4 hidden group-open:inline" />
                  </span>
                </summary>
                <div className="p-3 space-y-3">
                  {/* Special case: only show Content Guidelines for policy violation */}
                  {parsed && parsed.error && parsed.issues?.policy?.violation ? (
                    <div className="w-full p-3 rounded border bg-red-50 border-red-200 text-red-900">
                      <div className="flex items-center gap-2 font-semibold mb-1">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span>Content Guidelines</span>
                      </div>
                      <div className="text-sm whitespace-pre-line">{parsed.issues.policy.details}</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-green-700 text-sm font-medium">No content policies violated</div>
                      <div className="text-green-700 text-sm font-medium">Passed all content and safety filters</div>
                      <div className="text-green-700 text-sm font-medium">No compliance flags triggered</div>
                    </div>
                  )}
                </div>
              </details>
              {/* Plagiarism Analysis Dropdown (only if not policy violation) */}
              {parsed && parsed.compliance_report && !parsed.error && (
                <details className="rounded border border-border/40 bg-background/60 group mb-2">
                  <summary className="flex items-center gap-2 cursor-pointer py-2 px-3 font-medium select-none">
                    <Newspaper className="h-5 w-5 text-blue-600" />
                    <span>Plagiarism Analysis</span>
                    {parsed.compliance_report.plagiarism && (
                      <Badge variant="outline" className="ml-2">
                        {parsed.compliance_report.plagiarism.chance || '0%'} Match
                      </Badge>
                    )}
                    <span className="ml-auto">
                      <ChevronDown className="h-4 w-4 group-open:hidden" />
                      <ChevronUp className="h-4 w-4 hidden group-open:inline" />
                    </span>
                  </summary>
                  {parsed.compliance_report.plagiarism && (
                    <div className="p-3 space-y-3">
                      {parsed.compliance_report.plagiarism.matched_urls?.length > 0 ? (
                        <div className="w-full p-3 rounded border bg-gray-50 border-gray-200">
                          <div className="font-semibold text-xs mb-2">Sources detected:</div>
                          {parsed.compliance_report.plagiarism.matched_urls.map((url: string, idx: number) => (
                            <div key={idx} className="mb-2 p-2 rounded border border-border/30 bg-white">
                              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                                {url}
                              </a>
                              {parsed.compliance_report.plagiarism.similarities && parsed.compliance_report.plagiarism.similarities[idx] && (
                                <div className="inline-block mt-2 px-2 py-1 rounded bg-gray-200 text-xs font-semibold">{parsed.compliance_report.plagiarism.similarities[idx]} similarity</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {parsed.compliance_report.plagiarism?.elements?.length > 0 ? (
                        <div className="w-full p-3 rounded border bg-gray-50 border-gray-200">
                          <div className="font-semibold text-xs mb-2">Plagiarized Content:</div>
                          <div className="text-xs text-muted-foreground bg-red-50 p-2 rounded">
                            {Array.isArray(parsed.compliance_report.plagiarism.elements)
                              ? parsed.compliance_report.plagiarism.elements.join(', ')
                              : parsed.compliance_report.plagiarism.elements}
                          </div>
                        </div>
                      ) : null}
                      {!(parsed.compliance_report.plagiarism.matched_urls?.length > 0) && !(parsed.compliance_report.plagiarism?.elements?.length > 0) && (
                        <div className="text-xs text-muted-foreground">No plagiarism analysis details available.</div>
                      )}
                    </div>
                  )}
                </details>
              )}
              {/* Cost Performance Analysis Section as dropdown */}
              {parsed && parsed.cost_performance_message && (
                <details className="rounded border border-border/40 bg-background/60 group mt-2">
                  <summary className="flex items-center gap-2 cursor-pointer py-2 px-3 font-medium select-none">
                    <DollarSign className="h-5 w-5 text-blue-700" />
                    <span>Cost Performance Analysis</span>
                    <span className="ml-auto">
                      <ChevronDown className="h-4 w-4 group-open:hidden" />
                      <ChevronUp className="h-4 w-4 hidden group-open:inline" />
                    </span>
                  </summary>
                  <div className="p-3 text-sm text-blue-900 whitespace-pre-line">
                    {parsed.cost_performance_message}
                  </div>
                </details>
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