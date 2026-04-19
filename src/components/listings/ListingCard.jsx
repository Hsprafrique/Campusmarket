import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, MessageCircle } from "lucide-react";
import { CATEGORIES } from "../NigerianCampuses";
import ChatButton from "../chat/ChatButton";

export default function ListingCard({ listing }) {
  const category = CATEGORIES.find(c => c.value === listing.category);
  
  const defaultImage = "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&h=300&fit=crop";
  const imageUrl = listing.images?.[0] || defaultImage;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    const message = encodeURIComponent(
      `Hi! I'm interested in your listing "${listing.title}" on Campus Marketplace. Is it still available?`
    );
    const phone = listing.whatsapp_number?.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { e.target.src = defaultImage; }}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm">
            {category?.icon} {category?.label?.split(' ')[0]}
          </Badge>
          {listing.is_featured && (
            <Badge className="bg-gradient-to-r from-orange-500 to-purple-600 text-white backdrop-blur-sm">
              ⭐ Featured
            </Badge>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
          {listing.title}
        </h3>
        
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin className="w-3 h-3" />
          <span className="line-clamp-1">{listing.campus}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-purple-600">
            {formatPrice(listing.price)}
          </p>
          
          <div className="flex gap-1">
            <ChatButton listing={listing} size="sm" />
          </div>
        </div>
      </div>
    </Card>
  );
}