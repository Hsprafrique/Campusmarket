import React from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, MessageCircle } from "lucide-react";
import { CATEGORIES } from "../NigerianCampuses";
import { useAuth } from "@/lib/AuthContext";
import { conversations as convsApi } from "@/api/supabaseApi";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const WA_ICON = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.528 5.855L.057 23.886a.75.75 0 00.919.953l6.184-1.622A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.718 9.718 0 01-4.953-1.354l-.355-.211-3.676.964.981-3.584-.232-.369A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
  </svg>
);

export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  const { rawUser, isAuthenticated, user } = useAuth();
  const category = CATEGORIES.find(c => c.value === listing.category);
  const [chatLoading, setChatLoading] = useState(false);
  const defaultImage = "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&h=300&fit=crop";
  const imageUrl = listing.images?.[0] || defaultImage;

  const fmt = p => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(p);

  const openDetail = () => {
    navigate(createPageUrl("ListingDetail"), { state: { listing } });
  };

  const handleChat = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
      navigate(createPageUrl("Auth"));
      return;
    }
    if (rawUser?.id === listing.seller_id) return;
    setChatLoading(true);
    try {
      let convo = await convsApi.getByListingAndBuyer(listing.id, rawUser.id);
      if (!convo) {
        convo = await convsApi.create({
          listing_id: listing.id,
          listing_title: listing.title,
          buyer_id: rawUser.id,
          buyer_email: user.email,
          buyer_name: user.full_name,
          seller_id: listing.seller_id,
          seller_email: listing.seller_email,
          seller_name: listing.seller_name,
          last_message: '',
          last_message_at: new Date().toISOString(),
          unread_buyer: 0,
          unread_seller: 0
        });
      }
      navigate(`${createPageUrl("Chat")}?conversation=${convo.id}`);
    } catch (err) {
      alert("Failed to start chat: " + err.message);
    }
    setChatLoading(false);
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
      navigate(createPageUrl("Auth"));
      return;
    }
    const msg = encodeURIComponent(`Hi! I'm interested in "${listing.title}" on Campus Marketplace. Is it still available?`);
    const phone = listing.whatsapp_number?.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div onClick={openDetail} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer">
      
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 flex-shrink-0">
        <img src={imageUrl} alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={e => { e.target.src = defaultImage; }} />
        {listing.is_featured && (
          <div className="absolute top-1.5 left-1.5">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: 'var(--brand-gold)' }}>★ Featured</span>
          </div>
        )}
        {category && (
          <div className="absolute bottom-1.5 left-1.5">
            <span className="text-[10px] font-medium bg-white/90 backdrop-blur-sm text-gray-600 px-1.5 py-0.5 rounded-full">
              {category.icon} {category.label?.split(' ')[0]}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 flex flex-col flex-1">
        <h3 className="font-semibold text-xs leading-snug line-clamp-2 mb-1 transition-colors group-hover:text-[var(--brand-gold)]" style={{ color: 'var(--brand-navy)' }}>
          {listing.title}
        </h3>

        <div className="flex items-center gap-0.5 text-gray-400 mb-1.5">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="text-[10px] line-clamp-1">{listing.campus}</span>
        </div>

        <p className="font-bold text-sm mb-2" style={{ color: 'var(--brand-navy)' }}>{fmt(listing.price)}</p>

        {/* Buttons - tiny, icon only on mobile */}
        <div className="flex gap-1.5 mt-auto" onClick={e => e.stopPropagation()}>
          <button onClick={handleChat} disabled={chatLoading}
            className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 px-2 rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: 'var(--brand-navy)' }}>
            {chatLoading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <><MessageCircle className="w-2.5 h-2.5" /><span className="hidden sm:inline">Chat</span></>}
          </button>
          {listing.whatsapp_number && (
            <button onClick={handleWhatsApp}
              className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 px-2 rounded-lg text-white transition-opacity hover:opacity-90"
              style={{ background: '#25D366' }}>
              <WA_ICON /><span className="hidden sm:inline">WhatsApp</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
