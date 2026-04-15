import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ListingCard from "../listings/ListingCard";

export default function FeaturedListings({ listings = [] }) {
  if (listings.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Featured Listings
            </h2>
            <p className="text-gray-600 mb-8">
              Be the first to list something on Campus Marketplace!
            </p>
            <Link to={createPageUrl("CreateListing")}>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Create First Listing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Featured Listings
            </h2>
            <p className="text-gray-600">
              Check out what's popular on campus right now
            </p>
          </div>
          <Link to={createPageUrl("Browse")}>
            <Button variant="outline" className="hidden sm:flex">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.slice(0, 8).map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <ListingCard listing={listing} />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link to={createPageUrl("Browse")}>
            <Button variant="outline">
              View All Listings
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}