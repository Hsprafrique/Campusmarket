import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-purple-900 via-purple-800 to-orange-600 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Start selling today
          </span>
          
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            Ready to Make Money on Campus?
          </h2>
          
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of students already buying and selling on Campus Marketplace. 
            Your first listing is completely free!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("CreateListing")}>
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg">
                Start Selling Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to={createPageUrl("Pricing")}>
              <Button size="lg" className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-6 text-lg rounded-xl shadow-lg border-2 border-white/20">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}