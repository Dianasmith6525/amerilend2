import React, { useState } from 'react';
import { MoreVertical, TrendingUp, AlertCircle, CheckCircle, Clock, DollarSign, Users, Eye } from 'lucide-react';

export function AdminDashboardEnhanced() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const quickStats = [
    { label: 'Pending Review', value: '24', icon: Clock, color: 'bg-amber-100', textColor: 'text-amber-700', trend: '+12%' },
    { label: 'Total Approved', value: '$2.4M', icon: CheckCircle, color: 'bg-green-100', textColor: 'text-green-700', trend: '+8%' },
    { label: 'Under Investigation', value: '3', icon: AlertCircle, color: 'bg-red-100', textColor: 'text-red-700', trend: '-2%' },
    { label: 'Active Users', value: '1,240', icon: Users, color: 'bg-blue-100', textColor: 'text-blue-700', trend: '+5%' },
  ];

  const recentApplications = [
    {
      id: 'APP-001',
      name: 'John Anderson',
      amount: '$50,000',
      status: 'pending',
      risk: 'low',
      date: '2 hours ago',
      documents: 3,
    },
    {
      id: 'APP-002',
      name: 'Sarah Mitchell',
      amount: '$30,000',
      status: 'approved',
      risk: 'low',
      date: '4 hours ago',
      documents: 4,
    },
    {
      id: 'APP-003',
      name: 'Mike Chen',
      amount: '$75,000',
      status: 'investigating',
      risk: 'high',
      date: '6 hours ago',
      documents: 2,
    },
  ];

  const statusBadges: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
    approved: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
    investigating: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle className="w-4 h-4" /> },
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="fade-in-down">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-lg p-6 border border-gray-200 fade-in-up smooth-transition hover:shadow-lg hover:border-gray-300"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <span className={`text-sm font-semibold ${stat.textColor}`}>{stat.trend}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 fade-in-up smooth-transition">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View All</button>
          </div>

          <div className="space-y-4">
            {recentApplications.map((app, i) => {
              const statusStyle = statusBadges[app.status as keyof typeof statusBadges];
              return (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">{app.name}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.icon}
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{app.id}</span>
                      <span>•</span>
                      <span>{app.date}</span>
                      <span>•</span>
                      <span>{app.documents} docs</span>
                    </div>
                  </div>

                  <div className="text-right mr-4">
                    <p className="font-bold text-lg text-gray-900">{app.amount}</p>
                    <p className={`text-xs font-medium ${app.risk === 'low' ? 'text-green-600' : 'text-red-600'}`}>
                      {app.risk === 'low' ? '✓ Low Risk' : '⚠ High Risk'}
                    </p>
                  </div>

                  <button className="p-2 text-gray-500 hover:bg-white rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 fade-in-up smooth-transition">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Review Pending Apps
              </button>
              <button className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">
                Export Reports
              </button>
              <button className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">
                View Fraud Alerts
              </button>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 fade-in-up smooth-transition">
            <h3 className="font-bold text-gray-900 mb-4">System Alerts</h3>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">3 Fraud Detections</p>
                  <p className="text-xs text-red-700 mt-0.5">Review flagged applications</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">24 Hours SLA Alert</p>
                  <p className="text-xs text-amber-700 mt-0.5">5 applications pending review</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 fade-in-up smooth-transition">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Approval Performance</h2>
            <p className="text-sm text-gray-600 mt-1">Last 30 days</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg">7D</button>
            <button className="px-3 py-1 bg-gray-200 text-gray-900 text-sm rounded-lg">30D</button>
            <button className="px-3 py-1 bg-gray-200 text-gray-900 text-sm rounded-lg">90D</button>
          </div>
        </div>

        {/* Simple bar chart */}
        <div className="grid grid-cols-7 gap-2 h-40">
          {[65, 72, 58, 85, 92, 78, 88].map((value, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-end gap-2 fade-in-up smooth-transition"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-700 hover:to-blue-500" style={{ height: `${value}%` }}></div>
              <span className="text-xs text-gray-600">Day {i + 1}</span>
            </div>
          ))}
        </div>

        {/* Stats below chart */}
        <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-600 mb-1">Avg Approval Rate</p>
            <p className="text-2xl font-bold text-gray-900">78.9%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Processed</p>
            <p className="text-2xl font-bold text-gray-900">2,847</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Avg Processing Time</p>
            <p className="text-2xl font-bold text-gray-900">4.2h</p>
          </div>
        </div>
      </div>
    </div>
  );
}
