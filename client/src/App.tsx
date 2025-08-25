import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/theme-provider";
import Home from "@/pages/home";
import CategoryPage from "@/pages/category";
import PostDetail from "@/pages/post-detail";
import CreatePost from "@/pages/create-post";
import EditPost from "@/pages/edit-post";
import AuthPage from "@/pages/auth";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import GuidelinesPage from "@/pages/guidelines";
import ContactPage from "@/pages/contact";
import SafetyPage from "@/pages/safety";
import ReportPage from "@/pages/report";
import AdminDashboard from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import MessagesPage from "@/pages/messages";
import ProfilePage from "@/pages/profile";
import PublicProfile from "@/pages/public-profile";
import AdvertisePage from "@/pages/advertise";
import SearchPage from "@/pages/search";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/posts/:id" component={PostDetail} />
      <Route path="/posts/:id/edit" component={EditPost} />
      <Route path="/create-post" component={CreatePost} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/guidelines" component={GuidelinesPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/safety" component={SafetyPage} />
      <Route path="/report" component={ReportPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/user/:id" component={PublicProfile} />
      <Route path="/advertise" component={AdvertisePage} />
      <Route path="/search" component={SearchPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ca-gun-exchange-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
