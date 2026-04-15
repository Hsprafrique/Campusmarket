import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-xl text-white">Campus Marketplace</span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs mb-4">
              Nigeria's #1 campus marketplace connecting students to buy and sell goods and services safely within their universities.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>Serving 50+ Nigerian Campuses</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[{ name: "Home", page: "Home" }, { name: "Browse", page: "Browse" }, { name: "Pricing", page: "Pricing" }].map(link => (
                <li key={link.page}>
                  <Link to={createPageUrl(link.page)} className="text-gray-400 hover:text-purple-400 transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h4 className="font-semibold text-white mb-4">For Sellers</h4>
            <ul className="space-y-2 text-sm">
              {[{ name: "Create Listing", page: "CreateListing" }, { name: "My Listings", page: "MyListings" }, { name: "My Store", page: "MyStore" }, { name: "Feature a Listing", page: "FeatureListing" }].map(link => (
                <li key={link.page}>
                  <Link to={createPageUrl(link.page)} className="text-gray-400 hover:text-purple-400 transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Campus Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Built with ❤️ for Nigerian students</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
