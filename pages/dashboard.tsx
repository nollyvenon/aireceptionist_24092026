import Head from 'next/head'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <>
      <Head>
        <title>GLACIER AI - Dashboard</title>
        <meta name="description" content="GLACIER AI Dashboard - Manage appointments, CRM, and analytics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-surface pt-16 md:pt-20">
        {/* Header */}
        <div className="sticky top-0 z-40 border-b border-surface-variant bg-surface-container-lowest/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-on-surface">Dashboard</h1>
                <p className="text-sm text-on-surface-variant">Welcome back, Admin</p>
              </div>
              <div className="flex gap-4 items-center">
                <button className="px-4 py-2 bg-md-secondary text-on-secondary rounded-lg hover:bg-opacity-90 transition-colors">
                  <span className="flex items-center gap-2">
                    <span>🔔</span> Notifications
                  </span>
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-md-secondary to-secondary-container flex items-center justify-center text-on-secondary font-bold">
                  A
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-element-gap mb-section-margin">
            <MetricCard
              title="Total Appointments"
              value="1,234"
              change="+12% this month"
              icon="📅"
            />
            <MetricCard
              title="Revenue"
              value="$45,230"
              change="+8% this month"
              icon="💰"
            />
            <MetricCard
              title="Active Customers"
              value="856"
              change="+5% this month"
              icon="👥"
            />
            <MetricCard
              title="Response Time"
              value="2.3s"
              change="-15% faster"
              icon="⚡"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-4 shadow-level-1"
            >
              <h2 className="text-xl font-bold text-on-surface mb-4">Appointments This Month</h2>
              <div className="h-64 bg-surface-container-low rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-md-secondary mb-2">1,234</div>
                  <p className="text-on-surface-variant">Appointments booked</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <div className="flex items-end gap-1">
                      <div className="w-2 h-8 bg-md-secondary rounded"></div>
                      <div className="w-2 h-12 bg-md-secondary rounded"></div>
                      <div className="w-2 h-10 bg-md-secondary rounded"></div>
                      <div className="w-2 h-16 bg-md-secondary rounded"></div>
                      <div className="w-2 h-14 bg-md-secondary rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface-container-lowest rounded-xl p-4 shadow-level-1"
            >
              <h2 className="text-xl font-bold text-on-surface mb-4">Top Services</h2>
              <div className="space-y-3">
                {['Consultation', 'Follow-up', 'Onboarding', 'Support'].map((service, i) => (
                  <div key={service} className="flex justify-between items-center pb-3 border-b border-surface-variant last:border-b-0">
                    <span className="text-sm text-on-surface-variant">{service}</span>
                    <span className="font-bold text-on-surface">{234 - i * 50}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-container-lowest rounded-xl p-4 shadow-level-1"
          >
            <h2 className="text-xl font-bold text-on-surface mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {[
                { action: 'New appointment booked', time: '2 min ago', by: 'AI Receptionist' },
                { action: 'Payment received', time: '15 min ago', by: '$450 from John Doe' },
                { action: 'SMS reminder sent', time: '1 hour ago', by: '145 customers' },
                { action: 'Lead qualified', time: '2 hours ago', by: 'AI System' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between pb-3 border-b border-surface-variant last:border-b-0">
                  <div>
                    <p className="text-sm text-on-surface font-medium">{activity.action}</p>
                    <p className="text-xs text-on-surface-variant">{activity.by}</p>
                  </div>
                  <span className="text-xs text-on-surface-variant">{activity.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </>
  )
}

function MetricCard({ title, value, change, icon }: { title: string; value: string; change: string; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container-lowest rounded-xl p-4 shadow-level-1 border-l-2 border-md-secondary"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm text-on-surface-variant font-medium">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-bold text-on-surface mb-1">{value}</div>
        <p className="text-xs text-md-secondary">{change}</p>
      </div>
    </motion.div>
  )
}
