import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { listings } from "@/api/supabaseApi";
import HeroSection from "../components/home/HeroSection";
import CategoriesSection from "../components/home/CategoriesSection";
import FeaturedListings from "../components/home/FeaturedListings";
import HowItWorks from "../components/home/HowItWorks";
import CTASection from "../components/home/CTASection";

export default function Home() {
  const { data: listingsData = [] } = useQuery({
    queryKey: ['featuredListings'],
    queryFn: () => listings.getFeatured(8),
  });

  return (
    <div>
      <HeroSection />
      <CategoriesSection />
      <FeaturedListings listings={listingsData} />
      <HowItWorks />
      <CTASection />
    </div>
  );
}
