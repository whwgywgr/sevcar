import { useState, useEffect, lazy, Suspense } from 'react';
import AuthPage from './AuthPage';
import { supabase } from './supabaseClient';
import { NotificationProvider, useNotification } from './Notification';
import BottomNav from './BottomNav';
import FabSpeedDial from './FabSpeedDial';
import './dashboard.css';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line

// Lazy load heavy pages
const LazyFuelRecords = lazy(() => import('./FuelRecords'));
const LazyMaintenanceRecords = lazy(() => import('./MaintenanceRecords'));
const LazyProfilePage = lazy(() => import('./ProfilePage'));
const LazyDashboard = lazy(() => import('./Dashboard'));

function AppContent() {
  const [session, setSession] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showAddFuel, setShowAddFuel] = useState(false);
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const notify = useNotification();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') notify('Logged out', 'success');
      if (event === 'SIGNED_IN') notify('Login successful', 'success');
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [notify]);

  if (!session) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="auth"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          <AuthPage onAuth={() => {
            supabase.auth.getSession().then(({ data }) => setSession(data.session));
            notify('Login successful', 'success');
          }} />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (showProfile || activeTab === 'profile') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="profile"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          <div className="app-bg">
            <div className="app-container">
              <Suspense fallback={<div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>}>
                <LazyProfilePage />
              </Suspense>
            </div>
            <BottomNav
              active="profile"
              onNavigate={tab => {
                setShowProfile(tab === 'profile');
                setActiveTab(tab);
              }}
              onLogout={async () => {
                await supabase.auth.signOut();
                setSession(null);
                notify('Logged out', 'success');
              }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Helper: show FAB only if fuel or maintenance tab is active
  const showFab = activeTab === 'fuel' || activeTab === 'maintenance';

  return (
    <div className="app-bg">
      <div className="app-container">
        <div className="app-grid">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              >
                <Suspense fallback={<div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>}>
                  <LazyDashboard />
                </Suspense>
              </motion.div>
            )}
            {activeTab === 'fuel' && (
              <motion.div
                key="fuel"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              >
                <Suspense fallback={<div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>}>
                  <LazyFuelRecords showAdd={showAddFuel} setShowAdd={setShowAddFuel} />
                </Suspense>
              </motion.div>
            )}
            {activeTab === 'maintenance' && (
              <motion.div
                key="maintenance"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              >
                <Suspense fallback={<div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>}>
                  <LazyMaintenanceRecords showAdd={showAddMaintenance} setShowAdd={setShowAddMaintenance} />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {showFab && (
        <FabSpeedDial
          onAddFuel={() => setShowAddFuel(true)}
          onAddMaintenance={() => setShowAddMaintenance(true)}
        />
      )}
      <BottomNav
        active={activeTab}
        onNavigate={tab => {
          setShowProfile(tab === 'profile');
          setActiveTab(tab);
        }}
        onLogout={async () => {
          await supabase.auth.signOut();
          setSession(null);
          notify('Logged out', 'success');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}
