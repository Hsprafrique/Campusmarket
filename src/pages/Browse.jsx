import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { listings } from "@/api/supabaseApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ListingCard from "../components/listings/ListingCard";
import { CATEGORIES, NIGERIAN_CAMPUSES } from "../components/NigerianCampuses";
import { Skeleton } from "@/components/ui/skeleton";

export default function Browse() {
  const urlParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(urlParams.get('search') || '');
  const [category, setCategory] = useState(urlParams.get('category') || 'all');
  const [campus, setCampus] = useState(urlParams.get('campus') || 'all');
  const [showFilters, setShowFilters] = useState(false);

  const { data: allListings = [], isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: () => listings.getBrowse(),
  });

  const filtered = allListings.filter(l => {
    const matchesSearch = !search ||
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || l.category === category;
    const matchesCampus = campus === 'all' || l.campus === campus;
    return matchesSearch && matchesCategory && matchesCampus;
  });

  const hasActiveFilters = search || category !== 'all' || campus !== 'all';
  const clearFilters = () => { setSearch(''); setCategory('all'); setCampus('all'); };

  return (
    <div className="min-h-screen" style={{ background: 'var(--brand-cream)' }}>

      {/* Header */}
      <div style={{ background: 'var(--brand-navy)' }} className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--brand-gold)' }}>Marketplace</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-6">Browse Listings</h1>
          </motion.div>

          {/* Search row */}
          <div className="flex gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search listings..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-10 h-11 bg-white border-0 text-sm rounded-xl focus-visible:ring-1" style={{ '--tw-ring-color': 'var(--brand-gold)' }} />
            </div>
            <Button onClick={() => setShowFilters(!showFilters)}
              className={`h-11 px-4 rounded-xl text-sm font-medium flex items-center gap-2 border-0 ${showFilters ? 'text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              style={showFilters ? { background: 'var(--brand-gold)', color: 'var(--brand-navy)' } : {}}>
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
            </Button>
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-3 grid sm:grid-cols-2 gap-3">
                  <Select value={campus} onValueChange={setCampus}>
                    <SelectTrigger className="h-11 bg-white/10 border-0 text-white text-sm rounded-xl">
                      <SelectValue placeholder="All Campuses" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="all">All Campuses</SelectItem>
                      {NIGERIAN_CAMPUSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-11 bg-white/10 border-0 text-white text-sm rounded-xl">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORIES.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.icon} {cat.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="mt-2 flex items-center gap-1.5 text-white/60 hover:text-white text-xs transition-colors">
                    <X className="w-3.5 h-3.5" />Clear filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <p className="text-sm text-gray-500 mb-5 font-medium">
          {isLoading ? 'Loading...' : `${filtered.length} listing${filtered.length !== 1 ? 's' : ''} found`}
          {hasActiveFilters && !isLoading && <button onClick={clearFilters} className="ml-3 text-xs underline text-gray-400 hover:text-gray-600">Clear filters</button>}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-7 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map(listing => (
                <motion.div key={listing.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Search className="w-10 h-10 text-gray-200 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No listings found</h3>
            <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters</p>
            {hasActiveFilters && <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs">Clear filters</Button>}
          </div>
        )}
      </div>
    </div>
  );
}
