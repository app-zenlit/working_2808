'use client'

import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { 
  ArrowDownIcon, 
  MapPinIcon, 
  UserGroupIcon, 
  ChatBubbleLeftIcon,
  EyeSlashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline'
import { Button } from '../../components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return <span>{count}{suffix}</span>
}

// Floating Particles Background
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-500/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  )
}

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  delay?: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 text-center group hover:border-blue-500/50 transition-all duration-300"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500 transition-colors"
      >
        <Icon className="w-8 h-8 text-white" />
      </motion.div>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  )
}

// Why ZenLit Tile Component
const WhyTile = ({ title, description, delay = 0 }: {
  title: string
  description: string
  delay?: number
}) => {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center hover:border-green-500/50 transition-all duration-300 cursor-pointer">
        <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
        <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto" />
      </div>
      
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 whitespace-nowrap z-10"
          >
            {description}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Testimonial Component
const TestimonialCard = ({ quote, author, role }: {
  quote: string
  author: string
  role: string
}) => {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center max-w-2xl mx-auto">
      <p className="text-lg text-gray-300 mb-6 italic">"{quote}"</p>
      <div>
        <p className="text-white font-semibold">{author}</p>
        <p className="text-gray-400 text-sm">{role}</p>
      </div>
    </div>
  )
}

// Roadmap Milestone Component
const RoadmapMilestone = ({ title, status, isActive = false }: {
  title: string
  status: 'completed' | 'current' | 'upcoming'
  isActive?: boolean
}) => {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className={`w-4 h-4 rounded-full mb-3 ${
          status === 'completed' ? 'bg-green-500' :
          status === 'current' ? 'bg-blue-500' : 'bg-gray-600'
        }`}
      />
      <p className={`text-sm ${
        status === 'current' ? 'text-white font-semibold' : 'text-gray-400'
      }`}>
        {title}
      </p>
    </div>
  )
}

