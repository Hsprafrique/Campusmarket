import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import ListingCard from "../listings/ListingCard";

export default function FeaturedListings({ listings = [] }) {
  return (
    <section className="py-16 sm:py-20" style={{ background: 'var(--brand-cream)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--brand-gold)' }}>Marketplace</p>
            <h2 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--brand-navy)' }}>Latest Listings</h2>
          </div>
          <Link to={createPageUrl("Browse")} className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-6 text-sm">Be the first to list something on Campus Marketplace!</p>
            <Link to={createPageUrl("Auth")}>
              <Button className="text-white" style={{ background: 'var(--brand-navy)' }}>
                Start Selling <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile: 2 cols, Tablet: 3 cols, Desktop: 4-5 cols */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {listings.slice(0, 10).map((listing, i) => (
                <motion.div key={listing.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to={createPageUrl("Browse")}>
                <Button variant="outline" className="border-gray-200 text-sm font-medium px-8 hover:border-gray-300">
                  Browse All Listings <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
