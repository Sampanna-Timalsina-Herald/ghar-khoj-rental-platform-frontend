import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, Shield, Users, Zap, CheckCircle, Key, UploadCloud } from 'lucide-react';
import SmartNav from "../components/SmartNav";
import gharkhojLogo from "../assets/GHARKHOJ_LOGO.png";

const ListProperty = () => {
  const steps = [
    { icon: Key, title: "Create Account", desc: "Sign up as a Landlord" },
    { icon: UploadCloud, title: "Add Property", desc: "Upload photos & details" },
    { icon: CheckCircle, title: "Get Verified", desc: "We verify your listing" },
    { icon: Users, title: "Find Tenants", desc: "Connect with renters" },
  ];

  const features = [
    { icon: Users, title: "Verified Tenants", desc: "Pre-screened, reliable renters" },
    { icon: Zap, title: "Quick Listing", desc: "Go live in minutes" },
    { icon: DollarSign, title: "Better Returns", desc: "Maximize your rental income" },
    { icon: Shield, title: "Secure Process", desc: "Safe & transparent transactions" },
  ];

  return (
    <div className="w-full min-h-screen bg-white font-sans">
      <SmartNav />

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                List Your Property,<br />
                <span className="text-blue-600">Find Quality Tenants</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Kathmandu's most trusted platform for landlords. List for free, find verified tenants fast.
              </p>
              <Link
                to="/register?role=landlord"
                className="inline-flex items-center px-8 py-4 bg-yellow-400 text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-500 transition shadow-lg"
              >
                Start Listing Free
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div key={idx} className="p-4 bg-blue-50 rounded-xl text-center">
                        <Icon size={32} className="text-blue-600 mx-auto mb-2" />
                        <p className="font-semibold text-gray-900 text-sm">{feature.title}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid - Mobile */}
      <section className="py-12 bg-white md:hidden">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl text-center">
                  <Icon size={28} className="text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900 text-sm">{feature.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 text-center mb-12"
          >
            How It Works
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    {idx + 1}
                  </div>
                  <Icon size={28} className="text-blue-600 mx-auto mb-2" />
                  <h3 className="font-bold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why List on Gharkhoj?</h2>
              <ul className="space-y-4">
                {[
                  "Free to list your property",
                  "Reach thousands of verified tenants",
                  "Secure in-app messaging",
                  "Digital rental agreements",
                  "24/7 support for landlords"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-600 text-white p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4">Join 1000+ Landlords</h3>
              <p className="text-blue-100 mb-6">
                Our landlords rent properties 3x faster than traditional methods.
              </p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/10 p-4 rounded-xl">
                  <p className="text-3xl font-bold">5K+</p>
                  <p className="text-sm text-blue-200">Properties</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl">
                  <p className="text-3xl font-bold">15K+</p>
                  <p className="text-sm text-blue-200">Rentals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-yellow-400 p-10 rounded-2xl"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to Find Your Tenant?
            </h2>
            <p className="text-gray-800 mb-6">
              Join Gharkhoj today and list your property in minutes.
            </p>
            <Link
              to="/register?role=landlord"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-lg"
            >
              Register as Landlord
            </Link>
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

export default ListProperty;
