/**
 * supabaseApi.js
 * Central API layer replacing base44 SDK.
 * All database operations go through here.
 */
import { supabase } from '@/lib/supabase';

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
export const auth = {
  /** Sign up with email + password */
  signUp: async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) throw error;
    return data;
  },

  /** Sign in */
  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  /** Sign in with Google OAuth */
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/Onboarding` }
    });
    if (error) throw error;
    return data;
  },

  /** Send a password reset email — link redirects to /ResetPassword */
  sendPasswordResetEmail: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/ResetPassword`
    });
    if (error) throw error;
  },

  /** Set a new password — must be called while the recovery session from the email link is active */
  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  /** Sign out */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /** Get current session user */
  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  /** Get full profile */
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  /** Update own profile */
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Listen for auth state changes */
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  /** Get current session */
  getSession: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }
};

// ─────────────────────────────────────────────
// LISTINGS
// ─────────────────────────────────────────────
export const listings = {
  /** Fetch all approved, active, non-expired listings */
  getBrowse: async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('is_active', true)
      .eq('status', 'approved')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  /** Fetch featured listings for home page */
  getFeatured: async (limit = 8) => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('is_active', true)
      .eq('status', 'approved')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  /** Get listings for a seller */
  getMyListings: async (sellerId) => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  /** Create a listing */
  create: async (listingData) => {
    const { data, error } = await supabase
      .from('listings')
      .insert([listingData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Update a listing */
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('listings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Delete a listing */
  delete: async (id) => {
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) throw error;
  },

  /** Admin: fetch all listings */
  getAll: async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  /** Admin: approve / reject */
  updateStatus: async (id, status, adminEmail) => {
    const updates = {
      status,
      is_active: status === 'approved', // approved = visible, rejected = hidden
      approved_by: adminEmail,
      approved_at: new Date().toISOString(),
      expires_at: status === 'approved'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null
    };
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Count active listings for a seller */
  countActive: async (sellerId) => {
    const { count, error } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', sellerId)
      .eq('is_active', true);
    if (error) throw error;
    return count || 0;
  }
};

// ─────────────────────────────────────────────
// STORES
// ─────────────────────────────────────────────
export const stores = {
  /** Get store by owner */
  getByOwner: async (ownerId) => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', ownerId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  /** Get store by ID with its listings */
  getById: async (storeId) => {
    const { data, error } = await supabase
      .from('stores')
      .select(`
        *,
        listings(*)
      `)
      .eq('id', storeId)
      .single();
    if (error) throw error;
    return data;
  },

  /** Create a store */
  create: async (storeData) => {
    const { data, error } = await supabase
      .from('stores')
      .insert([storeData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Update a store */
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('stores')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Delete a store */
  delete: async (id) => {
    const { error } = await supabase.from('stores').delete().eq('id', id);
    if (error) throw error;
  },

  /** Get all stores (admin or browse) */
  getAll: async () => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

// ─────────────────────────────────────────────
// CONVERSATIONS
// ─────────────────────────────────────────────
export const conversations = {
  /** Get all conversations for current user */
  getForUser: async (userId) => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  /** Get by listing + buyer (to avoid duplicates) */
  getByListingAndBuyer: async (listingId, buyerId) => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('listing_id', listingId)
      .eq('buyer_id', buyerId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  /** Get single conversation */
  getById: async (id) => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  /** Create conversation */
  create: async (convData) => {
    const { data, error } = await supabase
      .from('conversations')
      .insert([convData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Update conversation (last_message, unread counts) */
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Subscribe to conversation changes */
  subscribe: (userId, callback) => {
    return supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `buyer_id=eq.${userId}`
      }, callback)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `seller_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
};

// ─────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────
export const messages = {
  /** Get all messages in a conversation */
  getByConversation: async (conversationId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  /** Send a message */
  create: async (messageData) => {
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Mark messages as read */
  markRead: async (conversationId, recipientId) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', recipientId)
      .eq('is_read', false);
    if (error) throw error;
  },

  /** Subscribe to new messages in a conversation */
  subscribe: (conversationId, callback) => {
    return supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, callback)
      .subscribe();
  }
};

// ─────────────────────────────────────────────
// FEATURED LISTINGS
// ─────────────────────────────────────────────
export const featuredListings = {
  create: async (featuredData) => {
    const { data, error } = await supabase
      .from('featured_listings')
      .insert([featuredData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('featured_listings')
      .select('*, listings(*), profiles(full_name, email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

// ─────────────────────────────────────────────
// VISITOR TRACKING (for admin analytics)
// ─────────────────────────────────────────────
export const visits = {
  /** Record a page visit using an anonymous browser-stored visitor id */
  record: async (page) => {
    try {
      let visitorId = localStorage.getItem('cm_visitor_id');
      if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem('cm_visitor_id', visitorId);
      }
      await supabase.from('site_visits').insert({ visitor_id: visitorId, page });
    } catch (e) {
      // Fail silently — visit tracking should never break the app
      console.warn('Visit tracking failed', e);
    }
  },

  /** Get total visit count */
  getTotalCount: async () => {
    const { count, error } = await supabase
      .from('site_visits')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  },

  /** Get unique visitor count */
  getUniqueVisitorCount: async () => {
    const { data, error } = await supabase.from('site_visits').select('visitor_id');
    if (error) throw error;
    return new Set((data || []).map(v => v.visitor_id)).size;
  },

  /** Get visits in the last N days */
  getRecentCount: async (days = 7) => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from('site_visits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since);
    if (error) throw error;
    return count || 0;
  },

  /** Get visits grouped by day for the last N days (for a simple chart) */
  getDailyBreakdown: async (days = 14) => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('site_visits')
      .select('created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: true });
    if (error) throw error;
    const counts = {};
    (data || []).forEach(v => {
      const day = new Date(v.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
      counts[day] = (counts[day] || 0) + 1;
    });
    return Object.entries(counts).map(([day, count]) => ({ day, count }));
  },
};

// ─────────────────────────────────────────────
// STORAGE (file uploads)
// ─────────────────────────────────────────────
export const storage = {
  uploadListingImage: async (file, userId) => {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(data.path);
    return publicUrl;
  },

  uploadStoreAsset: async (file, userId, type = 'logo') => {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${type}-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('store-assets')
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(data.path);
    return publicUrl;
  },

  uploadAvatar: async (file, userId) => {
    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { cacheControl: '3600', upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.path);
    return publicUrl;
  }
};
