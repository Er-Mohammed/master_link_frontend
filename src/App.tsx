import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { TrustedCompanies } from './components/TrustedCompanies';
import { ServicesOverview } from './components/ServicesOverview';
import { WhyChooseUs } from './components/WhyChooseUs';
import { FeaturedProjects } from './components/FeaturedProjects';
import { ProcessSection } from './components/ProcessSection';
import { Testimonials } from './components/Testimonials';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { ConsultationModal } from './components/ConsultationModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';

type AppView = 'landing' | 'admin-login' | 'admin-dashboard';

function AppContent() {
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const { isAuthenticated, isLoading, logout } = useAuth();

  // Determine current view from hash
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const hash = window.location.hash;
    if (hash === '#admin' || hash === '#admin-dashboard' || hash === '#dashboard') return 'admin-dashboard';
    if (hash === '#admin-login') return 'admin-login';
    return 'landing';
  });

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin' || hash === '#admin-dashboard' || hash === '#dashboard') {
        setCurrentView('admin-dashboard');
      } else if (hash === '#admin-login') {
        setCurrentView('admin-login');
      } else {
        setCurrentView('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Top scroll progress spring
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const openConsultation = () => setIsConsultationOpen(true);
  const closeConsultation = () => setIsConsultationOpen(false);

  // Navigate helpers
  const goToLanding = () => {
    window.location.hash = '#home';
    setCurrentView('landing');
  };

  const goToAdminDashboard = () => {
    window.location.hash = '#admin';
    setCurrentView('admin-dashboard');
  };

  const handleLogout = async () => {
    await logout();
    window.location.hash = '#admin-login';
    setCurrentView('admin-login');
  };

  // Auth loading state
  if (isLoading && (currentView === 'admin-dashboard' || currentView === 'admin-login')) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-3 border-[#F20530] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Admin Dashboard — requires authentication
  if (currentView === 'admin-dashboard') {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.hash = '#admin-login';
      return (
        <AdminLogin
          onBackToLanding={goToLanding}
          onLoginSuccess={goToAdminDashboard}
        />
      );
    }
    return (
      <AdminDashboard onLogout={handleLogout} />
    );
  }

  // Admin Login page
  if (currentView === 'admin-login') {
    if (isAuthenticated) {
      // Already authenticated, go to dashboard
      window.location.hash = '#admin';
      return (
        <AdminDashboard onLogout={handleLogout} />
      );
    }
    return (
      <AdminLogin
        onBackToLanding={goToLanding}
        onLoginSuccess={goToAdminDashboard}
      />
    );
  }

  // Landing page (default)
  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans selection:bg-[#F20530] selection:text-white antialiased relative">
      
      {/* Scroll Progress Bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F20530] via-[#5683FC] to-[#2EDFF2] z-50 origin-left pointer-events-none shadow-[0_0_12px_rgba(242,5,48,0.5)]"
      />

      {/* Navigation Bar */}
      <Navigation onOpenConsultation={openConsultation} />

      {/* Hero Section */}
      <Hero onOpenConsultation={openConsultation} />

      {/* Interactive Services / Capabilities Grid */}
      <ServicesOverview />

      {/* Meticulous Why Partner Us section */}
      <WhyChooseUs />

      {/* Featured Case Studies */}
      <FeaturedProjects onOpenConsultation={openConsultation} />

      {/* Step-by-step Process Blueprint */}
      <ProcessSection />

      {/* Client Endorsements */}
      <Testimonials />

      {/* Client Logos / Trusted Companies Section */}
      <TrustedCompanies />

      {/* Call to Action and Booking */}
      <CTASection onOpenConsultation={openConsultation} />

      {/* Footers with dynamic translation support */}
      <Footer />

      {/* Full Interactive Custom Diagnostic Form & Scheduler Modal */}
      <ConsultationModal isOpen={isConsultationOpen} onClose={closeConsultation} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
