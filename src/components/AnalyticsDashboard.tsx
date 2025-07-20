import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { DollarSign, Shield, AlertTriangle, Brain, BarChart3, Info, TrendingUp } from "lucide-react";
import { RotateCcw, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { LineChart, Line, CartesianGrid } from "recharts";

const COLORS = ["#22c55e", "#e5e7eb", "#6366f1", "#f59e42"];

export const AnalyticsDashboard = ({ client }: { client: any }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    fetchAnalytics();
  }, [client]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await client.getAnalytics();
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

  // Pie chart data for cost savings
  const pieData = [
    { name: "Cost Saved", value: analytics.percent_cost_saved || 0 },
    { name: "Actual cost", value: 100 - (analytics.percent_cost_saved || 0) }
  ];

  // Inner donut data for 'Cost without guidera' (always 100%)
  const innerPieData = [
    { name: "Cost without Guidera", value: 100 }
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
  // Build chart data: actuals up to today, forecast to month end
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

  return (
    <Card className="w-full max-w-7xl mx-auto mt-8 shadow-elegant p-4 md:p-8 bg-background/90">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b pb-4">
        <div>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Dashboard Analytics
          </CardTitle>
          <CardDescription className="flex items-center gap-2 mt-1">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span>All metrics are updated in real-time. <span className="hidden md:inline">Hover on charts for details.</span></span>
          </CardDescription>
        </div>
        <div className="flex items-center gap-3 mt-2 md:mt-0">
          <span className="text-xs text-muted-foreground">Last updated: {lastUpdated}</span>
          <button
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border bg-background hover:bg-secondary transition-colors text-xs font-medium disabled:opacity-60"
            onClick={fetchAnalytics}
            disabled={loading}
            title="Refresh analytics"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Refresh
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-2">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, idx) => (
            <Card key={idx} className={`flex flex-col items-center py-6 px-2 shadow-card border-0 ${metric.bgColor} hover:shadow-elegant transition-shadow`}>
              <metric.icon className={`h-7 w-7 mb-1 ${metric.color}`} />
              <div className="text-2xl font-bold mb-0 text-foreground">{metric.value}</div>
              <div className="text-xs text-muted-foreground text-center">{metric.title}</div>
            </Card>
          ))}
        </div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cost Efficiency Pie Chart */}
          <Card className="p-6 flex flex-col items-center shadow-card border-0 min-h-[400px]">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-lg font-semibold text-foreground">Cost Efficiency</h4>
              <Badge variant="secondary">{analytics.percent_cost_saved?.toFixed(2) ?? 0}% saved</Badge>
            </div>
            <ResponsiveContainer width={320} height={320}>
              <PieChart>
                {/* Inner donut: Cost without guidera (blue) */}
                <Pie
                  data={innerPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  fill="#ef4444" // red-500
                  isAnimationActive={false}
                  tooltipType="none"
                />
                {/* Outer donut: Cost Saved vs Actual Cost */}
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={140}
                  startAngle={90}
                  endAngle={-270}
                  labelLine={false}
                >
                  <Cell key="cell-0" fill="#22c55e" /> {/* Cost Saved: green */}
                  <Cell key="cell-1" fill="#6366f1" /> {/* Actual cost: purple */}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: string) => [
                    typeof value === 'number' ? value.toFixed(3) : value,
                    name
                  ]}
                  filterNull={true}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      // Only show tooltip for outer ring (Cost Saved, Actual cost)
                      const filtered = payload.filter(p => p.name === 'Cost Saved' || p.name === 'Actual cost');
                      if (filtered.length) {
                        return (
                          <div className="custom-tooltip bg-background p-2 rounded shadow">
                            <span className="font-semibold">{filtered[0].name}: </span>
                            {filtered[0].value.toFixed(3)}
                          </div>
                        );
                      }
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ marginTop: 24 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-xs text-muted-foreground mt-2">Total Cost Saved: <span className="font-semibold text-green-600">{analytics.percent_cost_saved?.toFixed(2) ?? 0}%</span> of possible cost</div>
          </Card>
          {/* Model Analysis Bar Chart + Top Models Table */}
          <Card className="p-6 flex flex-col shadow-card border-0 min-h-[400px]">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-lg font-semibold text-foreground">Model Usage</h4>
              <Badge variant="secondary">{barData.length} models</Badge>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }} barSize={38}>
                <XAxis dataKey="model" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" interval={0} height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {/* Top Models Table */}
            <div className="mt-6">
              <div className="text-xs font-semibold mb-1 text-muted-foreground">Top Models</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Requests</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topModels.map((m, i) => (
                    <TableRow key={m.model}>
                      <td className="font-mono text-xs">{String(m.model)}</td>
                      <td>{m.count}</td>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
        {/* Insights Section */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6 flex flex-col gap-2 border-0 bg-gradient-to-r from-primary/5 to-secondary/10 min-h-[180px]">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">Insights</span>
            </div>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
              <li>Cost efficiency: <span className="font-semibold text-green-600">{analytics.percent_cost_saved?.toFixed(2) ?? 0}%</span> of possible cost saved.</li>
              <li>{metrics[0].value} total requests processed.</li>
              <li>{barData.length} unique models used.</li>
              <li>{metrics[2].value} compliance failures and {metrics[3].value} redactions performed.</li>
            </ul>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};