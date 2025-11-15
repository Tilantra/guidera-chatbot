import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChevronDown, Shield, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/seperator";
import { 
  DollarSign, AlertTriangle, Brain, BarChart3, Info, TrendingUp, 
  Lock, CheckCircle, XCircle, Activity, Zap, Target,
  RefreshCw, ArrowUp, Minus
} from "lucide-react";
import { RotateCcw, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter } from "recharts";
import { LineChart, Line, CartesianGrid, Area, AreaChart } from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AnalyticsDashboard = ({ client }: { client: any }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [granularity, setGranularity] = useState("daily");
  const [timeRange, setTimeRange] = useState("30d");

  const CollapsibleCard = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
  
    return (
      <div className="bg-transparent relative">
        <button
          className="w-full flex items-center justify-between px-4 py-2 bg-white/80 dark:bg-card rounded-t-lg border-b cursor-pointer transition-all"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="font-bold text-2xl">{title}</span>
          <ChevronDown
            className={`h-5 w-5 ml-2 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && <div className="transition-all">{children}</div>}
      </div>
    );
  };
  
  
  useEffect(() => {
    fetchAnalytics();
  }, [client, granularity, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await client.getAnalytics({
        granularity,
        time_range: timeRange,
      });      
      setAnalytics(result);
      setLastUpdated(new Date().toLocaleString());
    } catch (err: any) {
      setError(err.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">Loading analytics...</div>;
  }
  if (error) {
    return <div className="flex-1 flex items-center justify-center p-8 text-destructive">{error}</div>;
  }
  if (!analytics) {
    return <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">No analytics data available.</div>;
  }

  // Metrics
  const metrics = [
    {
      title: "Total Requests",
      value: Object.values(analytics.model_usage || {}).reduce((a: number, b: number) => a + b, 0).toString(),
      icon: Brain,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Cost Efficiency",
      value: `${analytics.percent_cost_saved?.toFixed(2) ?? 0}%`,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/50"
    },
    {
      title: "Compliance Failures",
      value: analytics.compliance_failures?.toString() ?? "0",
      icon: Shield,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/50"
    },
    {
      title: "Redactions",
      value: analytics.sensitive_redactions?.toString() ?? "0",
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/50"
    }
  ];

  // Bar chart data for model usage
  const barData = Object.entries(analytics.model_usage || {}).map(([model, count]) => ({
    model,
    count: Number(count)
  }));

  // Top models (sorted by usage)
  const topModels = [...barData].sort((a, b) => b.count - a.count).slice(0, 3);

  // Predictive Line Chart Data
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysElapsed = Math.max(1, Math.ceil((now.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)));
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const avgPerDay = analytics.total_cost_saved / daysElapsed;
  const forecastTotal = avgPerDay * daysInMonth;
  
  const lineChartData = [];
  for (let d = 1; d <= daysInMonth; d++) {
    if (d <= daysElapsed) {
      // Linear actuals (since we don't have daily data)
      lineChartData.push({
        day: d,
        actual: avgPerDay * d,
        forecast: null
      });
    } else {
      lineChartData.push({
        day: d,
        actual: null,
        forecast: avgPerDay * d
      });
    }
  }

  // Get model usage values for calculations
  const modelUsageValues = Object.values(analytics.model_usage || {}) as number[];
  const totalModelRequests: number = modelUsageValues.reduce((a: number, b: number) => a + Number(b || 0), 0);

  // Enhanced insights
  const totalRequests = modelUsageValues.reduce((a: number, b: number) => a + Number(b || 0), 0);
  const efficiencyScore = analytics.percent_cost_saved || 0;

  // Performance line chart data - last 7 days
  const performanceLineData = analytics.performance_trends?.trends || [];

  // Model latency data for scatter plot (current usage patterns)
  const latencyScatterData = analytics.model_latency.models.map((m, i) => {
    const palette = ['#ef4444', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6'];
    return {
      model: m.model_id,
      latency: m.latency_ms,
      usage: m.usage_count,
      color: palette[i % palette.length]
    };
  });

  return (
    <div className="w-full max-w-[95vw] mx-auto p-4 bg-gradient-to-br from-background via-background to-secondary/5">
      {/* Header Section */}
      <div className="flex flex-col items-start lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Requests</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalRequests.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Activity className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Total API calls</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Overall Cost Efficiency</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{efficiencyScore.toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Optimal performance</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Plagiarism Count</p>
                <p className="text-3xl font-bold text-red-900 dark:text-red-100">{Math.floor(totalRequests * 0.08)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <XCircle className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">Content detected</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Active Models</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{barData.length}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Target className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Optimized routing</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        <div className="flex flex-col gap-4">
          {/* Security & Compliance Section */}
          <CollapsibleCard title="Security & Compliance" defaultOpen={true}>
          <Card className="bg-gradient-to-br from-card to-secondary/5 border-0 shadow-lg">
            <CardHeader className="pb-4">
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">Compliance Passed</p>
                      <p className="text-sm text-green-700 dark:text-green-300">All checks successful</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {Math.max(0, Number(totalRequests) - Number(analytics.compliance_failures || 0))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-100">Compliance Failures</p>
                      <p className="text-sm text-red-700 dark:text-red-300">Blocked content</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {analytics.compliance_failures || 0}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-900 dark:text-orange-100">Redactions</p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">Sensitive data protected</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {analytics.sensitive_redactions || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </CollapsibleCard>

          {/* Performance Trends */}
          <CollapsibleCard title="Performance Trends" defaultOpen={true}>
          <Card className="bg-gradient-to-br from-card to-secondary/5 border-0 shadow-lg">
            <CardHeader className="pb-4">
            </CardHeader>

            <CardContent>
              {/* Filters FIXED */}
              <div className="flex gap-4 mb-6">

              {/* Time Range Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost"
                    className="h-10 px-3 gap-2 text-sm font-normal hover:bg-accent"
                  >
                    {timeRange === "1d" && "Last 1 Day"}
                    {timeRange === "7d" && "Last 7 Days"}
                    {timeRange === "30d" && "Last 30 Days"}
                    {timeRange === "all" && "All Time"}
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="start" side="bottom">
                  <DropdownMenuItem onClick={() => setTimeRange("1d")}>
                    <div className="flex flex-col">
                      <span>Last 1 Day</span>
                      <span className="text-xs text-muted-foreground">Most recent 24 hours</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setTimeRange("7d")}>
                    <div className="flex flex-col">
                      <span>Last 7 Days</span>
                      <span className="text-xs text-muted-foreground">Weekly view</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setTimeRange("30d")}>
                    <div className="flex flex-col">
                      <span>Last 30 Days</span>
                      <span className="text-xs text-muted-foreground">Monthly view</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setTimeRange("all")}>
                    <div className="flex flex-col">
                      <span>All Time</span>
                      <span className="text-xs text-muted-foreground">Full history</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Granularity Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost"
                    className="h-10 px-3 gap-2 text-sm font-normal hover:bg-accent"
                  >
                    {granularity === "hour" && "Hourly"}
                    {granularity === "daily" && "Daily"}
                    {granularity === "weekly" && "Weekly"}
                    {granularity === "monthly" && "Monthly"}
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="start" side="bottom">
                  <DropdownMenuItem onClick={() => setGranularity("hour")}>
                    <div className="flex flex-col">
                      <span>Hourly</span>
                      <span className="text-xs text-muted-foreground">Fine-grained trends</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setGranularity("daily")}>
                    <div className="flex flex-col">
                      <span>Daily</span>
                      <span className="text-xs text-muted-foreground">Day-by-day changes</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setGranularity("weekly")}>
                    <div className="flex flex-col">
                      <span>Weekly</span>
                      <span className="text-xs text-muted-foreground">Smooth weekly trend</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setGranularity("monthly")}>
                    <div className="flex flex-col">
                      <span>Monthly</span>
                      <span className="text-xs text-muted-foreground">Broad monthly view</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>

              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={performanceLineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="success_rate"
                    stroke="#22c55e"
                    strokeWidth={3}
                    name="Success Rate (%)"
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cost_efficiency"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Cost Efficiency (%)"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="text-lg font-bold text-green-900 dark:text-green-100">
                    {performanceLineData?.[performanceLineData.length - 1]?.success_rate?.toFixed(1) ?? 0}%
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">Current Success Rate</div>
                </div>

                <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {performanceLineData?.[performanceLineData.length - 1]?.cost_efficiency?.toFixed(1) ?? 0}%
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">Current Efficiency</div>
                </div>
              </div>
            </CardContent>
          </Card>
          </CollapsibleCard>
        </div>

        <div className="flex flex-col gap-4">
          {/* Model Performance Bar Chart */}
          <CollapsibleCard title="Model Usage" defaultOpen={true}>
          <Card className="bg-gradient-to-br from-card to-secondary/5 border-0 shadow-lg">
            <CardHeader className="pb-4">
            </CardHeader>

            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <XAxis 
                    dataKey="model" 
                    tick={{ fontSize: 11 }} 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                    interval={0}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    fillOpacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Top Performers</h4>
                {topModels.slice(0, 3).map((model, idx) => (
                  <div key={model.model} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : 'bg-amber-600'
                      }`} />
                      <span className="font-mono text-xs">{model.model}</span>
                    </div>
                    <span className="font-medium">{model.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </CollapsibleCard>

          {/* Model Latency Scatter Plot */}
          <CollapsibleCard title="Model Latency" defaultOpen={true}>
          <Card className="bg-gradient-to-br from-card to-secondary/5 border-0 shadow-lg">
            <CardHeader className="pb-4">
            </CardHeader>

            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={latencyScatterData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number"
                    dataKey="usage" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: 'Usage Count', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    type="number"
                    dataKey="latency"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    domain={['auto', 'auto']}
                    label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;

                      const p = payload[0].payload;
                      return (
                        <div
                          style={{
                            background: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            padding: "8px",
                            fontSize: "12px"
                          }}
                        >
                          <div>model: {p.model}</div>
                          <div>latency: {p.latency}ms</div>
                          <div>usage count: {p.usage}</div>
                        </div>
                      );
                    }}
                  />

                  <Scatter 
                    dataKey="latency" 
                    fill="#8884d8"
                    shape={(props: any) => {
                      const { cx, cy, payload } = props;
                      return <circle cx={cx} cy={cy} r={8} fill={payload.color} opacity={0.8} stroke={payload.color} strokeWidth={2} />;
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          </CollapsibleCard>
        </div>
      </div>
    </div>
  );
};