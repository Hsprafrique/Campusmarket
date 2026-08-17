import React from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowLeft, Tag, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { CATEGORIES } from "../components/NigerianCampuses";
import ChatButton from "../components/chat/ChatButton";
import { useAuth } from "@/lib/AuthContext";
import { useState } from "react";

const WA_ICON = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.528 5.855L.057 23.886a.75.75 0 00.919.953l6.184-1.622A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.718 9.718 0 01-4.953-1.354l-.355-.211-3.676.964.981-3.584-.232-.369A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
  </svg>
);

export default function ListingDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const listing = location.state?.listing;
  const [activeImg, setActiveImg] = useState(0);

  if (!listing) {
    navigate(createPageUrl("Browse"));
    return null;
  }

  const category = CATEGORIES.find(c => c.value === listing.category);
  const fmt = p => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(p);
  const images = listing.images?.length ? listing.images : ["https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600&h=400&fit=crop"];

  const handleWhatsApp = () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate(createPageUrl("Auth"));
      return;
    }
    const msg = encodeURIComponent(`Hi! I'm interested in "${listing.title}" on Campus Marketplace. Is it still available?`);
    const phone = listing.whatsapp_number?.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--brand-cream)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back
        </button>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">

          {/* Images */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3] mb-3">
              <img src={images[activeImg]} alt={listing.title} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-[var(--brand-gold)]' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {category && <Badge variant="secondary" className="text-xs">{category.icon} {category.label}</Badge>}
              {listing.is_featured && <Badge className="text-xs text-white" style={{ background: 'var(--brand-gold)' }}>★ Featured</Badge>}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: 'var(--brand-navy)' }}>{listing.title}</h1>

            <p className="text-3xl font-black mb-4" style={{ color: 'var(--brand-gold)' }}>{fmt(listing.price)}</p>

            <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{listing.campus}</span>
            </div>

            {listing.description && (
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Description</p>
                <p className="text-gray-600 text-sm leading-relaxed">{listing.description}</p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4 mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Seller</p>
              <p className="font-semibold text-sm" style={{ color: 'var(--brand-navy)' }}>{listing.seller_name}</p>
            </div>

            {listing.expires_at && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
                <Clock className="w-3.5 h-3.5" />
                Listed until {new Date(listing.expires_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            )}

            {/* Contact buttons */}
            <div className="flex gap-3">
              <div className="flex-1">
                <ChatButton listing={listing} size="default" className="w-full h-11" />
              </div>
              {listing.whatsapp_number && (
                <Button onClick={handleWhatsApp} className="flex-1 h-11 gap-2 text-white" style={{ background: '#25D366' }}>
                  <WA_ICON />WhatsApp
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
