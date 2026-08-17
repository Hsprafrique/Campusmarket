import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Footer() {
  return (
    <footer style={{ background: 'var(--brand-navy)' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Campus Marketplace" className="h-10 w-10 rounded-xl object-cover" />
              <span className="font-bold text-lg">Campus<span style={{ color: 'var(--brand-gold)' }}>Market</span></span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">Nigeria's premier campus marketplace connecting students and sellers across 200+ universities.</p>
          </div>

          <div>
            <p className="font-semibold text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--brand-gold)' }}>Marketplace</p>
            <ul className="space-y-2.5">
              {[['Home', 'Home'], ['Browse', 'Browse'], ['Get a Store', 'Pricing']].map(([label, page]) => (
                <li key={page}><Link to={createPageUrl(page)} className="text-white/50 hover:text-white text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--brand-gold)' }}>Sellers</p>
            <ul className="space-y-2.5">
              {[['Post a Listing', 'CreateListing'], ['My Dashboard', 'MyListings'], ['My Store', 'MyStore']].map(([label, page]) => (
                <li key={page}><Link to={createPageUrl(page)} className="text-white/50 hover:text-white text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--brand-gold)' }}>Account</p>
            <ul className="space-y-2.5">
              {[['Sign In', 'Auth'], ['Sign Up', 'Auth'], ['Messages', 'Messages'], ['Profile', 'Profile']].map(([label, page]) => (
                <li key={label}><Link to={createPageUrl(page)} className="text-white/50 hover:text-white text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} Campus Marketplace A Product of HSPR Technologies. All rights reserved.</p>
          <p className="text-white/20 text-xs">Built with ❤️ for Nigerian students 🇳🇬</p>
        </div>
      </div>
    </footer>
  );
}
