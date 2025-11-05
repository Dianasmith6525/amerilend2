import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, CheckCircle, Clock } from 'lucide-react';

export function DashboardAnalytics() {
  const stats = [
    {
      title: 'Total Applications',
      value: '1,240',
      change: '+12%',
      icon: Users,
      color: 'blue',
      delay: '0s',
    },
    {
      title: 'Amount Approved',
      value: '$2.4M',
      change: '+8%',
      icon: DollarSign,
      color: 'green',
      delay: '0.1s',
    },
    {
      title: 'Approval Rate',
      value: '87%',
      change: '+3%',
      icon: CheckCircle,
      color: 'emerald',
      delay: '0.2s',
    },
    {
      title: 'Avg Processing',
      value: '2.4 hrs',
      change: '-15%',
      icon: Clock,
      color: 'orange',
      delay: '0.3s',
    },
  ];

  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="w-full">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="fade-in-up hover-lift"
              style={{ animationDelay: stat.delay }}
            >
              <Card className="overflow-hidden border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colorMap[stat.color as keyof typeof colorMap]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-green-600 bg-green-100/50 px-2 py-1 rounded">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Timeline Chart */}
      <Card className="border-0 shadow-md fade-in-up" style={{ animationDelay: '0.4s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Application Trends
          </CardTitle>
          <CardDescription>Last 7 days performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { day: 'Monday', rate: 85, applications: 142 },
              { day: 'Tuesday', rate: 88, applications: 156 },
              { day: 'Wednesday', rate: 86, applications: 148 },
              { day: 'Thursday', rate: 90, applications: 167 },
              { day: 'Friday', rate: 87, applications: 152 },
              { day: 'Saturday', rate: 84, applications: 128 },
              { day: 'Sunday', rate: 86, applications: 135 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 fade-in-up" style={{ animationDelay: `${0.5 + i * 0.05}s` }}>
                <div className="w-20 font-medium text-sm text-gray-600">{item.day}</div>
                <div className="flex-1">
                  <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-semibold smooth-transition"
                      style={{ width: `${item.rate}%` }}
                    >
                      {item.rate}%
                    </div>
                  </div>
                </div>
                <div className="w-16 text-right text-sm font-medium text-gray-900">
                  {item.applications}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Application Status Distribution */}
      <Card className="mt-8 border-0 shadow-md fade-in-up" style={{ animationDelay: '0.5s' }}>
        <CardHeader>
          <CardTitle>Application Status Distribution</CardTitle>
          <CardDescription>Current pipeline breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { label: 'Pending', value: 142, color: 'bg-yellow-500', pct: 12 },
              { label: 'Under Review', value: 89, color: 'bg-blue-500', pct: 7 },
              { label: 'Approved', value: 456, color: 'bg-green-500', pct: 37 },
              { label: 'Fee Paid', value: 234, color: 'bg-emerald-500', pct: 19 },
              { label: 'Disbursed', value: 319, color: 'bg-purple-500', pct: 26 },
            ].map((status, i) => (
              <div key={i} className="text-center fade-in-up" style={{ animationDelay: `${0.6 + i * 0.05}s` }}>
                <div className="relative w-full aspect-square mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="40%"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="40%"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${status.pct * 2.51} 251`}
                      className={`${status.color} smooth-transition`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{status.pct}%</p>
                    </div>
                  </div>
                </div>
                <p className="font-medium text-gray-900 mb-1">{status.label}</p>
                <p className="text-sm text-gray-600">{status.value} apps</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
