'use client'

import { redirect } from 'next/navigation'
import { Button } from '../components/ui/button'
import { SparklesIcon, ArrowDownIcon, MapPinIcon, UserGroupIcon, ChatBubbleLeftIcon, CheckCircleIcon, EyeSlashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="Zenlit Logo"
                className="w-8 h-8 mr-2"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Zenlit</span>
            </div>
            <div>
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Floating particles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-500/20 rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 10 + 5}s`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="mb-8">
            <img
              src="/logo.png"
              alt="Zenlit Logo"
              className="w-20 h-20 mx-auto mb-4"
            />
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Zenlit
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Real-World Networking. Reinvented.
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Connect with people around you without the noise. No followers, no likes, just genuine human connections.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                <SparklesIcon className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </Link>
            <Button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg rounded-xl transition-all duration-300"
            >
              Learn More
              <ArrowDownIcon className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowDownIcon className="w-6 h-6 text-gray-400" />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Three simple steps to meaningful connections
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 text-center group hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:translate-y-[-5px]">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500 transition-colors">
                <MapPinIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">One-Time Location Ping</h3>
              <p className="text-gray-400 leading-relaxed">Share your location once to discover people nearby. Your exact location stays private.</p>
            </div>
            
            {/* Feature Card 2 */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 text-center group hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:translate-y-[-5px]">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500 transition-colors">
                <UserGroupIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Proximity Profiles</h3>
              <p className="text-gray-400 leading-relaxed">See curated profiles of people in your area. No endless scrolling, just relevant connections.</p>
            </div>
            
            {/* Feature Card 3 */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 text-center group hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:translate-y-[-5px]">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500 transition-colors">
                <ChatBubbleLeftIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Instant Chat</h3>
              <p className="text-gray-400 leading-relaxed">Start conversations with people nearby. When you move apart, the connection naturally fades.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why ZenLit Section */}
      <section className="py-20 px-4 bg-gray-900/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Zenlit?</h2>
            <p className="text-xl text-gray-400">
              Social networking without the social pressure
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Why Tile 1 */}
            <div className="group">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center hover:border-green-500/50 transition-all duration-300 cursor-pointer">
                <h4 className="text-lg font-semibold text-white mb-2">No Follower Counts</h4>
                <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 mt-2 text-sm text-gray-400 text-center transition-opacity duration-300">
                Focus on quality connections, not vanity metrics
              </div>
            </div>
            
            {/* Why Tile 2 */}
            <div className="group">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center hover:border-green-500/50 transition-all duration-300 cursor-pointer">
                <h4 className="text-lg font-semibold text-white mb-2">No Filters</h4>
                <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 mt-2 text-sm text-gray-400 text-center transition-opacity duration-300">
                Authentic profiles, real people, genuine interactions
              </div>
            </div>
            
            {/* Why Tile 3 */}
            <div className="group">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center hover:border-green-500/50 transition-all duration-300 cursor-pointer">
                <h4 className="text-lg font-semibold text-white mb-2">No Likes</h4>
                <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 mt-2 text-sm text-gray-400 text-center transition-opacity duration-300">
                Connect based on proximity and shared interests, not popularity
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Features</h2>
            <p className="text-xl text-gray-400">
              Everything you need for meaningful connections
            </p>
          </div>

          <div className="space-y-20">
            {/* Proximity Discovery */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6">Proximity Discovery</h3>
                <p className="text-lg text-gray-400 mb-6">
                  Find people within your immediate area. Perfect for networking at events, 
                  co-working spaces, or just discovering interesting people nearby.
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                    Real-time proximity detection
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                    Privacy-first location sharing
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                    Automatic connection expiry
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-gray-800 transform hover:translate-y-[-10px] transition-transform duration-500">
                <div className="aspect-square bg-gray-800 rounded-xl flex items-center justify-center">
                  <MapPinIcon className="w-16 h-16 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Unified Social Cards */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-2xl p-8 border border-gray-800 md:order-1 transform hover:translate-y-[-10px] transition-transform duration-500">
                <div className="aspect-square bg-gray-800 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="w-16 h-16 text-green-500" />
                </div>
              </div>
              <div className="md:order-2">
                <h3 className="text-3xl font-bold mb-6">Unified Social Cards</h3>
                <p className="text-lg text-gray-400 mb-6">
                  Connect all your social profiles in one place. Share your Instagram, 
                  LinkedIn, Twitter, and more with people you meet.
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                    Link multiple social accounts
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                    Verified social profiles
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                    One-tap sharing
                  </li>
                </ul>
              </div>
            </div>

            {/* Invisible Mode */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6">Invisible Mode</h3>
                <p className="text-lg text-gray-400 mb-6">
                  Sometimes you want to observe without being seen. Invisible mode lets you 
                  browse nearby people without appearing in their discovery feed.
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                    Browse anonymously
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                    Toggle visibility instantly
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                    Complete privacy control
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-purple-600/20 to-gray-600/20 rounded-2xl p-8 border border-gray-800 transform hover:translate-y-[-10px] transition-transform duration-500">
                <div className="aspect-square bg-gray-800 rounded-xl flex items-center justify-center">
                  <EyeSlashIcon className="w-16 h-16 text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-900/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">What People Say</h2>
            <p className="text-xl text-gray-400">
              Real feedback from real users
            </p>
          </div>

          <div className="relative">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center max-w-2xl mx-auto">
              <p className="text-lg text-gray-300 mb-6 italic">"Finally, a social app that connects me with real people in real places. No more endless scrolling through fake profiles."</p>
              <div>
                <p className="text-white font-semibold">Sarah Chen</p>
                <p className="text-gray-400 text-sm">Digital Nomad</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center items-center mt-8 gap-4">
              <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              <div className="flex gap-2">
                <button className="w-2 h-2 rounded-full bg-blue-500" />
                <button className="w-2 h-2 rounded-full bg-gray-600" />
                <button className="w-2 h-2 rounded-full bg-gray-600" />
              </div>

              <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Roadmap</h2>
            <p className="text-xl text-gray-400">
              What's coming next
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-700" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-4 h-4 rounded-full mb-3 bg-blue-500 animate-pulse" />
                <p className="text-sm text-white font-semibold">PWA Launch</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-4 h-4 rounded-full mb-3 bg-gray-600" />
                <p className="text-sm text-gray-400">Video Calls</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-4 h-4 rounded-full mb-3 bg-gray-600" />
                <p className="text-sm text-gray-400">Group Events</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-4 h-4 rounded-full mb-3 bg-gray-600" />
                <p className="text-sm text-gray-400">AI Matching</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to network face-to-face?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join thousands of people who are building real connections in the real world.
          </p>
          
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-xl rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
              <SparklesIcon className="w-6 h-6 mr-3" />
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400">
            © 2025 Zenlit. Built with Bolt.new
          </p>
        </div>
      </footer>
    </div>
  )
}