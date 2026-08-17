import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { Plus, Trash2, Package, Loader2, Clock, CheckCircle, XCircle, TrendingUp, Store } from "lucide-react";
import { CATEGORIES } from "../components/NigerianCampuses";
import { useAuth } from "@/lib/AuthContext";
import { listings as listingsApi } from "@/api/supabaseApi";

export default function MyListings() {
  const navigate = useNavigate();
  const { user, rawUser, isAuthenticated, isLoadingAuth } = useAuth();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate(createPageUrl("Auth"));
  }, [isLoadingAuth, isAuthenticated]);

  const { data: myListings = [], isLoading } = useQuery({
    queryKey: ['myListings', rawUser?.id],
    queryFn: () => listingsApi.getMyListings(rawUser.id),
    enabled: !!rawUser?.id
  });

  const deleteMutation = useMutation({
    mutationFn: id => listingsApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['myListings'] }); setDeleteId(null); }
  });

  const fmt = price => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  const daysLeft = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const totalCount = myListings.length;
  const approvedCount = myListings.filter(l => l.status === 'approved').length;
  const pendingCount = myListings.filter(l => l.status === 'pending').length;
  const rejectedCount = myListings.filter(l => l.status === 'rejected').length;

  if (isLoadingAuth || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-10 w-48 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl mb-4" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-500 text-sm">All listings are free to post</p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("MyStore")}>
              <Button variant="outline" className="border-purple-300 text-purple-700">
                <Store className="w-4 h-4 mr-2" />My Store
              </Button>
            </Link>
            <Link to={createPageUrl("CreateListing")}>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />New Listing
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: TrendingUp, label: "Total Listings", value: totalCount, gradient: "from-purple-600 to-purple-700" },
            { icon: CheckCircle, label: "Approved & Live", value: approvedCount, gradient: "from-green-500 to-green-600" },
            { icon: Clock, label: "Pending Review", value: pendingCount, gradient: "from-yellow-500 to-orange-500" },
            { icon: XCircle, label: "Rejected", value: rejectedCount, gradient: "from-red-500 to-red-600" },
          ].map(({ icon: Icon, label, value, gradient }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`bg-gradient-to-br ${gradient} text-white border-0`}>
                <CardContent className="p-5">
                  <Icon className="w-5 h-5 mb-2 opacity-80" />
                  <p className="text-3xl font-black">{value}</p>
                  <p className="text-sm opacity-80">{label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Store promo if no store yet */}
        {user?.user_type === 'seller' && !user?.has_store && (
          <div className="bg-gradient-to-r from-purple-50 to-orange-50 border border-purple-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Store className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Want your own branded store?</p>
                <p className="text-xs text-gray-500">Get a store page for ₦5,000 or $5 — early investor badge included</p>
              </div>
            </div>
            <Link to={createPageUrl("Pricing")}>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap">Get a Store</Button>
            </Link>
          </div>
        )}

        {/* Listings */}
        {myListings.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-600 mb-6">Create your first listing — it's completely free!</p>
              <Link to={createPageUrl("CreateListing")}>
                <Button className="bg-purple-600 hover:bg-purple-700"><Plus className="w-4 h-4 mr-2" />Create Listing</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myListings.map((listing, index) => {
              const cat = CATEGORIES.find(c => c.value === listing.category);
              const days = daysLeft(listing.expires_at);
              return (
                <motion.div key={listing.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-36 h-32 sm:h-auto overflow-hidden flex-shrink-0 bg-gray-100">
                          {listing.images?.[0]
                            ? <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-gray-300" /></div>}
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex items-start gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                            {listing.status === 'approved' && <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Live</Badge>}
                            {listing.status === 'pending' && <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>}
                            {listing.status === 'rejected' && <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>}
                          </div>
                          <p className="text-sm text-gray-500 mb-1">{cat?.icon} {cat?.label} • {listing.campus}</p>
                          <p className="text-xl font-bold text-purple-600">{fmt(listing.price)}</p>
                          {listing.status === 'pending' && <p className="text-xs text-yellow-600 mt-1">⏳ Waiting for admin approval</p>}
                          {listing.status === 'rejected' && <p className="text-xs text-red-500 mt-1">❌ Rejected — delete and resubmit with changes</p>}
                          {days !== null && listing.status === 'approved' && (
                            <p className={`text-xs mt-1 flex items-center gap-1 ${days <= 3 ? 'text-red-500' : 'text-gray-400'}`}>
                              <Clock className="w-3 h-3" />{days > 0 ? `Expires in ${days} days` : 'Expired'}
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => setDeleteId(listing.id)}>
                              <Trash2 className="w-4 h-4 mr-1" />Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate(deleteId)} className="bg-red-600 hover:bg-red-700">
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
