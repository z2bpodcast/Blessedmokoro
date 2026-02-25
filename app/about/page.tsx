'use client'

import Link from 'next/link'
import { GraduationCap, TrendingUp, Users, Sparkles, Target, Lightbulb, Crown, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-royal-gradient shadow-xl border-b-4 border-gold-400">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
              <img src="/logo.jpg" alt="Z2B Table Banquet Logo" className="h-16 w-16 rounded-xl border-2 border-gold-400 shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold text-white">Z2B TABLE BANQUET</h1>
                <p className="text-sm text-gold-300">Welcome to Abundance</p>
              </div>
            </Link>
            <div className="flex gap-3">
              <Link href="/" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                Home
              </Link>
              <Link href="/signup" className="btn-primary">
                Join Now
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-20 border-b-8 border-gold-400 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-400 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About Z2B Table Banquet
          </h1>
          <p className="text-xl md:text-2xl text-gold-200 max-w-3xl mx-auto">
            Transforming employees into entrepreneurial owners through education, empowerment, and AI-powered systems
          </p>
        </div>
      </section>

      {/* Business Model Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary-800 mb-4">Our Business Model</h2>
          <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full"></div>
        </div>

        <div className="card border-4 border-primary-600 shadow-2xl bg-gradient-to-br from-white to-primary-50 p-8 md:p-12">
          <p className="text-xl text-primary-800 text-center mb-8 leading-relaxed">
            We are a <span className="font-bold text-purple-700">Personal and Business Development Coaching</span> and <span className="font-bold text-purple-700">AI Systems Service Provider</span> dedicated to transforming the lives of employees and consumers worldwide.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white p-6 rounded-xl border-4 border-gold-400 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-royal-gradient p-3 rounded-full">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-primary-800">Our Focus</h3>
              </div>
              <p className="text-primary-700">
                Helping employees make a smooth transition to entrepreneurship by teaching them to flip everyday expenses into income-generating assets within a powerful wealth-building ecosystem.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border-4 border-gold-400 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-royal-gradient p-3 rounded-full">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-primary-800">AI-Powered</h3>
              </div>
              <p className="text-primary-700">
                Leveraging cutting-edge AI technology to provide personalized coaching, automated learning paths, and intelligent business systems that accelerate your journey to ownership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="bg-primary-50 py-16 border-y-4 border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Vision */}
            <div className="card border-4 border-blue-400 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-full shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-primary-800">Our Vision</h2>
              </div>
              <p className="text-lg text-primary-700 leading-relaxed mb-4">
                To influence and <span className="font-bold text-purple-700">T.E.E.E 1 billion employees and consumers</span> to become entrepreneurs and owners by 2039.
              </p>
              <p className="text-2xl font-bold text-gold-600 italic">
                From Zero to Legacies
              </p>
            </div>

            {/* Mission */}
            <div className="card border-4 border-green-400 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-primary-800">Our Mission</h2>
              </div>
              <p className="text-lg text-primary-700 leading-relaxed">
                To transform employees and consumers by <span className="font-bold text-purple-700">educating, empowering, and enriching</span> them to think, build, and live as owners through the <span className="font-bold text-gold-600">Z2B TABLE system</span> powered by AI technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* T.E.E.E Breakdown Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-primary-800 mb-4">What is T.E.E.E?</h2>
          <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full mb-6"></div>
          <p className="text-xl text-primary-600 max-w-3xl mx-auto">
            T.E.E.E is our comprehensive approach to transforming lives and building legacies
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Transformation */}
          <div className="card border-4 border-purple-400 hover:border-gold-400 transition-all group">
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform">
                <span className="text-4xl font-bold text-white">T</span>
              </div>
              <h3 className="text-2xl font-bold text-primary-800 mb-3">Transformation</h3>
              <p className="text-primary-700">
                Shift your mindset from employee to owner. Break free from limitations and discover your entrepreneurial potential.
              </p>
            </div>
          </div>

          {/* Education */}
          <div className="card border-4 border-blue-400 hover:border-gold-400 transition-all group">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform">
                <span className="text-4xl font-bold text-white">E</span>
              </div>
              <h3 className="text-2xl font-bold text-primary-800 mb-3">Education</h3>
              <p className="text-primary-700">
                Learn proven strategies for wealth building, business development, and financial freedom through expert-led workshops.
              </p>
            </div>
          </div>

          {/* Empowerment */}
          <div className="card border-4 border-green-400 hover:border-gold-400 transition-all group">
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-green-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform">
                <span className="text-4xl font-bold text-white">E</span>
              </div>
              <h3 className="text-2xl font-bold text-primary-800 mb-3">Empowerment</h3>
              <p className="text-primary-700">
                Gain the tools, confidence, and support system to take action and build your entrepreneurial empire.
              </p>
            </div>
          </div>

          {/* Enrichment */}
          <div className="card border-4 border-gold-400 hover:border-gold-600 transition-all group">
            <div className="text-center">
              <div className="bg-gradient-to-br from-gold-500 to-gold-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform">
                <span className="text-4xl font-bold text-white">E</span>
              </div>
              <h3 className="text-2xl font-bold text-primary-800 mb-3">Enrichment</h3>
              <p className="text-primary-700">
                Build lasting wealth, create multiple income streams, and enrich your life and the lives of those around you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Market Section */}
      <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-16 border-y-8 border-gold-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Who We Serve</h2>
            <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full"></div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border-4 border-gold-400 shadow-2xl">
            <div className="flex items-center justify-center gap-4 mb-8">
              <Users className="w-12 h-12 text-gold-300" />
              <h3 className="text-3xl font-bold text-white">Our Ideal Member</h3>
            </div>
            
            <p className="text-xl text-white mb-8 leading-relaxed text-center">
              We serve <span className="font-bold text-gold-300">employees who are ready to transition</span> from trading time for money to building wealth through entrepreneurship.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl border-2 border-gold-300">
                <h4 className="text-xl font-bold text-gold-200 mb-3">You're Perfect If You:</h4>
                <ul className="space-y-2 text-white">
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-1">✓</span>
                    <span>Work a 9-5 but dream of entrepreneurship</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-1">✓</span>
                    <span>Want to build multiple income streams</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-1">✓</span>
                    <span>Desire financial freedom and time flexibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-1">✓</span>
                    <span>Ready to invest in yourself and your future</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl border-2 border-gold-300">
                <h4 className="text-xl font-bold text-gold-200 mb-3">What You'll Learn:</h4>
                <ul className="space-y-2 text-white">
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-1">→</span>
                    <span>How to turn expenses into income</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-1">→</span>
                    <span>Building wealth-generating assets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-1">→</span>
                    <span>Creating passive income systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-400 mt-1">→</span>
                    <span>Scaling your entrepreneurial venture</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Powered Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary-800 mb-4">AI-Powered Learning System</h2>
          <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full mb-6"></div>
          <p className="text-xl text-primary-600 max-w-3xl mx-auto">
            Our platform leverages advanced AI technology to accelerate your transformation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="card border-4 border-primary-300 hover:border-gold-400 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-royal-gradient p-3 rounded-full">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-primary-800">Personalized Learning</h3>
            </div>
            <p className="text-primary-700">
              AI analyzes your progress and adapts the curriculum to your learning pace, ensuring maximum retention and growth.
            </p>
          </div>

          <div className="card border-4 border-primary-300 hover:border-gold-400 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-royal-gradient p-3 rounded-full">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-primary-800">Smart Coaching</h3>
            </div>
            <p className="text-primary-700">
              Get instant answers, guidance, and support from our AI coach available 24/7 to help you overcome obstacles.
            </p>
          </div>

          <div className="card border-4 border-primary-300 hover:border-gold-400 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-royal-gradient p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-primary-800">Progress Tracking</h3>
            </div>
            <p className="text-primary-700">
              AI-powered analytics show your growth, identify areas for improvement, and celebrate your achievements along the way.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-royal-gradient py-16 border-t-8 border-gold-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl text-gold-200 mb-8">
            Join thousands of members who are building their entrepreneurial empire at the Z2B Table Banquet
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="inline-block bg-white text-primary-700 font-bold px-10 py-4 rounded-lg hover:bg-gold-50 transition-colors text-lg border-4 border-gold-400 shadow-xl">
              Join the Banquet
            </Link>
            <Link href="/library" className="inline-block bg-transparent border-4 border-white text-white font-bold px-10 py-4 rounded-lg hover:bg-white/10 transition-colors text-lg shadow-xl">
              Explore Content
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-8 border-t-8 border-gold-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.jpg" alt="Z2B Logo" className="h-12 w-12 rounded-lg border-2 border-gold-400" />
            <span className="text-2xl font-bold text-gold-300">Z2B TABLE BANQUET</span>
          </div>
          <p className="text-gold-200 mb-2">Transformation · Education · Empowerment · Enrichment</p>
          <p className="text-gold-200">&copy; 2026 Z2B Table Banquet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}