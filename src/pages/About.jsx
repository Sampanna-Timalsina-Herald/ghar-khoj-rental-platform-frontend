import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, Target, Zap, Award, TrendingUp, HeartHandshake,
  MapPin, Mail, Phone, Linkedin, Twitter, Globe,
  CheckCircle, ArrowRight, Star
} from "lucide-react";
import SmartNav from "../components/SmartNav";
import gharkhojLogo from "../assets/GHARKHOJ_LOGO.png";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const floatingVariants = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const scaleVariants = {
  whileHover: { scale: 1.05 },
};

// Stats Component
const StatCard = ({ number, label, icon: Icon }) => (
  <motion.div
    whileHover={{ scale: 1.08, y: -8 }}
    className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center"
  >
    <motion.div animate={floatingVariants} className="flex justify-center mb-4">
      <div className="p-4 bg-gradient-to-br from-blue-100 to-yellow-100 rounded-full">
        <Icon size={32} className="text-blue-600" />
      </div>
    </motion.div>
    <h3 className="text-4xl font-extrabold text-blue-600 mb-2">{number}</h3>
    <p className="text-gray-600 font-semibold">{label}</p>
  </motion.div>
);

// Team Member Card
const TeamMember = ({ name, role, image, bio, social }) => (
  <motion.div
    whileHover={{ y: -12 }}
    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
  >
    <div className="relative h-64 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
      <motion.div
        animate={floatingVariants}
        className="text-white text-center"
      >
        <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center text-5xl font-bold text-blue-600">
          {image}
        </div>
      </motion.div>
    </div>
    <div className="p-6">
      <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
      <p className="text-blue-600 font-semibold mb-3">{role}</p>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{bio}</p>
      <div className="flex gap-3">
        {social.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            {link.icon}
          </a>
        ))}
      </div>
    </div>
  </motion.div>
);

// Value Card
const ValueCard = ({ icon: Icon, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -8 }}
    className="bg-gradient-to-br from-blue-50 to-yellow-50 p-8 rounded-2xl border border-blue-100 hover:border-blue-300 transition-all"
  >
    <motion.div
      animate={floatingVariants}
      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-yellow-400 rounded-full flex items-center justify-center mb-4 shadow-lg"
    >
      <Icon size={32} className="text-white" />
    </motion.div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-700 leading-relaxed">{description}</p>
  </motion.div>
);

