"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import {
  People as PeopleIcon,
  Event as EventIcon,
  Folder as FolderIcon,
  Groups as TeamsIcon,
  Business as PartnersIcon,
  EmojiEvents as PrizeIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  SmartToy as AiIcon,
  Speed as SpeedIcon,
  Token as TokenIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

// MongoDB brand-aligned chart palette
const CHART_COLORS = [
  "#00684A", // forest green
  "#006EFF", // blue
  "#B45AF2", // purple
  "#FFC010", // yellow
  "#CF4520", // red
  "#00ED64", // spring green
  "#023430", // evergreen
  "#4A90FF", // light blue
  "#C766FF", // light purple
  "#E6AC00", // dark yellow
];

const TIER_COLORS: Record<string, string> = {
  platinum: "#E5E4E2",
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  community: "#00ED64",
};

const CATEGORY_LABELS: Record<string, string> = {
  project_suggestions: "Project Suggestions",
  judge_feedback: "Judge Feedback",
  project_summaries: "Project Summaries",
  skill_embeddings: "Skill Embeddings",
  rag_chat: "RAG Chat",
  rag_embeddings: "RAG Embeddings",
};

interface NameValue {
  name: string;
  value: number;
}

interface MonthCount {
  month: string;
  count: number;
}

interface CapacityItem {
  name: string;
  capacity: number;
  registered: number;
  utilization: number;
}

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalEvents: number;
    totalProjects: number;
    totalTeams: number;
    totalPartners: number;
    totalParticipants: number;
    totalPrizes: number;
    totalScores: number;
    totalPrizeValue: number;
    totalContributions: number;
    prizesAwarded: number;
  };
  users: { byRole: NameValue[] };
  events: {
    byStatus: NameValue[];
    byFormat: NameValue[];
    byMonth: MonthCount[];
    capacityUtilization: CapacityItem[];
    byCountry: NameValue[];
  };
  participants: {
    byExperience: NameValue[];
    topSkills: NameValue[];
    attendanceStatus: NameValue[];
    registrationsByMonth: MonthCount[];
  };
  projects: {
    byStatus: NameValue[];
    byCategory: NameValue[];
    topTechnologies: NameValue[];
    submissionsByMonth: MonthCount[];
  };
  teams: {
    byStatus: NameValue[];
    sizeDistribution: NameValue[];
  };
  partners: {
    byTier: NameValue[];
    byStatus: NameValue[];
    byIndustry: NameValue[];
    byEngagement: NameValue[];
  };
  prizes: { byCategory: NameValue[] };
  scores: {
    averages: {
      innovation: number;
      technical: number;
      impact: number;
      presentation: number;
      total: number;
    } | null;
    distribution: Array<{ range: string; count: number }>;
  };
  feedback: {
    overview: {
      totalSent: number;
      totalCompleted: number;
      responseRate: number;
      avgCompletionTime: number;
      participantResponses: number;
      partnerResponses: number;
    };
    nps: {
      promoters: number;
      passives: number;
      detractors: number;
      score: number;
      totalScores: number;
    };
    avgRatings: Array<{ question: string; avgScore: number }>;
    byEvent: Array<{
      eventName: string;
      sent: number;
      completed: number;
      responseRate: number;
    }>;
    byMonth: MonthCount[];
  };
}

interface AiAnalyticsData {
  overview: {
    totalCalls: number;
    totalTokens: number;
    totalCost: number;
    avgDurationMs: number;
    callsToday: number;
    tokensToday: number;
    costToday: number;
  };
  byCategory: Array<{
    name: string;
    calls: number;
    tokens: number;
    cost: number;
    avgDuration: number;
  }>;
  byModel: Array<{
    name: string;
    model: string;
    provider: string;
    calls: number;
    tokens: number;
    cost: number;
  }>;
  dailyUsage: Array<{
    date: string;
    calls: number;
    tokens: number;
    cost: number;
  }>;
  topUsers: Array<{
    name: string;
    email: string;
    calls: number;
    tokens: number;
    cost: number;
  }>;
  errorRates: Array<{
    name: string;
    total: number;
    errors: number;
    rate: number;
  }>;
}

