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
  const [showFilters, setShowFilters] = useState(urlParams.get('campus') !== null);

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Browse Listings</h1>
          <p className="text-purple-200">Find what you need from students on your campus</p>
          <div className="mt-6">
            <Select value={campus} onValueChange={setCampus}>
              <SelectTrigger className="bg-white h-14 text-lg font-medium">
                <SelectValue placeholder="Select your campus first" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">All Campuses</SelectItem>
                {NIGERIAN_CAMPUSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input placeholder={campus === 'all' ? "Search all campuses..." : `Search in ${campus}...`}
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-12 h-12 bg-white border-0 text-lg" />
            </div>
            <Button variant="secondary" size="lg" onClick={() => setShowFilters(!showFilters)} className="h-12">
              <SlidersHorizontal className="w-5 h-5 mr-2" />More
            </Button>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-white text-sm mb-2 block">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="All Categories" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {CATEGORIES.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.icon} {cat.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {hasActiveFilters && (
                    <div className="flex items-end">
                      <Button variant="ghost" onClick={clearFilters} className="text-white"><X className="w-4 h-4 mr-2" />Clear</Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600 mb-6">{filtered.length} {filtered.length === 1 ? 'listing' : 'listings'} found</p>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-white shadow-md">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map(listing => (
                <motion.div key={listing.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search term</p>
            {hasActiveFilters && <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>}
          </div>
        )}
      </div>
    </div>
  );
}
