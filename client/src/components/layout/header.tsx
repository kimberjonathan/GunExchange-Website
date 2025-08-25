import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";

export default function Header() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const { user, logout } = useAuth();

  // Get unread message count for logged in users
  const { data: unreadCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
    enabled: !!user,
    refetchInterval: 30000, // Check every 30 seconds
  });

  const unreadCount = Number(unreadCountData?.count || 0);
  
  // Debug logging for unread count
  if (user?.username === 'jkimber1') {
    console.log('🔔 NOTIFICATION DEBUG - User:', user?.username, 'Unread count data:', unreadCountData, 'Final count:', unreadCount);
  }



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to search results page with query
      window.location.href = `/search?q=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0" data-testid="link-home">
                <h1 className="text-2xl font-bold text-forum-primary dark:text-white">CA Gun Exchange</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">California Firearms Community</p>
              </Link>
            </div>
            
            <div className="hidden md:block flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search forums..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10"
                  data-testid="input-search"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  data-testid="button-search"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                </Button>
              </form>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Desktop Navigation */}
              {user ? (
                <div className="hidden md:flex items-center space-x-4">
                  <Link href="/messages" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-forum-accent dark:hover:text-forum-accent transition-colors relative" data-testid="link-messages">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      Messages
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs ml-1 px-1 min-w-[1.25rem] h-5">
                          {unreadCount}
                        </Badge>
                      )}
                    </span>
                  </Link>
                  <Link href="/profile" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-forum-accent dark:hover:text-forum-accent transition-colors" data-testid="link-profile">
                    Profile
                  </Link>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200" data-testid="text-username">
                    {user.username}
                  </span>
                  <Button onClick={logout} variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800" data-testid="button-logout">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm" className="bg-forum-accent hover:bg-forum-accent/90 text-white" data-testid="button-signin">
                        Sign In
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Sign In</DialogTitle>
                        <DialogDescription>
                          Sign in to your account to access your profile and participate in discussions.
                        </DialogDescription>
                      </DialogHeader>
                      <LoginForm onSuccess={() => setLoginOpen(false)} />
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-forum-accent text-forum-accent hover:bg-forum-accent hover:text-white dark:border-forum-accent dark:text-forum-accent" data-testid="button-register">
                        Register
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Register</DialogTitle>
                        <DialogDescription>
                          Create a new account to join the CA Gun Exchange community.
                        </DialogDescription>
                      </DialogHeader>
                      <RegisterForm onSuccess={() => setRegisterOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              
              {/* Mobile Navigation - Compact */}
              {user && (
                <div className="flex md:hidden items-center space-x-1">
                  <Link href="/messages" className="p-2 text-gray-700 dark:text-gray-200 hover:text-forum-accent dark:hover:text-forum-accent transition-colors relative" data-testid="link-messages-mobile">
                    <span className="text-xs font-medium">Msgs</span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs px-1 min-w-[1.25rem] h-5">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                  <Link href="/profile" className="p-2 text-gray-700 dark:text-gray-200 hover:text-forum-accent dark:hover:text-forum-accent transition-colors" data-testid="link-profile-mobile">
                    <span className="text-xs font-medium">Profile</span>
                  </Link>
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="px-4 py-3 space-y-3">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search forums..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                data-testid="input-search-mobile"
              />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                data-testid="button-search-mobile"
              >
                <Search className="h-4 w-4 text-gray-400" />
              </Button>
            </form>

            {/* Mobile Navigation Links */}
            {user ? (
              <div className="space-y-2">
                <Link 
                  href="/messages" 
                  className="block py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors" 
                  data-testid="link-messages-menu"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center justify-between">
                    Messages
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs ml-2 px-1 min-w-[1.25rem] h-5">
                        {unreadCount}
                      </Badge>
                    )}
                  </span>
                </Link>
                <Link 
                  href="/profile" 
                  className="block py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors" 
                  data-testid="link-profile-menu"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                {user.isAdmin && (
                  <Link 
                    href="/admin" 
                    className="block py-2 px-3 text-sm font-medium text-forum-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors" 
                    data-testid="link-admin-menu"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="block py-2 px-3 text-sm text-gray-500 dark:text-gray-400">
                    Logged in as: {user.username}
                  </span>
                  <Button 
                    onClick={() => { logout(); setMobileMenuOpen(false); }} 
                    variant="outline" 
                    className="w-full mt-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800" 
                    data-testid="button-logout-mobile"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="default" 
                      className="w-full bg-forum-accent hover:bg-forum-accent/90 text-white" 
                      data-testid="button-signin-mobile"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sign In</DialogTitle>
                      <DialogDescription>
                        Sign in to your account to access your profile and participate in discussions.
                      </DialogDescription>
                    </DialogHeader>
                    <LoginForm onSuccess={() => { setLoginOpen(false); setMobileMenuOpen(false); }} />
                  </DialogContent>
                </Dialog>
                
                <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full border-forum-accent text-forum-accent hover:bg-forum-accent hover:text-white dark:border-forum-accent dark:text-forum-accent" 
                      data-testid="button-register-mobile"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Register</DialogTitle>
                      <DialogDescription>
                        Create a new account to join the CA Gun Exchange community.
                      </DialogDescription>
                    </DialogHeader>
                    <RegisterForm onSuccess={() => { setRegisterOpen(false); setMobileMenuOpen(false); }} />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legal Compliance Banner */}
      <div className="bg-forum-warning text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center text-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm">
              IMPORTANT: All firearm transfers must be conducted through licensed FFL dealers in accordance with California law. This platform is for listings only.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
