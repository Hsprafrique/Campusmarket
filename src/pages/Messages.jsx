import React, { useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { conversations as convsApi, messages as msgsApi } from "@/api/supabaseApi";

export default function Messages() {
  const navigate = useNavigate();
  const { rawUser, isAuthenticated, isLoadingAuth } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate(createPageUrl("Auth"));
  }, [isLoadingAuth, isAuthenticated]);

  const { data: convos = [], isLoading } = useQuery({
    queryKey: ['conversations', rawUser?.id],
    queryFn: () => convsApi.getForUser(rawUser.id),
    enabled: !!rawUser?.id
  });

  // Real-time subscription
  useEffect(() => {
    if (!rawUser?.id) return;
    const channel = convsApi.subscribe(rawUser.id, () => {
      queryClient.invalidateQueries(['conversations', rawUser.id]);
    });
    return () => channel.unsubscribe();
  }, [rawUser?.id]);

  const formatTime = (date) => {
    const d = new Date(date), now = new Date(), diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  if (isLoadingAuth || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <Skeleton className="h-10 w-48 mb-8" />
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl mb-3" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
        {convos.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600">Start chatting with sellers on listings you're interested in</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {convos.map((convo, index) => {
              const isMe = rawUser.id === convo.buyer_id;
              const other = { name: isMe ? convo.seller_name : convo.buyer_name };
              const unread = isMe ? convo.unread_buyer : convo.unread_seller;
              return (
                <motion.div key={convo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Link to={`${createPageUrl("Chat")}?conversation=${convo.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-purple-100 text-purple-600">{other.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">{other.name}</h3>
                              <span className="text-xs text-gray-500">{formatTime(convo.last_message_at || convo.created_at)}</span>
                            </div>
                            <p className="text-sm text-gray-600 truncate mb-1">{convo.listing_title}</p>
                            <div className="flex items-center justify-between">
                              <p className={`text-sm truncate ${unread > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                                {convo.last_message || 'No messages yet'}
                              </p>
                              {unread > 0 && <Badge className="bg-purple-600 text-white ml-2">{unread}</Badge>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
