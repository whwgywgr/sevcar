import { useState, useEffect } from 'react';
import AuthPage from './AuthPage';
import { supabase } from './supabaseClient';
import './App.css';
import FuelRecords from './FuelRecords';
import MaintenanceRecords from './MaintenanceRecords';
import ProfilePage from './ProfilePage';
import { NotificationProvider, useNotification } from './Notification';

function AppContent() {
  const [session, setSession] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
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
    return <AuthPage onAuth={() => {
      supabase.auth.getSession().then(({ data }) => setSession(data.session));
      notify('Login successful', 'success');
    }} />;
  }

  if (showProfile) {
    return (
      <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '1rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Profile</h1>
            <button className="secondary" onClick={() => setShowProfile(false)}>
              Back
            </button>
          </div>
          <ProfilePage />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '1rem' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Car Maintenance & Fuel Tracker</h1>
          <div style={{ display: 'flex', gap: '0.5em' }}>
            <button onClick={() => setShowProfile(true)}>
              Profile
            </button>
            <button className="secondary" onClick={async () => {
              await supabase.auth.signOut();
              setSession(null);
              notify('Logged out', 'success');
            }}>
              Logout
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5em' }}>
          <FuelRecords />
          <MaintenanceRecords />
        </div>
      </div>
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
