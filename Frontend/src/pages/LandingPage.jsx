import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("donor");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const organizationActions = [
    {
      id: 1,
      icon: "📝",
      title: "New Registration",
      tagline: "First Time Here?",
      description: "Register your Hospital, Blood Bank, or NGO with complete verification",
      action: "Start Registration",
      path: "/organization-registration",
      features: ["Quick 5-min Setup", "Instant Code", "Secure Verification"]
    },
    {
      id: 2,
      icon: "📊",
      title: "Check Status",
      tagline: "Track Application",
      description: "Monitor your registration status in real-time with your organization code",
      action: "View Status",
      path: "/registration-status",
      features: ["Real-time Updates", "Email Alerts", "24-48hr Review"]
    },
    {
      id: 3,
      icon: "🔐",
      title: "Organization Login",
      tagline: "Access Dashboard",
      description: "Login to your comprehensive dashboard with management tools",
      action: "Sign In",
      path: "/login",
      features: ["Full Dashboard", "Analytics", "Inventory"]
    },
    {
      id: 4,
      icon: "👑",
      title: "Superadmin Access",
      tagline: "Admin Control",
      description: "Manage and verify organizations with powerful admin tools",
      action: "Admin Login",
      path: "/superadmin-login",
      features: ["System Control", "Verification", "Analytics"]
    }
  ];

  const stats = [
    { value: "10M+", label: "Lives Saved", icon: "❤️" },
    { value: "50K+", label: "Active Donors", icon: "🩸" },
    { value: "1000+", label: "Organizations", icon: "🏢" },
    { value: "5M+", label: "Blood Units", icon: "💉" }
  ];

  const features = [
    {
      icon: "🎯",
      title: "Smart Matching",
      description: "AI-powered system matches donors with urgent requests instantly"
    },
    {
      icon: "📱",
      title: "Mobile First",
      description: "Fully responsive design works seamlessly on any device"
    },
    {
      icon: "🔔",
      title: "Instant Alerts",
      description: "Get notified immediately when blood is needed nearby"
    },
    {
      icon: "🔒",
      title: "Secure & Private",
      description: "Bank-grade encryption protects your sensitive data"
    },
    {
      icon: "📊",
      title: "Analytics",
      description: "Comprehensive insights for better decision making"
    },
    {
      icon: "🌍",
      title: "Nationwide Network",
      description: "Connected with hospitals and blood banks across India"
    }
  ];

  const organizationTypes = [
    {
      icon: "🏥",
      title: "Hospitals",
      count: "500+",
      description: "Request blood, manage patients, track emergencies"
    },
    {
      icon: "🅱️",
      title: "Blood Banks",
      count: "300+",
      description: "Manage inventory, track donations, distribute units"
    },
    {
      icon: "❤️",
      title: "NGOs",
      count: "200+",
      description: "Organize camps, manage volunteers, coordinate"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Priya Sharma",
      role: "Chief Medical Officer, City Hospital",
      image: "👩‍⚕️",
      text: "BloodLink has revolutionized how we manage blood requests. Emergency response time reduced by 60%."
    },
    {
      name: "Rahul Verma",
      role: "Regular Blood Donor",
      image: "🧑",
      text: "Being a donor has never been easier. The app keeps me informed and motivated to save lives."
    },
    {
      name: "Anjali Patel",
      role: "NGO Coordinator",
      image: "👩",
      text: "Organizing blood donation camps is now effortless. Everything from registration to follow-ups handled."
    }
  ];

  const processSteps = [
    {
      number: "01",
      icon: "📝",
      title: "Sign Up",
      description: "Register as a donor or organization in minutes with simple forms"
    },
    {
      number: "02",
      icon: "✅",
      title: "Get Verified",
      description: "Quick verification process ensures trust and authenticity"
    },
    {
      number: "03",
      icon: "🔔",
      title: "Get Notified",
      description: "Receive alerts for blood requests matching your profile"
    },
    {
      number: "04",
      icon: "❤️",
      title: "Save Lives",
      description: "Donate blood and track your life-saving impact"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white shadow-lg' : 'bg-white/95'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
              <div className="w-12 h-12 bg-gradient-to-br from-[#7C1515] to-[#5A0E0E] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-2xl">🩸</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#7C1515]">BloodLink</h1>
                <p className="text-xs text-gray-600">Save Lives Together</p>
              </div>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[#1F1F1F] hover:text-[#7C1515] transition-colors font-medium">Features</a>
              <a href="#organizations" className="text-[#1F1F1F] hover:text-[#7C1515] transition-colors font-medium">Organizations</a>
              <a href="#how-it-works" className="text-[#1F1F1F] hover:text-[#7C1515] transition-colors font-medium">How it Works</a>
              <a href="#testimonials" className="text-[#1F1F1F] hover:text-[#7C1515] transition-colors font-medium">Testimonials</a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2 text-[#7C1515] hover:text-[#5A0E0E] border-2 border-[#7C1515] rounded-lg hover:border-[#5A0E0E] transition-all font-semibold"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/donor-registration")}
                className="hidden sm:block px-5 py-2 bg-[#7C1515] hover:bg-[#5A0E0E] text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Donate Blood
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#F9F4F4]">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7C1515]/10 border border-[#7C1515]/20 mb-6">
              <span className="w-2 h-2 bg-[#7C1515] rounded-full animate-pulse"></span>
              <span className="text-sm text-[#7C1515] font-semibold">🚨 1,247 lives saved this week</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-[#1F1F1F]">
              Every Donation
              <br />
              <span className="text-[#7C1515]">Saves Three Lives</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join India's largest blood donation network connecting donors, hospitals, blood banks, and NGOs. 
              Together, we're making healthcare accessible to everyone.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => navigate("/donor-registration")}
                className="px-10 py-4 bg-[#7C1515] hover:bg-[#5A0E0E] text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🩸 Become a Donor
              </button>
              <button
                onClick={() => navigate("/organization-registration")}
                className="px-10 py-4 bg-white hover:bg-gray-50 text-[#7C1515] border-2 border-[#7C1515] rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
              >
                🏥 Register Organization
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-[#7C1515] hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-[#7C1515] mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organization Actions Section */}
      <section id="organizations" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-[#1F1F1F]">
              For <span className="text-[#7C1515]">Organizations</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Hospitals, Blood Banks, and NGOs - Choose your action to get started with our comprehensive platform
            </p>
          </div>

          {/* Organization Types */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            {organizationTypes.map((org, index) => (
              <div
                key={index}
                className="bg-[#F9F4F4] border-2 border-gray-200 rounded-xl p-6 hover:border-[#7C1515] hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{org.icon}</div>
                <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">{org.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{org.description}</p>
                <div className="text-[#7C1515] font-bold text-lg">{org.count}</div>
              </div>
            ))}
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {organizationActions.map((card) => (
              <div
                key={card.id}
                className="group bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-[#7C1515] hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7C1515] to-[#5A0E0E] flex items-center justify-center text-3xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>

                {/* Tagline */}
                <p className="text-gray-500 text-xs mb-1">{card.tagline}</p>
                
                {/* Title */}
                <h3 className="text-lg font-bold text-[#7C1515] mb-3">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {card.description}
                </p>

                {/* Features */}
                <div className="space-y-1.5 mb-4">
                  {card.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-4 h-4 rounded-full bg-[#7C1515] flex items-center justify-center text-white text-[10px] flex-shrink-0">
                        ✓
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <button
                  onClick={() => navigate(card.path)}
                  className="w-full px-5 py-3 bg-[#7C1515] hover:bg-[#5A0E0E] text-white rounded-lg font-bold text-sm transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  {card.action}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F9F4F4]">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-[#1F1F1F]">
              Why Choose <span className="text-[#7C1515]">BloodLink?</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Built with cutting-edge technology for seamless blood donation management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#7C1515] hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#1F1F1F] mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-[#1F1F1F]">
              How It <span className="text-[#7C1515]">Works</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Simple steps to start saving lives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connection Line */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-[#7C1515] to-gray-300 -z-10"></div>
                )}
                
                <div className="bg-[#F9F4F4] border-2 border-gray-200 rounded-2xl p-6 hover:border-[#7C1515] hover:shadow-lg transition-all duration-300 h-full group cursor-pointer">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7C1515] to-[#5A0E0E] flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    {step.number}
                  </div>
                  <div className="text-5xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-bold text-[#1F1F1F] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F9F4F4]">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-[#1F1F1F]">
              What Our <span className="text-[#7C1515]">Community</span> Says
            </h2>
            <p className="text-gray-600 text-lg">
              Real stories from real heroes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#7C1515] hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl">{testimonial.image}</div>
                  <div>
                    <h4 className="text-[#1F1F1F] font-bold">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic leading-relaxed mb-4">
                  "{testimonial.text}"
                </p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">⭐</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#7C1515] to-[#5A0E0E]">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
            Ready to Make a Difference?
          </h2>
          <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto">
            Join our community of life-savers. Whether you're a donor or an organization, 
            you can make an impact today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate("/donor-registration")}
              className="px-10 py-4 bg-white text-[#7C1515] rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:scale-105"
            >
              🩸 Donate Blood
            </button>
            <button
              onClick={() => navigate("/organization-registration")}
              className="px-10 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all shadow-2xl"
            >
              🏥 Register Organization
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-white/20">
            <div className="flex items-center gap-2 text-white text-sm">
              <span className="text-green-400 text-xl">✓</span>
              Government Approved
            </div>
            <div className="flex items-center gap-2 text-white text-sm">
              <span className="text-green-400 text-xl">✓</span>
              HIPAA Compliant
            </div>
            <div className="flex items-center gap-2 text-white text-sm">
              <span className="text-green-400 text-xl">✓</span>
              24/7 Support
            </div>
            <div className="flex items-center gap-2 text-white text-sm">
              <span className="text-green-400 text-xl">✓</span>
              Trusted by Millions
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1F1F1F] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#7C1515] to-[#5A0E0E] rounded-xl flex items-center justify-center">
                  <span className="text-xl">🩸</span>
                </div>
                <span className="text-xl font-bold text-white">BloodLink</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                India's largest blood donation network. Connecting lives, one donation at a time.
              </p>
              <div className="flex gap-3">
                <a href="#" className="text-gray-400 hover:text-[#7C1515] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#7C1515] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#7C1515] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => navigate("/")} className="text-gray-400 hover:text-[#7C1515] transition-colors text-sm">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/donor-registration")} className="text-gray-400 hover:text-[#7C1515] transition-colors text-sm">
                    Become a Donor
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/organization-registration")} className="text-gray-400 hover:text-[#7C1515] transition-colors text-sm">
                    Register Organization
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/login")} className="text-gray-400 hover:text-[#7C1515] transition-colors text-sm">
                    Login
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#7C1515] transition-colors text-sm">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#7C1515] transition-colors text-sm">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#7C1515] transition-colors text-sm">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#7C1515] transition-colors text-sm">
                    Emergency
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#7C1515] transition-colors text-sm">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#7C1515] transition-colors text-sm">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#7C1515] transition-colors text-sm">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#7C1515] transition-colors text-sm">
                    Compliance
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 BloodLink. All rights reserved. Saving lives, one donation at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
