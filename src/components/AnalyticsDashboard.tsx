import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Shield, AlertTriangle, Brain, TrendingUp, Activity } from "lucide-react";

interface AnalyticsData {
  totalCostSaved: number;
  totalRequests: number;
  complianceChecks: number;
  redactions: number;
  plagiarismChecks: number;
  modelUsage: Record<string, number>;
  costSavingsOverTime: Array<{ time: string; savings: number; cumulative: number }>;
  dailyActivity: Array<{ day: string; requests: number; compliance: number; redactions: number }>;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  isEmpty: boolean;
}

export const AnalyticsDashboard = ({ data, isEmpty }: AnalyticsDashboardProps) => {
  if (isEmpty) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="p-12 text-center max-w-md mx-auto shadow-card bg-card">
          <Activity className="h-16 w-16 mx-auto mb-6 text-primary opacity-50" />
          <h3 className="text-2xl font-bold mb-4 text-foreground">Start Prompting!</h3>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Begin using the chatbot to see your analytics, cost savings, and compliance metrics appear here in real-time.
          </p>
        </Card>
      </div>
    );
  }

  // Model usage data 
  const totalModelRequests = Object.values(data.modelUsage).reduce((a, b) => a + b, 0);
  const modelData = Object.entries(data.modelUsage).map(([model, count]) => ({
    name: model,
    count,
    percentage: totalModelRequests > 0 ? (count / totalModelRequests) * 100 : 0,
    color: model.includes('GPT-4') ? '#4E3CEF' : model.includes('Claude') ? '#10B981' : '#F59E0B'
  }));

  // Metrics cards data
  const metrics = [
    {
      title: "Total Cost Saved",
      value: `$${data.totalCostSaved.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/50"
    },
    {
      title: "Compliance Checks",
      value: data.complianceChecks.toString(),
      icon: Shield,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50"
    },
    {
      title: "Redactions",
      value: data.redactions.toString(),
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/50"
    },
    {
      title: "Total Requests",
      value: data.totalRequests.toString(),
      icon: Brain,
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="shadow-card bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Savings Breakdown */}
        <Card className="shadow-card bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Cost Savings Breakdown
            </CardTitle>
            <CardDescription>
              Your efficiency gains over recent requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.costSavingsOverTime.length > 0 ? (
              data.costSavingsOverTime.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <span className="font-medium text-foreground">{item.time}</span>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${item.savings.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Cumulative: ${item.cumulative.toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No cost data available yet</p>
            )}
          </CardContent>
        </Card>

        {/* Model Usage Distribution */}
        <Card className="shadow-card bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Brain className="h-5 w-5 text-primary" />
              Model Usage Distribution
            </CardTitle>
            <CardDescription>
              Which AI models are being used most frequently
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {modelData.length > 0 ? (
              modelData.map((model, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{model.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {model.count} ({model.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress 
                    value={model.percentage} 
                    className="h-2"
                    style={{ 
                      '--progress-background': model.color 
                    } as React.CSSProperties}
                  />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No model usage data available yet</p>
            )}
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card className="lg:col-span-2 shadow-card bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-primary" />
              Session Activity Summary
            </CardTitle>
            <CardDescription>
              Overview of your current session statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-primary/10">
                <div className="text-2xl font-bold text-primary mb-1">{data.totalRequests}</div>
                <div className="text-sm text-muted-foreground">Total Requests</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div className="text-2xl font-bold text-blue-600 mb-1">{data.complianceChecks}</div>
                <div className="text-sm text-muted-foreground">Compliance Checks</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <div className="text-2xl font-bold text-orange-600 mb-1">{data.redactions}</div>
                <div className="text-sm text-muted-foreground">Content Redactions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};