import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, User, LogOut, Package, Plus, MessageCircle, Store, ShieldCheck, BarChart3, ChevronDown } from "lucide-react";
import Footer from "./components/Footer";
import { useAuth } from '@/lib/AuthContext';

const LOGO_URL = "/logo.png";

export default function Layout({ children, currentPageName }) {
  const { user, isAuthenticated, isLoadingAuth, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate(createPageUrl("Home"));
  };

  const isAdmin = user?.role === 'admin';

  if (currentPageName === "Onboarding" || currentPageName === "Auth" || currentPageName === "ResetPassword") return <>{children}</>;

  const navLinks = [
    { name: "Home", page: "Home" },
    { name: "Browse", page: "Browse" },
    { name: "Stores", page: "Pricing" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--brand-cream)' }}>
      <header className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white shadow-sm border-b border-gray-100' : 'bg-white/95 backdrop-blur-md border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-2.5 flex-shrink-0">
              <img src={LOGO_URL} alt="Campus Marketplace" className="h-9 w-9 rounded-xl object-cover" />
              <span className="font-bold text-lg tracking-tight hidden sm:block" style={{ color: 'var(--brand-navy)' }}>
                Campus<span style={{ color: 'var(--brand-gold)' }}>Market</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.page} to={createPageUrl(link.page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPageName === link.page
                      ? 'text-[var(--brand-navy)] bg-gray-100'
                      : 'text-gray-500 hover:text-[var(--brand-navy)] hover:bg-gray-50'
                  }`}>
                  {link.name}
                </Link>
              ))}
              {isAdmin && (
                <>
                  <Link to={createPageUrl("AdminListings")} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-[var(--brand-navy)] hover:bg-gray-50 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />Admin
                  </Link>
                  <Link to={createPageUrl("AdminMonetization")} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-[var(--brand-navy)] hover:bg-gray-50 flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />Revenue
                  </Link>
                </>
              )}
            </nav>

            {/* Right */}
            <div className="flex items-center gap-2">
              {!isLoadingAuth && (
                <>
                  {isAuthenticated && user ? (
                    <>
                      {user.user_type === 'seller' && (
                        <Link to={createPageUrl("CreateListing")} className="hidden sm:block">
                          <Button size="sm" className="text-white text-sm font-medium px-4" style={{ background: 'var(--brand-navy)' }}>
                            <Plus className="w-4 h-4 mr-1.5" />Post
                          </Button>
                        </Link>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0" style={{ background: 'var(--brand-navy)' }}>
                              {user.avatar_url
                                ? <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                                : user.full_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 shadow-lg border-gray-100">
                          <div className="px-3 py-2.5 border-b border-gray-50">
                            <p className="font-semibold text-sm" style={{ color: 'var(--brand-navy)' }}>{user.full_name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            {isAdmin && <span className="text-xs font-medium px-1.5 py-0.5 rounded mt-1 inline-block" style={{ background: 'var(--brand-gold-light)', color: 'var(--brand-gold)' }}>Admin</span>}
                          </div>
                          {isAdmin && <>
                            <DropdownMenuItem onClick={() => navigate(createPageUrl("AdminListings"))} className="gap-2"><ShieldCheck className="w-4 h-4" />Admin Dashboard</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(createPageUrl("AdminMonetization"))} className="gap-2"><BarChart3 className="w-4 h-4" />Revenue</DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>}
                          <DropdownMenuItem onClick={() => navigate(createPageUrl("Messages"))} className="gap-2"><MessageCircle className="w-4 h-4" />Messages</DropdownMenuItem>
                          {user.user_type === 'seller' && <>
                            <DropdownMenuItem onClick={() => navigate(createPageUrl("MyListings"))} className="gap-2"><Package className="w-4 h-4" />My Listings</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(createPageUrl("MyStore"))} className="gap-2"><Store className="w-4 h-4" />My Store</DropdownMenuItem>
                          </>}
                          <DropdownMenuItem onClick={() => navigate(createPageUrl("Profile"))} className="gap-2"><User className="w-4 h-4" />Profile</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600 focus:text-red-600"><LogOut className="w-4 h-4" />Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-sm font-medium text-gray-600" onClick={() => navigate(createPageUrl("Auth"))}>Sign In</Button>
                      <Button size="sm" className="text-white text-sm font-medium px-4" style={{ background: 'var(--brand-navy)' }} onClick={() => navigate(createPageUrl("Auth"))}>Sign Up</Button>
                    </div>
                  )}
                </>
              )}

              {/* Mobile menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="w-9 h-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0">
                  <div className="p-6 border-b border-gray-100" style={{ background: 'var(--brand-navy)' }}>
                    <div className="flex items-center gap-3">
                      <img src={LOGO_URL} alt="Campus Marketplace" className="h-10 w-10 rounded-xl object-cover" />
                      <span className="font-bold text-white">CampusMarket</span>
                    </div>
                    {user && <p className="text-sm text-white/60 mt-2">{user.email}</p>}
                  </div>
                  <nav className="p-4 space-y-1">
                    {navLinks.map(link => (
                      <Link key={link.page} to={createPageUrl(link.page)} onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        {link.name}
                      </Link>
                    ))}
                    {isAuthenticated && user && <>
                      <div className="border-t border-gray-100 my-2" />
                      {isAdmin && <>
                        <Link to={createPageUrl("AdminListings")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"><ShieldCheck className="w-4 h-4" />Admin Dashboard</Link>
                      </>}
                      {user.user_type === 'seller' && <>
                        <Link to={createPageUrl("CreateListing")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50" style={{ color: 'var(--brand-navy)' }}><Plus className="w-4 h-4" />Post Listing</Link>
                        <Link to={createPageUrl("MyListings")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"><Package className="w-4 h-4" />My Listings</Link>
                        <Link to={createPageUrl("MyStore")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"><Store className="w-4 h-4" />My Store</Link>
                      </>}
                      <Link to={createPageUrl("Messages")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"><MessageCircle className="w-4 h-4" />Messages</Link>
                      <Link to={createPageUrl("Profile")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"><User className="w-4 h-4" />Profile</Link>
                      <div className="border-t border-gray-100 my-2" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-left">
                        <LogOut className="w-4 h-4" />Logout
                      </button>
                    </>}
                    {!isAuthenticated && <>
                      <div className="border-t border-gray-100 my-2" />
                      <Link to={createPageUrl("Auth")} onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                        style={{ background: 'var(--brand-navy)' }}>
                        Sign In / Sign Up
                      </Link>
                    </>}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
