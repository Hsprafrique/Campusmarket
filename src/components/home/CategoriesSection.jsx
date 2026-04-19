import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { CATEGORIES } from "../NigerianCampuses";

export default function CategoriesSection() {
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

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find exactly what you need from thousands of listings across Nigerian campuses
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((category, index) => (
            <motion.div
              key={category.value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={`${createPageUrl("Browse")}?category=${category.value}`}
                className="group block relative overflow-hidden rounded-2xl aspect-[4/3] shadow-lg"
              >
                <img 
                  src={categoryImages[category.value]}
                  alt={category.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-3xl mb-2 block">{category.icon}</span>
                  <h3 className="text-white font-semibold text-lg">{category.label.split(' (')[0]}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}