// Main About Page Component
const About = () => {
  const [activeTab, setActiveTab] = useState("mission");

  const stats = [
    { number: "50K+", label: "Active Users", icon: Users },
    { number: "5K+", label: "Properties Listed", icon: Globe },
    { number: "15K+", label: "Successful Rentals", icon: Award },
    { number: "99.8%", label: "Satisfaction Rate", icon: Star },
  ];

  const values = [
    {
      icon: Target,
      title: "Transparent & Honest",
      description: "We believe in complete transparency. No hidden fees, no surprises—just honest, straightforward property listings.",
    },
    {
      icon: Zap,
      title: "Innovation First",
      description: "We continuously innovate to bring the best technology and user experience to Nepal's rental market.",
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "Our platform connects landlords and tenants fairly, building a stronger rental community in Kathmandu Valley.",
    },
    {
      icon: HeartHandshake,
      title: "Trust & Security",
      description: "User trust is our foundation. We verify all listings and protect both parties with secure transactions.",
    },
  ];

  const teamMembers = [
    {
      name: "Sampanna Timalsina",
      role: "Founder & CEO",
      image: "ST",
      bio: "Visionary leader with 10+ years in real estate technology. Passionate about transforming Nepal's rental market through innovation and transparency.",
      social: [
        { url: "https://linkedin.com", icon: <Linkedin size={20} /> },
        { url: "https://twitter.com", icon: <Twitter size={20} /> },
      ],
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans">
      <SmartNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[50rem] h-[50rem] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[50rem] h-[50rem] bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block py-2 px-4 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mb-4"
            >
              About Gharkhoj
            </motion.span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
              Transforming <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500">Nepal's Rental Market</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
              We're on a mission to make finding and listing properties in Kathmandu Valley simple, transparent, and trustworthy. 
              Built by renters, for renters and landlords alike.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 mb-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <StatCard number={stat.number} label={stat.label} icon={stat.icon} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Mission & Vision Section */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Mission & Vision Tabs */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              {/* Tab Buttons */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setActiveTab("mission")}
                  className={`px-6 py-3 rounded-lg font-bold transition-all ${
                    activeTab === "mission"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  Our Mission
                </button>
                <button
                  onClick={() => setActiveTab("vision")}
                  className={`px-6 py-3 rounded-lg font-bold transition-all ${
                    activeTab === "vision"
                      ? "bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-400/30"
                      : "bg-white text-gray-700 border-2 border-gray-200 hover:border-yellow-300"
                  }`}
                >
                  Our Vision
                </button>
              </div>

              {/* Tab Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {activeTab === "mission" ? (
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-gray-900">Our Mission</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      To create a transparent, user-friendly platform that connects landlords and tenants 
                      across Nepal. We eliminate intermediaries and hidden fees, making the rental process 
                      faster, safer, and more reliable.
                    </p>
                    <ul className="space-y-3 mt-6">
                      {[
                        "Verify all property listings with detailed information",
                        "Provide secure communication channels",
                        "Enable transparent rental agreements",
                        "Build trust through technology",
                      ].map((item, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-3 text-gray-700"
                        >
                          <CheckCircle size={24} className="text-green-500 flex-shrink-0" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-gray-900">Our Vision</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      To become South Asia's most trusted rental platform, powering millions of successful 
                      home searches across Nepal, India, and beyond. We envision a future where finding 
                      the perfect home is simple, transparent, and accessible to everyone.
                    </p>
                    <ul className="space-y-3 mt-6">
                      {[
                        "Expand to all major cities across Nepal",
                        "Launch AI-powered property matching",
                        "Create verified landlord & tenant networks",
                        "Enable seamless international rental listings",
                      ].map((item, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-3 text-gray-700"
                        >
                          <TrendingUp size={24} className="text-blue-600 flex-shrink-0" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Image */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <motion.div
              animate={floatingVariants}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-12 text-white shadow-2xl"
            >
              <h3 className="text-3xl font-bold mb-6">Why Choose Gharkhoj?</h3>
              <ul className="space-y-4">
                {[
                  "✨ AI-Powered Recommendations",
                  "🔐 Secure Rental Agreements",
                  "💬 Real-time Landlord Communication",
                  "📊 Verified Property Database",
                  "⚡ Instant Notifications",
                  "🏆 Award-Winning Platform",
                ].map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="text-lg"
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Our Core Values</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            These principles guide every decision we make and every feature we build.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {values.map((value, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <ValueCard icon={value.icon} title={value.title} description={value.description} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Meet Our Founder</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The visionary leader behind Gharkhoj's mission to transform Nepal's rental market.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-6 max-w-2xl mx-auto"
        >
          {teamMembers.map((member, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <TeamMember {...member} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 md:p-16 text-white shadow-2xl overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Join Our Community Today</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Whether you're looking for a home to rent or want to list your property, 
              Gharkhoj is here to make the process smooth and transparent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/search"
                  className="px-8 py-3 bg-yellow-400 text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-500 transition shadow-lg inline-flex items-center gap-2"
                >
                  Search Properties <ArrowRight size={20} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/list-property"
                  className="px-8 py-3 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-blue-50 transition shadow-lg inline-flex items-center gap-2"
                >
                  List Your Property <ArrowRight size={20} />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Get In Touch</h2>
          <p className="text-xl text-gray-600">Have questions? We'd love to hear from you.</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: Mail,
              title: "Email",
              content: "support@gharkhoj.com",
              link: "mailto:support@gharkhoj.com",
            },
            {
              icon: Phone,
              title: "Phone",
              content: "+977-1-4123456",
              link: "tel:+977-1-4123456",
            },
            {
              icon: MapPin,
              title: "Address",
              content: "Kathmandu, Nepal",
              link: "#",
            },
          ].map((contact, idx) => {
            const Icon = contact.icon;
            return (
              <motion.a
                key={idx}
                variants={itemVariants}
                href={contact.link}
                whileHover={{ scale: 1.05, y: -8 }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-yellow-100 rounded-full">
                    <Icon size={32} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{contact.title}</h3>
                <p className="text-blue-600 font-semibold hover:text-blue-700 transition">{contact.content}</p>
              </motion.a>
            );
          })}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link to="/">
              <img src={gharkhojLogo} alt="Gharkhoj" className="h-20 w-auto object-contain mx-auto mb-2" />
            </Link>
            <p className="text-sm mb-6">Transforming Nepal's Rental Market</p>
            <div className="border-t border-gray-800 pt-6 mt-6">
              <p className="text-sm">&copy; 2025 Gharkhoj. All rights reserved. | Built with ❤️ in Kathmandu</p>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default About;
