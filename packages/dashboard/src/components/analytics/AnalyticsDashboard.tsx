'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Calendar, Download, Zap, DollarSign, Activity, TrendingUp } from 'lucide-react';

const tokenData = [
  { date: 'Mon', input: 450000, output: 320000 },
  { date: 'Tue', input: 520000, output: 380000 },
  { date: 'Wed', input: 380000, output: 290000 },
  { date: 'Thu', input: 650000, output: 480000 },
  { date: 'Fri', input: 710000, output: 520000 },
  { date: 'Sat', input: 280000, output: 210000 },
  { date: 'Sun', input: 430000, output: 310000 },
];

const costByModel = [
  { name: 'GPT-4o', cost: 24.5, color: '#00ff88' },
  { name: 'Claude 3.5 Sonnet', cost: 18.2, color: '#00aaff' },
  { name: 'GPT-4o Mini', cost: 3.8, color: '#ff00aa' },
  { name: 'Gemini 2.0 Flash', cost: 0.73, color: '#ffaa00' },
];

const topAgents = [
  { name: 'Research Agent', runs: 342, tokens: 1250000, cost: 24.5 },
  { name: 'Code Assistant', runs: 589, tokens: 2340000, cost: 35.2 },
  { name: 'Data Analyst', runs: 156, tokens: 890000, cost: 8.9 },
  { name: 'Content Writer', runs: 78, tokens: 456000, cost: 6.8 },
  { name: 'Customer Support', runs: 1024, tokens: 3210000, cost: 12.4 },
];

const heatmapData = Array.from({ length: 24 }, (_, hour) => ({
  hour: `${hour.toString().padStart(2, '0')}:00`,
  mon: Math.floor(Math.random() * 100),
  tue: Math.floor(Math.random() * 100),
  wed: Math.floor(Math.random() * 100),
  thu: Math.floor(Math.random() * 100),
  fri: Math.floor(Math.random() * 100),
  sat: Math.floor(Math.random() * 50),
  sun: Math.floor(Math.random() * 50),
}));

export function AnalyticsDashboard() {
  const totalCost = costByModel.reduce((sum, m) => sum + m.cost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Analytics</h1>
          <p className="text-text-secondary mt-1">
            Usage statistics and cost breakdown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="w-4 h-4" />
            Last 7 days
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <Activity className="w-5 h-5 text-accent mx-auto mb-2" />
          <p className="text-2xl font-semibold text-text-primary">2,189</p>
          <p className="text-xs text-text-secondary">Total Runs</p>
          <Badge variant="success" size="sm" className="mt-2">
            <TrendingUp className="w-3 h-3 mr-1" />
            +12%
          </Badge>
        </Card>
        <Card className="text-center">
          <Zap className="w-5 h-5 text-chart-2 mx-auto mb-2" />
          <p className="text-2xl font-semibold text-text-primary">8.1M</p>
          <p className="text-xs text-text-secondary">Tokens Used</p>
          <Badge variant="success" size="sm" className="mt-2">
            <TrendingUp className="w-3 h-3 mr-1" />
            +8%
          </Badge>
        </Card>
        <Card className="text-center">
          <DollarSign className="w-5 h-5 text-chart-4 mx-auto mb-2" />
          <p className="text-2xl font-semibold text-text-primary">
            ${totalCost.toFixed(2)}
          </p>
          <p className="text-xs text-text-secondary">Total Cost</p>
          <Badge variant="warning" size="sm" className="mt-2">
            <TrendingUp className="w-3 h-3 mr-1" />
            +15%
          </Badge>
        </Card>
        <Card className="text-center">
          <div className="w-5 h-5 mx-auto mb-2 text-chart-3 font-bold">%</div>
          <p className="text-2xl font-semibold text-text-primary">94.5%</p>
          <p className="text-xs text-text-secondary">Success Rate</p>
          <Badge variant="success" size="sm" className="mt-2">
            +2%
          </Badge>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Usage */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Token Usage</CardTitle>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-text-secondary">Input</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-chart-2" />
                <span className="text-text-secondary">Output</span>
              </div>
            </div>
          </CardHeader>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tokenData}>
                <defs>
                  <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00aaff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00aaff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#666666', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666666', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333333', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="input" stroke="#00ff88" strokeWidth={2} fill="url(#colorInput)" />
                <Area type="monotone" dataKey="output" stroke="#00aaff" strokeWidth={2} fill="url(#colorOutput)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Cost by Model */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Cost by Model</CardTitle>
          </CardHeader>
          <div className="h-[250px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costByModel}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="cost"
                >
                  {costByModel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333333',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  formatter={(value) => <span className="text-text-secondary text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Agents */}
      <Card padding="none">
        <CardHeader className="px-4 pt-4">
          <CardTitle>Top Agents by Usage</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left text-xs font-medium text-text-tertiary px-4 py-3">Agent</th>
                <th className="text-right text-xs font-medium text-text-tertiary px-4 py-3">Runs</th>
                <th className="text-right text-xs font-medium text-text-tertiary px-4 py-3">Tokens</th>
                <th className="text-right text-xs font-medium text-text-tertiary px-4 py-3">Cost</th>
                <th className="text-right text-xs font-medium text-text-tertiary px-4 py-3">Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {topAgents.map((agent, index) => {
                const maxTokens = Math.max(...topAgents.map((a) => a.tokens));
                const percentage = (agent.tokens / maxTokens) * 100;
                return (
                  <tr key={agent.name} className="hover:bg-bg-hover transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-text-muted">{index + 1}</span>
                        <span className="text-sm font-medium text-text-primary">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-text-primary">
                      {agent.runs.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-text-primary">
                      {(agent.tokens / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-text-primary">
                      ${agent.cost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 w-32">
                      <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

