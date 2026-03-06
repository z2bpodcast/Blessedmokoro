'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Calendar, TrendingUp, DollarSign, Users, AlertCircle } from 'lucide-react'

export default function BuilderRulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-royal-gradient shadow-xl border-b-4 border-gold-400">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
              <img src="/logo.jpg" alt="Z2B Logo" className="h-16 w-16 rounded-xl border-2 border-gold-400 shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold text-white">Z2B Builder Rules</h1>
                <p className="text-sm text-gold-300">Compensation & Operational Policy</p>
              </div>
            </Link>
            <Link href="/pricing" className="flex items-center gap-2 bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
              <ArrowLeft className="w-4 h-4" />
              Back to Pricing
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Introduction */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-primary-800 mb-4">
            Z2B Builder Rules & Compensation Policy
          </h2>
          <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full mb-6"></div>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Operational rules and compensation guidelines that apply to all Z2B Legacy Builders
          </p>
        </div>

        {/* Section 1: 90 Day Grace Period */}
        <div className="card border-4 border-primary-300 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="w-8 h-8 text-green-700" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary-800 mb-2">
                Section 1 — 90 Day New Builder Grace Period
              </h3>
              <p className="text-gray-700 mb-4">
                New members receive a <strong>90-day grace period</strong> to build their business foundation.
              </p>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-6">
            <h4 className="font-bold text-green-800 mb-3">During this grace period:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Builders earn <strong>100% commissions</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Builders are <strong>exempt from the 4 personal sales rule</strong></span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 2: Monthly Activity Rule */}
        <div className="card border-4 border-primary-300 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-purple-700" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary-800 mb-2">
                Section 2 — Monthly Builder Activity Rule
              </h3>
              <p className="text-gray-700 mb-4">
                After the grace period, Builders must complete <strong>4 personal sales per month</strong>.
              </p>
            </div>
          </div>

          <div className="bg-purple-50 border-2 border-purple-400 rounded-lg p-6">
            <h4 className="font-bold text-purple-800 mb-3">Sales may include:</h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-purple-600">•</span> Membership packages
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-purple-600">•</span> Coaching services
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-purple-600">•</span> App building services
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-purple-600">•</span> Digital products
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-purple-600">•</span> Physical products
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-purple-600">•</span> Marketplace services
              </div>
              <div className="flex items-center gap-2 text-gray-700 md:col-span-2">
                <span className="text-purple-600">•</span> Business Fuel Maintenance (BFM)
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Partial Commission Qualification */}
        <div className="card border-4 border-primary-300 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="w-8 h-8 text-blue-700" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary-800 mb-2">
                Section 3 — Partial Commission Qualification
              </h3>
              <p className="text-gray-700 mb-4">
                If the 4 sales requirement is not met, commissions are reduced proportionally.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-100 border-2 border-blue-400">
                  <th className="p-4 text-left font-bold text-blue-900">Sales Activity</th>
                  <th className="p-4 text-left font-bold text-blue-900">Commission Eligibility</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-2 border-gray-200">
                  <td className="p-4 text-gray-700">4 Sales</td>
                  <td className="p-4 font-bold text-green-700">100%</td>
                </tr>
                <tr className="border-2 border-gray-200 bg-gray-50">
                  <td className="p-4 text-gray-700">3 Sales</td>
                  <td className="p-4 font-bold text-blue-700">90%</td>
                </tr>
                <tr className="border-2 border-gray-200">
                  <td className="p-4 text-gray-700">2 Sales</td>
                  <td className="p-4 font-bold text-yellow-700">80%</td>
                </tr>
                <tr className="border-2 border-gray-200 bg-gray-50">
                  <td className="p-4 text-gray-700">BFM Only</td>
                  <td className="p-4 font-bold text-orange-700">70%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Business Fuel Maintenance */}
        <div className="card border-4 border-primary-300 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-yellow-100 p-3 rounded-full">
              <AlertCircle className="w-8 h-8 text-yellow-700" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary-800 mb-2">
                Section 4 — Business Fuel Maintenance (BFM)
              </h3>
              <p className="text-gray-700 mb-4">
                Builders earning <strong>R2,500 or more per month</strong> must maintain Business Fuel.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-yellow-800 mb-2">R500</p>
              <p className="text-yellow-700">Monthly Business Fuel Maintenance</p>
            </div>
            
            <h4 className="font-bold text-yellow-800 mb-3">Rules:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span className="text-gray-700">Automatically deducted when income ≥ R2,500</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span className="text-gray-700">Contributes <strong>25 PV</strong> to the Builder's volume</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span className="text-gray-700">Counts as <strong>1 sales activity</strong></span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 5: Builder Activity Review */}
        <div className="card border-4 border-primary-300 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-red-100 p-3 rounded-full">
              <Users className="w-8 h-8 text-red-700" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary-800 mb-2">
                Section 5 — Builder Activity Review
              </h3>
              <p className="text-gray-700 mb-4">
                Builder accounts may be reviewed if business activity drops below acceptable levels.
              </p>
            </div>
          </div>

          <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              Accounts inactive for <strong>2 consecutive quarters (6 months)</strong> may be subject to review.
            </p>
            <p className="text-sm text-red-800">
              This policy helps remove inactive or dormant memberships and maintain an active, engaged builder community.
            </p>
          </div>
        </div>

        {/* Section 6: Commission Sources */}
        <div className="card border-4 border-primary-300 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-gold-100 p-3 rounded-full">
              <DollarSign className="w-8 h-8 text-gold-700" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary-800 mb-2">
                Section 6 — Commission Sources
              </h3>
              <p className="text-gray-700 mb-4">
                Builders can generate commissions from multiple revenue streams.
              </p>
            </div>
          </div>

          <div className="bg-gold-50 border-2 border-gold-400 rounded-lg p-6">
            <h4 className="font-bold text-gold-800 mb-3">Commissions may be generated from:</h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign className="w-4 h-4 text-gold-600" />
                Coaching services
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign className="w-4 h-4 text-gold-600" />
                App building services
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign className="w-4 h-4 text-gold-600" />
                Digital products
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign className="w-4 h-4 text-gold-600" />
                Physical products
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign className="w-4 h-4 text-gold-600" />
                Marketplace services
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign className="w-4 h-4 text-gold-600" />
                Membership sales
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-royal-gradient rounded-2xl p-12 border-8 border-gold-400 shadow-2xl">
          <h3 className="text-4xl font-bold text-white mb-4">
            Ready to Become a Builder?
          </h3>
          <p className="text-xl text-gold-200 mb-8">
            Join Z2B Legacy Builders and start earning today
          </p>
          <Link href="/pricing" className="inline-block bg-white text-primary-700 font-bold px-10 py-4 rounded-lg hover:bg-gold-50 transition-colors text-lg border-4 border-gold-400 shadow-xl">
            View Membership Tiers
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-8 border-t-8 border-gold-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.jpg" alt="Z2B Logo" className="h-12 w-12 rounded-lg border-2 border-gold-400" />
            <span className="text-2xl font-bold text-gold-300">Z2B TABLE BANQUET</span>
          </div>
          <p className="text-gold-200">&copy; 2026 Z2B Table Banquet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}