function StatCard({
  label,
  value,
  subtitle,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        {subtitle && (
          <Chip label={subtitle} size="small" variant="outlined" sx={{ mt: 1 }} />
        )}
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  minHeight = 300,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  minHeight?: number;
}) {
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}
        <Box sx={{ width: "100%", minHeight }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

function SimplePieChart({ data }: { data: NameValue[] }) {
  if (!data.length) return <NoData />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={50}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) =>
            `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
          }
          labelLine={false}
        >
          {data.map((_entry, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

function SimpleBarChart({
  data,
  dataKey = "value",
  nameKey = "name",
  color = CHART_COLORS[0],
  layout = "horizontal",
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  dataKey?: string;
  nameKey?: string;
  color?: string;
  layout?: "horizontal" | "vertical";
}) {
  if (!data.length) return <NoData />;
  const isVertical = layout === "vertical";
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout={isVertical ? "vertical" : "horizontal"}
        margin={{ top: 5, right: 20, left: isVertical ? 80 : 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        {isVertical ? (
          <>
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey={nameKey}
              tick={{ fontSize: 12 }}
              width={75}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={nameKey} tick={{ fontSize: 12 }} />
            <YAxis />
          </>
        )}
        <Tooltip />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function NoData() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 200,
        color: "text.secondary",
      }}
    >
      <Typography variant="body2">No data available</Typography>
    </Box>
  );
}

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

// ─── AI Usage Tab ───────────────────────────────────────────────────────
function AiUsageTab({ aiData }: { aiData: AiAnalyticsData | null }) {
  if (!aiData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  const { overview, byCategory, byModel, dailyUsage, topUsers } = aiData;

  const categoryChartData = byCategory.map((c) => ({
    name: CATEGORY_LABELS[c.name] || c.name,
    calls: c.calls,
    tokens: c.tokens,
    cost: c.cost,
  }));

  const modelChartData = byModel.map((m) => ({
    name: m.name,
    value: m.calls,
  }));

  return (
    <>
      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Total AI Calls"
            value={formatNumber(overview.totalCalls)}
            subtitle={`${overview.callsToday} today`}
            icon={<AiIcon sx={{ fontSize: 32 }} />}
            color="#B45AF2"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Total Tokens"
            value={formatNumber(overview.totalTokens)}
            subtitle={`${formatNumber(overview.tokensToday)} today`}
            icon={<TokenIcon sx={{ fontSize: 32 }} />}
            color="#006EFF"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Estimated Cost"
            value={`$${overview.totalCost.toFixed(2)}`}
            subtitle={`$${overview.costToday.toFixed(2)} today`}
            icon={<MoneyIcon sx={{ fontSize: 32 }} />}
            color="#00684A"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Avg Latency"
            value={`${(overview.avgDurationMs / 1000).toFixed(1)}s`}
            icon={<SpeedIcon sx={{ fontSize: 32 }} />}
            color="#FFC010"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Categories"
            value={byCategory.length}
            icon={<AssessmentIcon sx={{ fontSize: 32 }} />}
            color="#CF4520"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Usage by Category */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Calls by Category" subtitle="API call count per AI feature">
            <SimpleBarChart
              data={categoryChartData}
              dataKey="calls"
              layout="vertical"
              color={CHART_COLORS[2]}
            />
          </ChartCard>
        </Grid>

        {/* Usage by Model */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Calls by Model" subtitle="Distribution across AI models">
            {modelChartData.length ? (
              <SimplePieChart data={modelChartData} />
            ) : (
              <NoData />
            )}
          </ChartCard>
        </Grid>

        {/* Daily Usage Trend */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Daily API Calls" subtitle="Last 30 days">
            {dailyUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={dailyUsage} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="calls" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <NoData />
            )}
          </ChartCard>
        </Grid>

        {/* Cost Trend */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Daily Cost Trend" subtitle="Estimated cost (USD) over last 30 days">
            {dailyUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dailyUsage} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(4)}`, "Cost"]} />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke={CHART_COLORS[0]}
                    fill={CHART_COLORS[0]}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <NoData />
            )}
          </ChartCard>
        </Grid>

        {/* Token Usage by Category */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Tokens by Category" subtitle="Token consumption per AI feature">
            <SimpleBarChart
              data={categoryChartData}
              dataKey="tokens"
              layout="vertical"
              color={CHART_COLORS[0]}
            />
          </ChartCard>
        </Grid>

        {/* Top Users */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Top Users by AI Usage" subtitle="Highest token consumers">
            {topUsers.length > 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 280 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Calls</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Tokens</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topUsers.map((user, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell align="right">{user.calls}</TableCell>
                        <TableCell align="right">{formatNumber(user.tokens)}</TableCell>
                        <TableCell align="right">${user.cost.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <NoData />
            )}
          </ChartCard>
        </Grid>
      </Grid>
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────
export default function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [aiData, setAiData] = useState<AiAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [analyticsRes, feedbackRes] = await Promise.all([
          fetch("/api/admin/analytics"),
          fetch("/api/admin/analytics/feedback")
        ]);

        if (!analyticsRes.ok) throw new Error("Failed to fetch analytics");

        const analyticsData = await analyticsRes.json();
        const feedbackData = feedbackRes.ok ? await feedbackRes.json() : null;

        setData({
          ...analyticsData,
          feedback: feedbackData?.success ? feedbackData.data : {
            overview: {
              totalSent: 0,
              totalCompleted: 0,
              responseRate: 0,
              avgCompletionTime: 0,
              participantResponses: 0,
              partnerResponses: 0
            },
            nps: { promoters: 0, passives: 0, detractors: 0, score: 0, totalScores: 0 },
            avgRatings: [],
            byEvent: [],
            byMonth: []
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  // Fetch AI data lazily when tab is selected
  useEffect(() => {
    if (activeTab === 7 && !aiData) {
      fetch("/api/admin/analytics/ai")
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setAiData(json.data);
        })
        .catch((err) => console.error("Failed to fetch AI analytics:", err));
    }
  }, [activeTab, aiData]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return <Alert severity="error">{error || "Failed to load analytics"}</Alert>;
  }

  const { overview } = data;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Platform Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive statistics across all hackathon activity
        </Typography>
      </Box>

      {/* === KPI Overview Cards (always visible) === */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard label="Users" value={overview.totalUsers} icon={<PeopleIcon sx={{ fontSize: 32 }} />} color="primary.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard label="Events" value={overview.totalEvents} icon={<EventIcon sx={{ fontSize: 32 }} />} color="secondary.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard label="Participants" value={overview.totalParticipants} icon={<PeopleIcon sx={{ fontSize: 32 }} />} color="success.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard label="Projects" value={overview.totalProjects} icon={<FolderIcon sx={{ fontSize: 32 }} />} color="info.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard label="Teams" value={overview.totalTeams} icon={<TeamsIcon sx={{ fontSize: 32 }} />} color="warning.main" />
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard label="Partners" value={overview.totalPartners} icon={<PartnersIcon sx={{ fontSize: 32 }} />} color="#B45AF2" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard label="Total Prize Pool" value={`$${overview.totalPrizeValue.toLocaleString()}`} subtitle={`${overview.prizesAwarded} awarded`} icon={<PrizeIcon sx={{ fontSize: 32 }} />} color="#FFC010" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard label="Partner Contributions" value={`$${overview.totalContributions.toLocaleString()}`} icon={<MoneyIcon sx={{ fontSize: 32 }} />} color="#CF4520" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard label="Scores Submitted" value={overview.totalScores} icon={<AssessmentIcon sx={{ fontSize: 32 }} />} color="#023430" />
        </Grid>
      </Grid>

      {/* === Tabs === */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 500, minHeight: 48 },
          }}
        >
          <Tab label="Attendees" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Projects" icon={<FolderIcon />} iconPosition="start" />
          <Tab label="Judging" icon={<AssessmentIcon />} iconPosition="start" />
          <Tab label="Events" icon={<EventIcon />} iconPosition="start" />
          <Tab label="Partners" icon={<PartnersIcon />} iconPosition="start" />
          <Tab label="Feedback" icon={<AssignmentIcon />} iconPosition="start" />
          <Tab label="AI Usage" icon={<AiIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* ─── Tab 0: Attendees ─── */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <ChartCard title="Experience Levels" subtitle="Participant skill distribution">
              <SimplePieChart data={data.participants.byExperience} />
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ChartCard title="Attendance Status" subtitle="Registered vs attended vs no-show">
              <SimplePieChart data={data.participants.attendanceStatus} />
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ChartCard title="Users by Role" subtitle="Platform role distribution">
              <SimplePieChart data={data.users.byRole} />
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard title="Top Skills" subtitle="Most common participant skills">
              <SimpleBarChart
                data={data.participants.topSkills}
                layout="vertical"
                color={CHART_COLORS[0]}
              />
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard title="Registration Trend" subtitle="Monthly participant registrations">
              {data.participants.registrationsByMonth.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={data.participants.registrationsByMonth} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <NoData />
              )}
            </ChartCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ─── Tab 1: Projects ─── */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <ChartCard title="Project Status" subtitle="Current submission pipeline">
              <SimplePieChart data={data.projects.byStatus} />
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ChartCard title="Categories" subtitle="Project category distribution">
              <SimplePieChart data={data.projects.byCategory} />
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ChartCard title="Submission Trend" subtitle="Monthly project submissions">
              {data.projects.submissionsByMonth.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.projects.submissionsByMonth} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <NoData />
              )}
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard title="Top Technologies" subtitle="Most used technologies across projects">
              <SimpleBarChart
                data={data.projects.topTechnologies}
                layout="vertical"
                color={CHART_COLORS[1]}
              />
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard title="Team Size Distribution" subtitle="Number of members per team">
              <SimpleBarChart
                data={data.teams.sizeDistribution}
                color={CHART_COLORS[2]}
              />
            </ChartCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ─── Tab 2: Judging ─── */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard title="Score Averages (Radar)" subtitle="Average scores across all judging criteria">
              {data.scores.averages ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart
                    data={[
                      { criteria: "Innovation", score: data.scores.averages.innovation },
                      { criteria: "Technical", score: data.scores.averages.technical },
                      { criteria: "Impact", score: data.scores.averages.impact },
                      { criteria: "Presentation", score: data.scores.averages.presentation },
                    ]}
                  >
                    <PolarGrid stroke="rgba(0,0,0,0.1)" />
                    <PolarAngleAxis dataKey="criteria" tick={{ fontSize: 13 }} />
                    <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                    <Radar
                      dataKey="score"
                      stroke={CHART_COLORS[0]}
                      fill={CHART_COLORS[0]}
                      fillOpacity={0.3}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <NoData />
              )}
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard title="Score Distribution" subtitle="Total scores grouped by range">
              <SimpleBarChart
                data={data.scores.distribution}
                dataKey="count"
                nameKey="range"
                color={CHART_COLORS[4]}
              />
            </ChartCard>
          </Grid>
          {data.scores.averages && (
            <Grid size={{ xs: 12 }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Score Summary
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { label: "Innovation", val: data.scores.averages.innovation, max: 10 },
                      { label: "Technical", val: data.scores.averages.technical, max: 10 },
                      { label: "Impact", val: data.scores.averages.impact, max: 10 },
                      { label: "Presentation", val: data.scores.averages.presentation, max: 10 },
                      { label: "Total Average", val: data.scores.averages.total, max: 40 },
                    ].map((item) => (
                      <Grid key={item.label} size={{ xs: 12, sm: 6, md: 2.4 }}>
                        <Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {item.label}
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>
                              {item.val} / {item.max}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(item.val / item.max) * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: "rgba(0,0,0,0.06)",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 4,
                              },
                            }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* ─── Tab 3: Events ─── */}
      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <ChartCard title="Event Status" subtitle="Current event lifecycle stages">
              <SimplePieChart data={data.events.byStatus} />
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ChartCard title="Event Format" subtitle="Virtual vs in-person events">
              <SimplePieChart data={data.events.byFormat} />
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ChartCard title="Team Status" subtitle="Team formation states">
              <SimplePieChart data={data.teams.byStatus} />
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard title="Capacity Utilization" subtitle="Registration fill rate per event">
              {data.events.capacityUtilization.length ? (
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 280 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Registered</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Capacity</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 140 }}>Utilization</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.events.capacityUtilization.map((row) => (
                        <TableRow key={row.name}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell align="right">{row.registered}</TableCell>
                          <TableCell align="right">{row.capacity}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(row.utilization, 100)}
                                sx={{
                                  flex: 1,
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: "rgba(0,0,0,0.06)",
                                  "& .MuiLinearProgress-bar": {
                                    borderRadius: 4,
                                    bgcolor:
                                      row.utilization > 90
                                        ? "error.main"
                                        : row.utilization > 60
                                          ? "warning.main"
                                          : "primary.main",
                                  },
                                }}
                              />
                              <Typography variant="caption" sx={{ minWidth: 35 }}>
                                {row.utilization}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <NoData />
              )}
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard title="Events by Country" subtitle="Geographic distribution of events">
              <SimpleBarChart
                data={data.events.byCountry}
                layout="vertical"
                color={CHART_COLORS[5]}
              />
            </ChartCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ─── Tab 4: Partners ─── */}
      <TabPanel value={activeTab} index={4}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <ChartCard title="Partners by Tier" subtitle="Sponsorship tier distribution">
              {data.partners.byTier.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={data.partners.byTier}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {data.partners.byTier.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={
                            TIER_COLORS[entry.name.toLowerCase()] ||
                            CHART_COLORS[i % CHART_COLORS.length]
                          }
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <NoData />
              )}
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ChartCard title="Partner Status" subtitle="Active vs inactive vs pending">
              <SimplePieChart data={data.partners.byStatus} />
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ChartCard title="Engagement Levels" subtitle="Partner engagement distribution">
              <SimplePieChart data={data.partners.byEngagement} />
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard title="Partners by Industry" subtitle="Industry sector breakdown">
              <SimpleBarChart
                data={data.partners.byIndustry}
                layout="vertical"
                color={CHART_COLORS[2]}
              />
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard title="Prizes by Category" subtitle="Prize pool category breakdown">
              <SimpleBarChart
                data={data.prizes.byCategory}
                color={CHART_COLORS[3]}
              />
            </ChartCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ─── Tab 5: Feedback ─── */}
      <TabPanel value={activeTab} index={5}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              label="Response Rate"
              value={`${data.feedback.overview.responseRate}%`}
              icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
              color={data.feedback.overview.responseRate > 50 ? "#00684A" : "#FFC010"}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              label="NPS Score"
              value={data.feedback.nps.score}
              subtitle={data.feedback.nps.totalScores > 0 ? `${data.feedback.nps.totalScores} scores` : undefined}
              icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
              color={data.feedback.nps.score > 50 ? "#00684A" : data.feedback.nps.score > 0 ? "#FFC010" : "#CF4520"}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              label="Responses"
              value={`${data.feedback.overview.totalCompleted} / ${data.feedback.overview.totalSent}`}
              icon={<AssignmentIcon sx={{ fontSize: 28 }} />}
              color="#006EFF"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              label="Avg Completion"
              value={`${data.feedback.overview.avgCompletionTime} min`}
              icon={<AssessmentIcon sx={{ fontSize: 28 }} />}
              color="#B45AF2"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              label="Participants"
              value={data.feedback.overview.participantResponses}
              icon={<PeopleIcon sx={{ fontSize: 28 }} />}
              color="#00684A"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              label="Partners"
              value={data.feedback.overview.partnerResponses}
              icon={<PartnersIcon sx={{ fontSize: 28 }} />}
              color="#006EFF"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard title="NPS Distribution" subtitle="Net Promoter Score breakdown">
              {data.feedback.nps.totalScores > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={[
                      { name: 'Detractors (0-6)', value: data.feedback.nps.detractors, fill: '#CF4520' },
                      { name: 'Passives (7-8)', value: data.feedback.nps.passives, fill: '#FFC010' },
                      { name: 'Promoters (9-10)', value: data.feedback.nps.promoters, fill: '#00684A' }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <NoData />
              )}
            </ChartCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard title="Feedback Responses Over Time" subtitle="Monthly submission trends">
              {data.feedback.byMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={data.feedback.byMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={CHART_COLORS[0]}
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS[0], r: 4 }}
                      name="Responses"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <NoData />
              )}
            </ChartCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard title="Average Ratings by Question" subtitle="Top 10 highest-rated questions">
              {data.feedback.avgRatings.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={data.feedback.avgRatings.slice(0, 6)}>
                    <PolarGrid stroke="#e0e0e0" />
                    <PolarAngleAxis dataKey="question" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 10]} />
                    <Radar
                      name="Score"
                      dataKey="avgScore"
                      stroke="#00684A"
                      fill="#00684A"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <NoData />
              )}
            </ChartCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard title="Response Rate by Event" subtitle="Feedback completion rates">
              {data.feedback.byEvent.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Event</strong></TableCell>
                        <TableCell align="right"><strong>Sent</strong></TableCell>
                        <TableCell align="right"><strong>Completed</strong></TableCell>
                        <TableCell align="right"><strong>Rate</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.feedback.byEvent.map((event, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{event.eventName}</TableCell>
                          <TableCell align="right">{event.sent}</TableCell>
                          <TableCell align="right">{event.completed}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${event.responseRate}%`}
                              size="small"
                              sx={{
                                bgcolor: event.responseRate > 50 ? "#00684A" : "#FFC010",
                                color: "#fff",
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <NoData />
              )}
            </ChartCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ─── Tab 6: AI Usage ─── */}
      <TabPanel value={activeTab} index={6}>
        <AiUsageTab aiData={aiData} />
      </TabPanel>
    </Box>
  );
}