export default function LandingPage() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 50])
  const y2 = useTransform(scrollY, [0, 300], [0, -50])
  
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  
  const testimonials = [
    {
      quote: "Finally, a social app that connects me with real people in real places. No more endless scrolling through fake profiles.",
      author: "Sarah Chen",
      role: "Digital Nomad"
    },
    {
      quote: "ZenLit helped me find my co-founder at a coffee shop. Sometimes the best connections happen when you least expect them.",
      author: "Marcus Rodriguez",
      role: "Startup Founder"
    },
    {
      quote: "I love how it respects my privacy while still helping me network. It's social media without the social anxiety.",
      author: "Dr. Emily Watson",
      role: "Researcher"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -100 // Adjust this value based on your header height
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const handleInstallPWA = () => {
    // This would trigger PWA install prompt
    console.log('Install PWA clicked')
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="Zenlit Logo" 
                width={32} 
                height={32} 
                className="mr-2"
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
        <FloatingParticles />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-6">
              <Image 
                src="/logo.png" 
                alt="Zenlit Logo" 
                width={80} 
                height={80} 
                className="mr-3"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Zenlit
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Real-World Networking. Reinvented.
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Connect with people around you without the noise. No followers, no likes, just genuine human connections.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={handleInstallPWA}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              Install PWA
            </Button>
            <Button
              onClick={() => scrollToSection('how-it-works')}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg rounded-xl transition-all duration-300"
            >
              Learn More
              <ArrowDownIcon className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
        

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ArrowDownIcon className="w-6 h-6 text-gray-400" />
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Three simple steps to meaningful connections
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={MapPinIcon}
              title="One-Time Location Ping"
              description="Share your location once to discover people nearby. Your exact location stays private."
              delay={0}
            />
            <FeatureCard
              icon={UserGroupIcon}
              title="Proximity Profiles"
              description="See curated profiles of people in your area. No endless scrolling, just relevant connections."
              delay={0.2}
            />
            <FeatureCard
              icon={ChatBubbleLeftIcon}
              title="Instant Chat"
              description="Start conversations with people nearby. When you move apart, the connection naturally fades."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Why ZenLit Section */}
      <section className="py-20 px-4 bg-gray-900/20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why ZenLit?</h2>
            <p className="text-xl text-gray-400">
              Social networking without the social pressure
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <WhyTile
              title="No Follower Counts"
              description="Focus on quality connections, not vanity metrics"
              delay={0}
            />
            <WhyTile
              title="No Filters"
              description="Authentic profiles, real people, genuine interactions"
              delay={0.2}
            />
            <WhyTile
              title="No Likes"
              description="Connect based on proximity and shared interests, not popularity"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Features</h2>
            <p className="text-xl text-gray-400">
              Everything you need for meaningful connections
            </p>
          </motion.div>

          <div className="space-y-20">
            {/* Proximity Discovery */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div style={{ y: y1 }}>
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
              </motion.div>
              <motion.div
                style={{ y: y2 }}
                className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-gray-800"
              >
                <div className="aspect-square bg-gray-800 rounded-xl flex items-center justify-center">
                  <MapPinIcon className="w-16 h-16 text-blue-500" />
                </div>
              </motion.div>
            </div>

            {/* Unified Social Cards */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                style={{ y: y1 }}
                className="bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-2xl p-8 border border-gray-800 md:order-1"
              >
                <div className="aspect-square bg-gray-800 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="w-16 h-16 text-green-500" />
                </div>
              </motion.div>
              <motion.div style={{ y: y2 }} className="md:order-2">
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
              </motion.div>
            </div>

            {/* Invisible Mode */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div style={{ y: y1 }}>
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
              </motion.div>
              <motion.div
                style={{ y: y2 }}
                className="bg-gradient-to-br from-purple-600/20 to-gray-600/20 rounded-2xl p-8 border border-gray-800"
              >
                <div className="aspect-square bg-gray-800 rounded-xl flex items-center justify-center">
                  <EyeSlashIcon className="w-16 h-16 text-purple-500" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-900/20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">What People Say</h2>
            <p className="text-xl text-gray-400">
              Real feedback from real users
            </p>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <TestimonialCard {...testimonials[currentTestimonial]} />
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-center items-center mt-8 gap-4">
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentTestimonial ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Roadmap</h2>
            <p className="text-xl text-gray-400">
              What's coming next
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-700" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative">
              <RoadmapMilestone
                title="PWA Launch"
                status="current"
                isActive={true}
              />
              <RoadmapMilestone
                title="Video Calls"
                status="upcoming"
              />
              <RoadmapMilestone
                title="Group Events"
                status="upcoming"
              />
              <RoadmapMilestone
                title="AI Matching"
                status="upcoming"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 mb-0">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to network face-to-face?
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Join thousands of people who are building real connections in the real world.
            </p>
            
            <Button
              onClick={handleInstallPWA}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-xl rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
            >
              <SparklesIcon className="w-6 h-6 mr-3" />
              Install PWA
            </Button>
          </motion.div>          
        </div>
      </section>
      
      {/* How We Built It Section */}
      <section className="py-20 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How We Built Zenlit</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From zero code to live in 15 days—here's our story.
            </p>
          </motion.div>
          
          <div className="space-y-6">
            {[
              "Built entirely in Bolt.new + Codex with 0 lines of custom code",
              "Integrated Supabase via ChatGPT SQL prompts to create our backend database",
              "Crafted the landing page and PWA manifest entirely within Bolt",
              "Deployed seamlessly to Vercel for instant global access"
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start bg-gray-900/30 border border-gray-800 rounded-xl p-5 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-gray-300">{item}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <a 
              href="#build-details"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('build-details')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>Read the full build story</span>
              <span className="ml-1">→</span>
            </a>
          </div>
          
          <div className="mt-16 flex justify-center">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center">
              <CodeBracketIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Build Details Section (Target for scroll) */}
      <section id="build-details" className="py-20 px-4 bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-6">The Build Process</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Our journey from concept to production in just over two weeks.
            </p>
          </motion.div>
          
          <div className="space-y-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Week 1: Foundation</h3>
              <p className="text-gray-400">
                We started with a simple concept: create a proximity-based social network that respects privacy.
                Using Bolt.new, we rapidly prototyped the core UI components and established our Supabase database schema.
              </p>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Week 2: Features & Polish</h3>
              <p className="text-gray-400">
                With the foundation in place, we implemented the core features: location-based discovery,
                real-time messaging, and social verification. The PWA manifest was created to enable
                installation on mobile devices.
              </p>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Week 3: Launch</h3>
              <p className="text-gray-400">
                After thorough testing and optimization, we deployed to Vercel and launched our beta.
                The entire process was streamlined by using Bolt.new's integrated development environment.
              </p>
            </div>
          </div>
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