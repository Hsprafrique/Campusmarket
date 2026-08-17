import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Loader2, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { conversations as convsApi, messages as msgsApi } from "@/api/supabaseApi";

export default function Chat() {
  const navigate = useNavigate();
  const { rawUser, isAuthenticated, isLoadingAuth, user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const urlParams = new URLSearchParams(window.location.search);
  const conversationId = urlParams.get('conversation');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate(createPageUrl("Auth"));
  }, [isLoadingAuth, isAuthenticated]);

  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => convsApi.getById(conversationId),
    enabled: !!conversationId && !!rawUser
  });

  const { data: msgs = [], isLoading: msgsLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const data = await msgsApi.getByConversation(conversationId);
      // Mark unread as read
      await msgsApi.markRead(conversationId, rawUser.id);
      return data;
    },
    enabled: !!conversationId && !!rawUser
  });

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;
    const channel = msgsApi.subscribe(conversationId, (payload) => {
      queryClient.invalidateQueries(['messages', conversationId]);
      queryClient.invalidateQueries(['conversations', rawUser?.id]);
    });
    return () => channel.unsubscribe();
  }, [conversationId, rawUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const sendMutation = useMutation({
    mutationFn: async (text) => {
      const newMsg = await msgsApi.create({
        conversation_id: conversationId,
        sender_id: rawUser.id,
        sender_email: user.email,
        sender_name: user.full_name,
        message: text,
        is_read: false
      });
      const isSellerSending = rawUser.id === conversation.seller_id;
      await convsApi.update(conversationId, {
        last_message: text,
        last_message_at: new Date().toISOString(),
        unread_buyer: isSellerSending ? (conversation.unread_buyer || 0) + 1 : 0,
        unread_seller: !isSellerSending ? (conversation.unread_seller || 0) + 1 : 0
      });
      return newMsg;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['messages', conversationId]);
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate(message);
  };

  if (isLoadingAuth || msgsLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
    </div>
  );

  if (!conversation) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="p-8 text-center">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Conversation not found</h2>
          <Button onClick={() => navigate(createPageUrl("Messages"))}>View all messages</Button>
        </CardContent>
      </Card>
    </div>
  );

  const otherName = rawUser?.id === conversation.buyer_id ? conversation.seller_name : conversation.buyer_name;

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Messages"))}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar>
          <AvatarFallback className="bg-purple-100 text-purple-600">{otherName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold">{otherName}</h2>
          <p className="text-sm text-gray-500">{conversation.listing_title}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {msgs.map(msg => {
            const isMine = msg.sender_id === rawUser?.id;
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isMine ? 'bg-purple-600 text-white' : 'bg-white text-gray-900'} rounded-2xl px-4 py-2 shadow-sm`}>
                  <p className="text-sm break-words">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-purple-200' : 'text-gray-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t p-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input placeholder="Type a message..." value={message} onChange={e => setMessage(e.target.value)}
            className="flex-1" disabled={sendMutation.isPending} />
          <Button type="submit" disabled={!message.trim() || sendMutation.isPending} className="bg-purple-600 hover:bg-purple-700">
            {sendMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
