import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Check, Crown, Zap, Loader2 } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "../components/NigerianCampuses";
import { useAuth } from "@/lib/AuthContext";
import { auth as authApi } from "@/api/supabaseApi";
import { useToast } from "@/components/ui/use-toast";

export default function Pricing() {
  const navigate = useNavigate();
  const { user, rawUser, isAuthenticated, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(null);

  const handleUpgrade = async (planId) => {
    if (!isAuthenticated) { navigate(createPageUrl("Auth")); return; }
    setProcessing(planId);
    // Payment integration placeholder — hook up Paystack/Flutterwave here
    const confirmed = window.confirm(`Upgrade to ${planId.toUpperCase()}?\n\nAmount: ₦${planId === 'basic' ? '1,999' : '5,000'}/month\n\n(Payment via Paystack/Flutterwave — integrate your keys in production)`);
    if (confirmed) {
      try {
        await authApi.updateProfile(rawUser.id, { subscription_plan: planId });
        await refreshProfile();
        toast({ title: `Upgraded to ${planId} plan!` });
      } catch (err) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    }
    setProcessing(null);
  };

  const currentPlan = user?.subscription_plan || 'free';

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <Badge className="bg-purple-100 text-purple-800 mb-4">Pricing</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Start free and upgrade as your business grows. No hidden fees.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan, index) => {
            const isCurrent = currentPlan === plan.id;
            const isPopular = plan.id === 'basic';
            return (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className={`relative overflow-hidden h-full ${isPopular ? 'border-2 border-purple-500 shadow-xl scale-105' : 'border-gray-200'}`}>
                  {isPopular && (
                    <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">Most Popular</div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${plan.id === 'free' ? 'bg-gray-100' : plan.id === 'basic' ? 'bg-purple-100' : 'bg-orange-100'}`}>
                      {plan.id === 'free' ? <Zap className="w-7 h-7 text-gray-600" /> :
                       plan.id === 'basic' ? <Crown className="w-7 h-7 text-purple-600" /> :
                       <Crown className="w-7 h-7 text-orange-600" />}
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price === 0 ? 'Free' : `₦${plan.price.toLocaleString()}`}</span>
                      {plan.period && <span className="text-gray-500">/{plan.period}</span>}
                    </div>
                    <CardDescription className="mt-2">
                      {plan.listings === -1 ? 'Unlimited' : `Up to ${plan.listings}`} listing{plan.listings !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.id === 'free' ? 'bg-gray-100' : plan.id === 'basic' ? 'bg-purple-100' : 'bg-orange-100'}`}>
                            <Check className={`w-3 h-3 ${plan.id === 'free' ? 'text-gray-600' : plan.id === 'basic' ? 'text-purple-600' : 'text-orange-600'}`} />
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {isCurrent ? (
                      <Button className="w-full" variant="outline" disabled>Current Plan</Button>
                    ) : plan.id === 'free' ? (
                      <Button className="w-full" variant="outline"
                        onClick={() => !isAuthenticated && navigate(createPageUrl("Auth"))}>
                        {isAuthenticated ? 'Current Free Tier' : 'Get Started'}
                      </Button>
                    ) : (
                      <Button className={`w-full ${plan.id === 'basic' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-500 hover:bg-orange-600'}`}
                        onClick={() => handleUpgrade(plan.id)} disabled={processing === plan.id}>
                        {processing === plan.id ? <Loader2 className="w-5 h-5 animate-spin" /> : `Upgrade to ${plan.name}`}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: "How do I pay?", a: "We accept payments via Paystack and Flutterwave. Your payment is secure and processed instantly." },
              { q: "Can I cancel anytime?", a: "Yes! You can cancel your subscription at any time. Your listings will remain active until the end of your billing period." },
              { q: "What happens when I reach my listing limit?", a: "You'll need to upgrade your plan or deactivate existing listings to create new ones." },
              { q: "Do listings expire?", a: "Yes, listings expire after 30 days from approval to keep results fresh. You can renew by re-submitting or upgrading your plan." }
            ].map((item, i) => (
              <div key={i}>
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
