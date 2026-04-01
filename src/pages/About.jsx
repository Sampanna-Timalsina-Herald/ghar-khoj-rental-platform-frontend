import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, Target, Zap, HeartHandshake,
  MapPin, Mail, Phone, ArrowRight, CheckCircle
} from "lucide-react";
import SmartNav from "../components/SmartNav";
import gharkhojLogo from "../assets/GHARKHOJ_LOGO.png";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Transparent",
      description: "No hidden fees, no surprises—just honest property listings.",
    },
    {
      icon: Zap,
      title: "Fast & Simple",
      description: "Find or list properties in minutes with our intuitive platform.",
    },
    {
      icon: Users,
      title: "Community First",
      description: "Building a stronger rental community in Kathmandu Valley.",
    },
    {
      icon: HeartHandshake,
      title: "Trustworthy",
      description: "Verified listings and secure transactions you can rely on.",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white font-sans">
      <SmartNav />

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6"
          >
            About <span className="text-blue-600">Gharkhoj</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            We're making property rental in Kathmandu Valley simple, transparent, and trustworthy.
          </motion.p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                To create a transparent platform that connects landlords and tenants across Nepal. 
                We eliminate middlemen and hidden fees, making renting faster and safer.
              </p>
              <ul className="space-y-3">
                {["Verified property listings", "Secure communication", "Transparent agreements"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle size={20} className="text-green-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-blue-600 text-white p-8 rounded-2xl"
            >
              <h3 className="text-2xl font-bold mb-4">Why Gharkhoj?</h3>
              <ul className="space-y-3">
                {[
                  "50K+ Active Users",
                  "5K+ Properties Listed",
                  "15K+ Successful Rentals",
                  "99% Satisfaction Rate"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-yellow-400">✓</span> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 text-center mb-12"
          >
            Our Values
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Meet the Founder</h2>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="w-24 h-24 bg-blue-600 text-white text-3xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">
                ST
              </div>
              <h3 className="text-xl font-bold text-gray-900">Sampanna Timalsina</h3>
              <p className="text-blue-600 font-medium mb-3">Founder & CEO</p>
              <p className="text-gray-600 text-sm max-w-md mx-auto">
                Passionate about transforming Nepal's rental market through technology and transparency.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Get In Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Mail, title: "Email", content: "support@gharkhoj.com" },
              { icon: Phone, title: "Phone", content: "+977-1-4123456" },
              { icon: MapPin, title: "Location", content: "Kathmandu, Nepal" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-xl text-center shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon size={24} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-blue-600">{item.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-blue-600 text-white p-10 rounded-2xl"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-blue-100 mb-6">
              Find your next home or list your property today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-full font-bold hover:bg-yellow-500 transition inline-flex items-center justify-center gap-2"
              >
                Search Properties <ArrowRight size={18} />
              </Link>
              <Link
                to="/list-property"
                className="px-6 py-3 bg-white text-blue-600 rounded-full font-bold hover:bg-blue-50 transition inline-flex items-center justify-center gap-2"
              >
                List Property <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Link to="/">
            <img src={gharkhojLogo} alt="Gharkhoj" className="h-16 w-auto object-contain mx-auto mb-3" />
          </Link>
          <p className="text-sm mb-4">Kathmandu's #1 Rental Platform</p>
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Gharkhoj. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
