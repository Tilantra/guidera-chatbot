import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, Brain, BarChart3, TrendingUp,
  Lock, CheckCircle, XCircle, Activity, Zap,
  RefreshCw, Loader2, Cloud, Shield, ChevronDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, ScatterChart, Scatter, Area, AreaChart, CartesianGrid
} from "recharts";
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
          className="w-full flex items-center justify-between px-3 py-1.5 bg-white/80 dark:bg-card rounded-t-lg border-b cursor-pointer transition-all"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="font-bold text-lg">{title}</span>
          <ChevronDown
            className={`h-4 w-4 ml-2 transition-transform ${open ? "rotate-180" : ""}`}
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

  // Lifetime stats from the new API structure
  const lifetime = analytics.lifetime || {};
  const modelUsage = lifetime.model_usage || {};

  // Get model usage values for calculations

  // Bar chart data for model usage
  const barData = Object.entries(modelUsage).map(([model, count]) => ({
    model,
    count: Number(count)
  }));

  // Top models (sorted by usage)
  const topModels = [...barData].sort((a, b) => b.count - a.count).slice(0, 3);

  // Get model usage values for calculations
  const modelUsageValues = Object.values(modelUsage || {}) as number[];
  const totalRequests: number = modelUsageValues.reduce((a: number, b: number) => a + Number(b || 0), 0);
  const efficiencyScore = lifetime.percent_cost_saved || 0;

  // Performance line chart data - last 7 days
  const performanceLineData = analytics.trends?.trends || [];


  // Model latency data for scatter plot (current usage patterns)
  const latencyScatterData = (analytics.model_latency?.models || []).map((m, i) => {
    const palette = ['#e11d48', '#2563eb', '#059669', '#d97706', '#4f46e5'];
    return {
      model: m.model_id,
      latency: m.latency_ms,
      usage: m.usage_count,
      color: palette[i % palette.length]
    };
  });

  return (
    <div className="w-full max-w-[95vw] mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col items-start lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Analytics Overview
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance insights and compliance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
            Last updated: {lastUpdated}
          </div>
          <Button
            onClick={fetchAnalytics}
            disabled={loading}
            variant="outline"
            size="sm"
            className="font-semibold shadow-sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh Data
          </Button>
        </div>
      </div>

      {/* High-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Requests", value: totalRequests.toLocaleString(), icon: Brain, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Cost Efficiency", value: `${efficiencyScore.toFixed(1)}%`, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Compliance Violations", value: lifetime.compliance_failures || 0, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Models", value: barData.length, icon: Zap, color: "text-fuchsia-600", bg: "bg-fuchsia-50" }
        ].map((stat, i) => (
          <Card key={i} className="border-border/40 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl ${stat.bg} dark:bg-muted/10 flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Security & Compliance Section */}
          <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b py-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Checks Passed</p>
                      <p className="text-xs text-muted-foreground">Successfully validated content</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.max(0, Number(totalRequests) - Number(lifetime.compliance_failures || 0))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Policy Violations</p>
                      <p className="text-xs text-muted-foreground">Blocked or flagged content</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {lifetime.compliance_failures || 0}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Data Redactions</p>
                      <p className="text-xs text-muted-foreground">Sensitive PII instances hidden</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {lifetime.sensitive_redactions || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b py-4">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Efficiency Trends
                </CardTitle>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold">
                        {timeRange === "all" ? "All Time" : `Last ${timeRange}`}
                        <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {["1d", "7d", "30d", "all"].map(r => (
                        <DropdownMenuItem key={r} onClick={() => setTimeRange(r)}>
                          {r === "all" ? "All Time" : `Last ${r}`}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceLineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.75rem',
                        boxShadow: 'var(--shadow-card)',
                        fontSize: '11px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="success_rate"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSuccess)"
                      name="Success Rate"
                    />
                    <Area
                      type="monotone"
                      dataKey="cost_efficiency"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPrimary)"
                      name="Efficiency"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Model Distribution */}
          <Card className="border-border/40 shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="bg-muted/30 border-b py-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Model Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[200px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="model"
                      tick={false}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.75rem',
                        boxShadow: 'var(--shadow-card)',
                        fontSize: '11px'
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                      name="Requests"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold tracking-tight uppercase text-muted-foreground/70">Resource Utilization</h4>
                  <Badge variant="outline" className="text-[10px] font-bold border-primary/20 bg-primary/5 text-primary">Top 3 Nodes</Badge>
                </div>
                {topModels.map((model, idx) => (
                  <div key={model.model} className="p-3 rounded-xl bg-secondary/10 border border-border/40 flex items-center justify-between group hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center text-xs font-bold shadow-sm">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight">{model.model}</span>
                        <div className="w-32 bg-secondary/50 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(var(--primary),0.2)]"
                            style={{ width: `${(model.count / totalRequests) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-nums">{model.count}</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Requests</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure Health */}
          <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b py-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Cloud className="h-4 w-4 text-primary" />
                Latency Scatter
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      type="number"
                      dataKey="usage"
                      name="Usage"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      label={{ value: 'Total Requests', position: 'bottom', offset: 0, fontSize: 10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="latency"
                      name="Latency"
                      unit="ms"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      label={{ value: 'Latency (ms)', angle: -90, position: 'left', offset: 10, fontSize: 10 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-card border border-border p-3 rounded-xl shadow-card">
                              <p className="text-xs font-bold mb-1">{data.model}</p>
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">Latency: <span className="font-bold text-foreground">{data.latency}ms</span></p>
                                <p className="text-[10px] text-muted-foreground">Traffic: <span className="font-bold text-foreground">{data.usage} reqs</span></p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter
                      name="Models"
                      data={latencyScatterData}
                      fill="hsl(var(--primary))"
                    >
                      {latencyScatterData.map((entry, index) => (
                        <circle
                          key={`cell-${index}`}
                          cx={0} cy={0} r={6}
                          fill={entry.color}
                          fillOpacity={0.6}
                          stroke={entry.color}
                          strokeWidth={2}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );

};