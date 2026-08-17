import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, ShoppingBag, Store, ArrowLeft } from "lucide-react";
import { auth } from "@/api/supabaseApi";
import { supabase } from "@/lib/supabase";
import { getPostLoginRoute } from "@/lib/AuthContext";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState(null); // null = choose screen

  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    email: '', password: '', fullName: '', confirmPassword: '', whatsapp: ''
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await auth.sendPasswordResetEmail(forgotEmail);
      setResetEmailSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email.');
    }
    setLoading(false);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await auth.signIn(signInData);
      const profile = data?.user?.id ? await supabase.from('profiles').select('*').eq('id', data.user.id).single().then(r => r.data) : null;
      navigate(getPostLoginRoute(profile));
    } catch (err) {
      setError(err.message || 'Failed to sign in. Check your credentials.');
    }
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (userType === 'seller' && !signUpData.whatsapp.trim()) {
      setError('WhatsApp number is required for sellers'); return;
    }
    setLoading(true); setError('');
    try {
      // Sign up with Supabase auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.fullName,
            user_type: userType,
            whatsapp_number: signUpData.whatsapp || ''
          }
        }
      });
      if (signUpError) throw signUpError;

      // Immediately update the profile with user_type and whatsapp
      if (data?.user?.id) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: signUpData.email,
          full_name: signUpData.fullName,
          user_type: userType,
          whatsapp_number: signUpData.whatsapp || '',
          role: 'user',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }

      navigate(createPageUrl("Onboarding"));
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-orange-600 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Campus Marketplace" className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-lg" />
          <h1 className="text-3xl font-bold text-white mb-2">Campus Marketplace</h1>
          <p className="text-white/80">Buy & sell on your campus</p>
        </div>

        <AnimatePresence mode="wait">
          {/* ── STEP 1: CHOOSE BUYER OR SELLER (sign up only) ── */}
          {!userType ? (
            <motion.div key="choose" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <Card className="shadow-2xl">
                <CardContent className="pt-6 pb-6">
                  <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Join Campus Marketplace</h2>
                  <p className="text-gray-500 text-center text-sm mb-6">Are you here to buy or sell?</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button onClick={() => setUserType('buyer')}
                      className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all group">
                      <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <ShoppingBag className="w-7 h-7 text-purple-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">Buyer</p>
                        <p className="text-xs text-gray-500 mt-1">Browse & buy from students</p>
                      </div>
                    </button>

                    <button onClick={() => setUserType('seller')}
                      className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all group">
                      <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                        <Store className="w-7 h-7 text-orange-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">Seller</p>
                        <p className="text-xs text-gray-500 mt-1">List & sell your products</p>
                      </div>
                    </button>
                  </div>

                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                    <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">Already have an account?</span></div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => setUserType('signin')}>Sign In</Button>
                </CardContent>
              </Card>
            </motion.div>

          ) : (
            /* ── STEP 2: SIGN IN / SIGN UP FORM ── */
            <motion.div key="form" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <Card className="shadow-2xl">
                <CardContent className="pt-6">
                  <button onClick={() => { setUserType(null); setError(''); }}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  {userType !== 'signin' && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-sm font-medium ${userType === 'seller' ? 'bg-orange-50 text-orange-700' : 'bg-purple-50 text-purple-700'}`}>
                      {userType === 'seller' ? <Store className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                      Signing up as {userType === 'seller' ? 'Seller' : 'Buyer'}
                    </div>
                  )}

                  {error && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  {userType === 'signin' ? (
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="you@example.com" value={signInData.email}
                          onChange={e => setSignInData({ ...signInData, email: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Password</Label>
                          <button type="button" onClick={() => { setShowForgotPassword(true); setError(''); }}
                            className="text-xs text-purple-600 hover:underline">Forgot password?</button>
                        </div>
                        <Input type="password" placeholder="••••••••" value={signInData.password}
                          onChange={e => setSignInData({ ...signInData, password: e.target.value })} required />
                      </div>
                      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 h-12" disabled={loading}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                      </Button>
                      <p className="text-center text-sm text-gray-500">
                        No account? <button type="button" onClick={() => setUserType(null)} className="text-purple-600 font-medium hover:underline">Sign up</button>
                      </p>
                    </form>
                  ) : (
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input placeholder="John Doe" value={signUpData.fullName}
                          onChange={e => setSignUpData({ ...signUpData, fullName: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="you@example.com" value={signUpData.email}
                          onChange={e => setSignUpData({ ...signUpData, email: e.target.value })} required />
                      </div>
                      {userType === 'seller' && (
                        <div className="space-y-2">
                          <Label>WhatsApp Number <span className="text-red-500">*</span></Label>
                          <Input placeholder="e.g. 2348012345678" value={signUpData.whatsapp}
                            onChange={e => setSignUpData({ ...signUpData, whatsapp: e.target.value })} required />
                          <p className="text-xs text-gray-500">Buyers will contact you on this number</p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input type="password" placeholder="At least 6 characters" value={signUpData.password}
                          onChange={e => setSignUpData({ ...signUpData, password: e.target.value })} required minLength={6} />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm Password</Label>
                        <Input type="password" placeholder="Re-enter password" value={signUpData.confirmPassword}
                          onChange={e => setSignUpData({ ...signUpData, confirmPassword: e.target.value })} required />
                      </div>
                      <Button type="submit" className={`w-full h-12 ${userType === 'seller' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-600 hover:bg-purple-700'}`} disabled={loading}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Create ${userType === 'seller' ? 'Seller' : 'Buyer'} Account`}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── FORGOT PASSWORD MODAL ── */}
          {showForgotPassword && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
                <Card className="shadow-2xl">
                  <CardContent className="pt-6">
                    {resetEmailSent ? (
                      <div className="text-center py-4">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
                        <p className="text-sm text-gray-500 mb-6">We sent a password reset link to <strong>{forgotEmail}</strong>. Click the link to set a new password.</p>
                        <Button className="w-full" variant="outline" onClick={() => { setShowForgotPassword(false); setResetEmailSent(false); setForgotEmail(''); }}>
                          Back to Sign In
                        </Button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => setShowForgotPassword(false)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
                          <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Reset your password</h3>
                        <p className="text-sm text-gray-500 mb-5">Enter your email and we'll send you a reset link.</p>
                        {error && (
                          <Alert className="mb-4 border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">{error}</AlertDescription>
                          </Alert>
                        )}
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" placeholder="you@example.com" value={forgotEmail}
                              onChange={e => setForgotEmail(e.target.value)} required />
                          </div>
                          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 h-12" disabled={loading}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                          </Button>
                        </form>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
