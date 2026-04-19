import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { conversations as convsApi } from "@/api/supabaseApi";

export default function ChatButton({ listing, size = "sm", className = "" }) {
  const navigate = useNavigate();
  const { rawUser, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const startChat = async () => {
    if (!isAuthenticated) { navigate(createPageUrl("Auth")); return; }
    if (rawUser?.id === listing.seller_id) { alert("You can't chat with yourself!"); return; }
    setLoading(true);
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
      console.error(err);
      alert("Failed to start chat: " + err.message);
    }
    setLoading(false);
  };

  return (
    <Button size={size} onClick={startChat} disabled={loading}
      className={`bg-purple-600 hover:bg-purple-700 text-white ${className}`}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MessageCircle className="w-4 h-4 mr-1" />Chat</>}
    </Button>
  );
}
