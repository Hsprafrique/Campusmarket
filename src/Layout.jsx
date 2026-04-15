import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User, LogOut, Package, Plus, Crown, MessageCircle, Store } from "lucide-react";
import Footer from "./components/Footer";
import { useAuth } from '@/lib/AuthContext';

export default function Layout({ children, currentPageName }) {
  const { user, isAuthenticated, isLoadingAuth, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(createPageUrl("Home"));
  };

  const navLinks = [
    { name: "Home", page: "Home" },
    { name: "Browse", page: "Browse" },
    { name: "Pricing", page: "Pricing" },
  ];

  const adminLinks = user?.role === 'admin' ? [
    { name: "Admin", page: "AdminListings" },
    { name: "Revenue", page: "AdminMonetization" }
  ] : [];

  if (currentPageName === "Onboarding" || currentPageName === "Auth") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">Campus Marketplace</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link key={link.page} to={createPageUrl(link.page)}
                  className={`text-sm font-medium transition-colors hover:text-purple-600 ${currentPageName === link.page ? 'text-purple-600' : 'text-gray-600'}`}>
                  {link.name}
                </Link>
              ))}
              {adminLinks.map(link => (
                <Link key={link.page} to={createPageUrl(link.page)}
                  className={`text-sm font-medium transition-colors hover:text-purple-600 ${currentPageName === link.page ? 'text-purple-600' : 'text-gray-600'}`}>
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {!isLoadingAuth && (
                <>
                  {isAuthenticated && user ? (
                    <>
                      {user.user_type === 'seller' && (
                        <Link to={createPageUrl("CreateListing")} className="hidden sm:block">
                          <Button className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="w-4 h-4 mr-2" />Sell
                          </Button>
                        </Link>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center shadow-lg">
                              <span className="text-white font-semibold text-lg">
                                {user.full_name?.[0]?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <div className="px-3 py-2">
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(createPageUrl("Messages"))}>
                            <MessageCircle className="w-4 h-4 mr-2" />Messages
                          </DropdownMenuItem>
                          {user.user_type === 'seller' && (
                            <>
                              <DropdownMenuItem onClick={() => navigate(createPageUrl("MyListings"))}>
                                <Package className="w-4 h-4 mr-2" />My Listings
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(createPageUrl("MyStore"))}>
                                <Store className="w-4 h-4 mr-2" />My Store
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => navigate(createPageUrl("Profile"))}>
                            <User className="w-4 h-4 mr-2" />Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(createPageUrl("Pricing"))}>
                            <Crown className="w-4 h-4 mr-2" />Upgrade Plan
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                            <LogOut className="w-4 h-4 mr-2" />Logout
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50"
                        onClick={() => navigate(createPageUrl("Auth"))}>
                        Sign In
                      </Button>
                      <Button className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => navigate(createPageUrl("Auth"))}>
                        Sign Up
                      </Button>
                    </>
                  )}
                </>
              )}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <nav className="flex flex-col gap-4 mt-8">
                    {navLinks.map(link => (
                      <Link key={link.page} to={createPageUrl(link.page)}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-lg font-medium p-3 rounded-lg transition-colors ${currentPageName === link.page ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                        {link.name}
                      </Link>
                    ))}
                    {isAuthenticated && user && (
                      <>
                        <hr className="my-2" />
                        {user.user_type === 'seller' && (
                          <Link to={createPageUrl("CreateListing")} onClick={() => setMobileMenuOpen(false)}
                            className="text-lg font-medium p-3 rounded-lg bg-purple-600 text-white text-center">
                            <Plus className="w-5 h-5 inline mr-2" />Sell Something
                          </Link>
                        )}
                        <Link to={createPageUrl("Messages")} onClick={() => setMobileMenuOpen(false)}
                          className="text-lg font-medium p-3 rounded-lg text-gray-600 hover:bg-gray-50">Messages</Link>
                        {user.user_type === 'seller' && (
                          <>
                            <Link to={createPageUrl("MyListings")} onClick={() => setMobileMenuOpen(false)}
                              className="text-lg font-medium p-3 rounded-lg text-gray-600 hover:bg-gray-50">My Listings</Link>
                            <Link to={createPageUrl("MyStore")} onClick={() => setMobileMenuOpen(false)}
                              className="text-lg font-medium p-3 rounded-lg text-gray-600 hover:bg-gray-50">My Store</Link>
                          </>
                        )}
                        <button onClick={handleLogout}
                          className="text-lg font-medium p-3 rounded-lg text-red-600 hover:bg-red-50 text-left">Logout</button>
                      </>
                    )}
                    {!isAuthenticated && (
                      <Link to={createPageUrl("Auth")} onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-medium p-3 rounded-lg bg-purple-600 text-white text-center">Sign In / Sign Up</Link>
                    )}
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
