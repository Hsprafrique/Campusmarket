import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { CATEGORIES } from "../NigerianCampuses";
import { ArrowRight } from "lucide-react";

const categoryImages = {
  food_drinks: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop",
  services: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=300&h=200&fit=crop",
  electronics: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300&h=200&fit=crop",
  books: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop",
  fashion: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop",
  accommodation: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=200&fit=crop",
  transportation: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=300&h=200&fit=crop",
  other: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=300&h=200&fit=crop"
};

export default function CategoriesSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--brand-gold)' }}>Categories</p>
            <h2 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--brand-navy)' }}>Browse by Category</h2>
          </div>
          <Link to={createPageUrl("Browse")} className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div key={cat.value} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link to={`${createPageUrl("Browse")}?category=${cat.value}`}
                className="group block relative overflow-hidden rounded-xl aspect-[4/3] bg-gray-100">
                <img src={categoryImages[cat.value]} alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(212,168,67,0.15)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="text-xl block mb-0.5">{cat.icon}</span>
                  <h3 className="text-white font-semibold text-xs sm:text-sm leading-tight">{cat.label.split(' (')[0]}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
