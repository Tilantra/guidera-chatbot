import { useState } from "react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, Brain, User, ChevronDown, DollarSign, Newspaper, Shield, Copy } from "lucide-react";
import React from "react";

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

// Markdown-like formatter: supports ### headers, **bold**, *italics*, code blocks, and inline code
function formatMarkdown(text: string) {
  if (!text) return null;
  // Code blocks (```lang\n...\n```)
  text = text.replace(/```([\w]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class='bg-muted rounded p-3 my-2 overflow-x-auto'><code class='font-mono text-xs'>${escapeHtml(code)}</code></pre>`;
  });
  // Inline code (`code`)
  text = text.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 rounded font-mono text-xs">$1</code>');
  // Replace ### headers with bold/large
  text = text.replace(/^### (.*)$/gm, '<span class="font-bold text-lg">$1</span>');
  // Replace **bold** with <strong>
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Replace *italics* with <em>
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Replace --- with <hr>
  text = text.replace(/^---$/gm, '<hr />');
  return text;
}

// Helper to escape HTML in code blocks
function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, function (tag) {
    const chars: any = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return chars[tag] || tag;
  });
}

export const ChatMessage = ({ message, isLoading = false, complianceEnabled = true }: ChatMessageProps) => {
  const isUser = message.type === 'user';
  const [isPlagiarismExpanded, setIsPlagiarismExpanded] = useState(false);
  const [isComplianceExpanded, setIsComplianceExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

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
    <div className={`flex w-full gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] lg:max-w-[75%] ${isUser ? 'order-2' : 'order-1'}`}>
        <Card className={`shadow-elegant border-none ${isUser ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white' : 'bg-card/90 backdrop-blur-sm border border-border/40'}`}>
          {/* Message Header */}
          <div className="flex items-center gap-2 p-3 pb-1.5">
            {isUser ? <User className="h-4 w-4 opacity-80" /> : <Brain className="h-4 w-4 text-primary" />}
            <span className="text-[11px] font-black uppercase tracking-widest opacity-60">{isUser ? 'User' : 'Guidera AI'}</span>
            {parsed && parsed.model_id && (
              <Badge variant="outline" className="text-[10px] h-5 rounded-full border-primary/50 text-primary bg-primary/5 font-bold px-2 ml-1">
                {parsed.model_id}
              </Badge>
            )}
            {/* Copy button for assistant messages */}
            {!isUser && (
              <button
                className="ml-auto p-1 rounded-md hover:bg-muted/50 transition-all group relative"
                title={copied ? 'Copied!' : 'Copy response'}
                onClick={async (e) => {
                  e.stopPropagation();
                  let textToCopy = '';
                  if (parsed && parsed.response) {
                    textToCopy = parsed.response;
                  } else if (typeof message.content === 'string') {
                    textToCopy = message.content;
                  }
                  try {
                    await navigator.clipboard.writeText(textToCopy);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1200);
                  } catch { }
                }}
              >
                <Copy className={`h-3 w-3 transition-colors ${copied ? 'text-green-500' : 'text-muted-foreground group-hover:text-foreground'}`} />
                {copied && (
                  <span className="absolute -top-7 right-0 text-[10px] bg-background border border-border/50 px-1.5 py-0.5 rounded shadow-lg text-green-600 font-bold whitespace-nowrap animate-in fade-in zoom-in-95">Copied!</span>
                )}
              </button>
            )}
          </div>

          {/* Main Content */}
          <div className="p-3.5 pt-0">
            <div className={`text-[15px] leading-relaxed ${isUser ? 'font-medium' : 'text-foreground/90'}`}>
              {/* Special case: policy violation error */}
              {(
                (parsed && parsed.error && parsed.issues?.policy?.violation) ||
                (parsed && parsed.compliance_report?.policy?.violation)
              ) ? (
                <div>{
                  parsed && parsed.error && parsed.issues?.policy?.violation
                    ? parsed.error
                    : parsed && parsed.error && parsed.compliance_report?.policy?.violation
                      ? parsed.error
                      : parsed && parsed.compliance_report?.policy?.violation
                        ? parsed.error || "Content violates policy."
                        : null
                }</div>
              ) : parsed && parsed.response
                ? <div dangerouslySetInnerHTML={{ __html: formatMarkdown(parsed.response) }} />
                : (typeof message.content === "string"
                  ? <div dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }} />
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
            <div className="mx-3.5 mb-3.5 p-3.5 rounded-xl bg-secondary/30 border border-border/30 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 px-1">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/80">Verification Report</span>
              </div>
              {/* Compliance Report Dropdown */}
              <details className="rounded-xl border border-border/40 bg-background/40 mb-2 group overflow-hidden transition-all duration-200 hover:border-border/80" open={!!(parsed.error && parsed.issues?.policy?.violation)}>
                <summary className="flex items-center gap-2 cursor-pointer py-2.5 px-3.5 font-bold text-sm select-none group-hover:bg-muted/20">
                  <div className="p-1.5 rounded bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Compliance</span>
                  <div className="flex items-center gap-2 ml-1.5">
                    {parsed && parsed.compliance_report && (
                      (parsed.compliance_report.policy?.violation || parsed.compliance_report.safety?.violation) ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-red-500 text-white font-black">FAILED</span>
                      ) : parsed.redaction_occurred ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-white font-black">WARNING</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-black">PASSED</span>
                      )
                    )}
                    {parsed && parsed.error && parsed.issues?.policy?.violation && <span className="px-2 py-0.5 rounded text-[10px] bg-red-500 text-white font-black">FAILED</span>}
                  </div>
                  <span className="ml-auto transition-transform duration-200 group-open:rotate-180">
                    <ChevronDown className="h-4 w-4 text-muted-foreground/60" />
                  </span>
                </summary>
                <div className="p-3 space-y-3">
                  {/* Special case: only show Content Guidelines for policy violation */}
                  {(
                    (parsed && parsed.error && parsed.issues?.policy?.violation) ||
                    (parsed && parsed.compliance_report?.policy?.violation) ||
                    (parsed && parsed.compliance_report?.safety?.violation)
                  ) ? (
                    <div className="w-full p-2.5 rounded border bg-red-50 border-red-200 text-red-900">
                      <div className="flex items-center gap-2 font-bold mb-1 text-xs">
                        <XCircle className="h-3.5 w-3.5 text-red-600" />
                        <span>Compliance Failure</span>
                      </div>
                      <div className="text-[11px] whitespace-pre-line leading-relaxed">{
                        parsed && parsed.error && parsed.issues?.policy?.violation
                          ? parsed.issues.policy.details
                          : parsed && parsed.compliance_report?.policy?.violation
                            ? parsed.compliance_report.policy.details
                            : parsed && parsed.compliance_report?.safety?.violation
                              ? parsed.compliance_report.safety.details
                              : null
                      }</div>
                    </div>
                  ) : (
                    <div className="space-y-2 px-1">
                      <div className="text-green-700 text-xs font-bold">No content policies violated</div>
                      <div className="text-green-700 text-xs font-bold">Passed all content and safety filters</div>
                      {/* Sensitive info redaction logic */}
                      {parsed && typeof parsed.redaction_occurred !== 'undefined' ? (
                        parsed.redaction_occurred ? (
                          <div className="flex items-center gap-2 text-yellow-700 text-xs font-bold">
                            <AlertTriangle className="h-4 w-4 text-yellow-700" />
                            Sensitive information found
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-green-700 text-xs font-bold">
                            <CheckCircle className="h-4 w-4 text-green-700" />
                            No sensitive information found
                          </div>
                        )
                      ) : (
                        <div className="text-green-700 text-xs font-bold">No sensitive information found</div>
                      )}
                    </div>
                  )}
                </div>
              </details>
              {/* Plagiarism Analysis Dropdown (only if not policy violation) */}
              {parsed && parsed.compliance_report && !parsed.error && (
                <details className="rounded-xl border border-border/40 bg-background/40 group mb-2 overflow-hidden transition-all duration-200 hover:border-border/80">
                  <summary className="flex items-center gap-2 cursor-pointer py-2 px-3 font-bold text-xs select-none group-hover:bg-muted/20">
                    <div className="p-1 rounded bg-blue-500/10">
                      <Newspaper className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span>Plagiarism</span>
                    {parsed.compliance_report.plagiarism && (
                      <Badge variant="outline" className="ml-1.5 h-4 text-[9px] border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 font-bold">
                        {parsed.compliance_report.plagiarism.chance || '0%'} Match
                      </Badge>
                    )}
                    <span className="ml-auto transition-transform duration-200 group-open:rotate-180">
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" />
                    </span>
                  </summary>
                  {parsed.compliance_report.plagiarism && (
                    <div className="p-3 space-y-3">
                      {parsed.compliance_report.plagiarism.matched_urls?.length > 0 ? (
                        <div className="w-full p-2.5 rounded border bg-gray-50/50 border-gray-200">
                          <div className="font-bold text-[11px] mb-2 text-foreground/80">Sources detected:</div>
                          {parsed.compliance_report.plagiarism.matched_urls.map((url: string, idx: number) => (
                            <div key={idx} className="mb-1.5 p-2 rounded border border-border/30 bg-white/50 backdrop-blur-sm">
                              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs break-all block">
                                {url}
                              </a>
                              {parsed.compliance_report.plagiarism.similarities && parsed.compliance_report.plagiarism.similarities[idx] && (
                                <div className="inline-block mt-1.5 px-1.5 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-700">{parsed.compliance_report.plagiarism.similarities[idx]} similarity</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {parsed.compliance_report.plagiarism?.elements?.length > 0 ? (
                        <div className="w-full p-2.5 rounded border bg-gray-50/50 border-gray-200">
                          <div className="font-bold text-[11px] mb-2 text-foreground/80">Plagiarized Content:</div>
                          <div className="text-[10px] text-muted-foreground bg-red-50/50 p-2 rounded leading-relaxed">
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
                <details className="rounded-xl border border-border/40 bg-background/40 group overflow-hidden transition-all duration-200 hover:border-border/80">
                  <summary className="flex items-center gap-2 cursor-pointer py-2 px-3 font-bold text-xs select-none group-hover:bg-muted/20">
                    <div className="p-1 rounded bg-indigo-500/10">
                      <DollarSign className="h-3.5 w-3.5 text-indigo-500" />
                    </div>
                    <span>Optimisation</span>
                    <span className="ml-auto transition-transform duration-200 group-open:rotate-180">
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" />
                    </span>
                  </summary>
                  <div className="p-3 text-[11px] text-muted-foreground bg-indigo-50/30 dark:bg-indigo-900/10 border-t border-border/20 leading-relaxed italic">
                    {parsed.cost_performance_message}
                  </div>
                </details>
              )}
            </div>
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