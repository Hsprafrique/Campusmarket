import React from 'react';
import { motion } from "framer-motion";
import { UserPlus, Search, MessageCircle, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your account with your matric number and select your campus",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: Search,
    title: "Browse or List",
    description: "Search for items on your campus or list your own products/services",
    color: "bg-orange-100 text-orange-600"
  },
  {
    icon: MessageCircle,
    title: "Connect via WhatsApp",
    description: "Chat directly with sellers or buyers through WhatsApp",
    color: "bg-green-100 text-green-600"
  },
  {
    icon: ShieldCheck,
    title: "Complete Transaction",
    description: "Meet on campus and complete your safe transaction",
    color: "bg-blue-100 text-blue-600"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get started in minutes and connect with thousands of students across Nigeria
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-300 to-orange-300" />
              )}
              
              <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-4 mx-auto`}>
                  <step.icon className="w-8 h-8" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center text-sm">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}