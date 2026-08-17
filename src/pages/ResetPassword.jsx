import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { auth } from "@/api/supabaseApi";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(null); // null = checking, true/false = result

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash and auto-creates a session for it
    supabase.auth.getSession().then(({ data: { session } }) => {
      setValidSession(!!session);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await auth.updatePassword(password);
      setSuccess(true);
      setTimeout(() => navigate(createPageUrl("Auth")), 2500);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired — request a new one.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-orange-600 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Campus Marketplace" className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-lg" />
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
        </div>

        <Card className="shadow-2xl">
          <CardContent className="pt-6">
            {validSession === null ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              </div>
            ) : validSession === false ? (
              <div className="text-center py-4">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Link expired or invalid</h3>
                <p className="text-sm text-gray-500 mb-6">This password reset link is no longer valid. Please request a new one.</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => navigate(createPageUrl("Auth"))}>
                  Back to Sign In
                </Button>
              </div>
            ) : success ? (
              <div className="text-center py-4">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Password updated!</h3>
                <p className="text-sm text-gray-500">Redirecting you to sign in...</p>
              </div>
            ) : (
              <>
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Set a new password</CardTitle>
                  <CardDescription>Choose a strong password for your account</CardDescription>
                </CardHeader>
                {error && (
                  <Alert className="mb-4 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="At least 6 characters" value={password}
                      onChange={e => setPassword(e.target.value)} required minLength={6} />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input type="password" placeholder="Re-enter password" value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 h-12" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
