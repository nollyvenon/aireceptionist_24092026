import Head from 'next/head'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <>
      <Head>
        <title>GLACIER AI Receptionist - The AI Employee That Never Sleeps</title>
        <meta name="description" content="AI Receptionist for appointment booking, CRM, and customer management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold text-blue-600">GLACIER AI</div>
            <div className="flex gap-4">
              <button className="px-4 py-2 text-gray-700 hover:text-gray-900">Sign In</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Start Free Trial
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                The AI Employee That Never Sleeps
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Automate appointment booking, customer management, and follow-ups with AI
              </p>
              <div className="flex gap-4 justify-center">
                <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                  Get Started Free
                </button>
                <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold">
                  Watch Demo
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-emerald-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-6">Ready to transform your business?</h2>
            <p className="text-xl mb-8">Join thousands of businesses automating their operations with GLACIER AI</p>
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold">
              Start Your Free Trial
            </button>
          </div>
        </section>
      </main>
    </>
  )
}

const features = [
  {
    icon: '📞',
    title: 'AI Receptionist',
    description: 'Answer calls, book appointments, and provide customer support 24/7'
  },
  {
    icon: '📅',
    title: 'Smart Scheduling',
    description: 'Automated appointment booking with calendar synchronization'
  },
  {
    icon: '💰',
    title: 'Payments',
    description: 'Accept payments and manage invoices automatically'
  },
  {
    icon: '💬',
    title: 'Multi-Channel',
    description: 'SMS, WhatsApp, Email, Voice, and Messenger integration'
  },
  {
    icon: '📊',
    title: 'CRM',
    description: 'Complete customer relationship management system'
  },
  {
    icon: '⚙️',
    title: 'Automation',
    description: 'Build workflows without coding'
  }
]
