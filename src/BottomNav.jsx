// BottomNav.jsx - Responsive bottom navigation bar with icons only
import React from 'react';

const icons = {
    home: (
        <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12L12 4l9 8" /><path d="M9 21V9h6v12" /></svg>
    ),
    profile: (
        <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-7 8-7s8 3 8 7" /></svg>
    ),
    fuel: (
        <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="13" height="13" rx="2" /><path d="M16 3v4a2 2 0 0 0 2 2h3" /><path d="M17 17v.01" /></svg>
    ),
    maintenance: (
        <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
    ),
    logout: (
        <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7" /><path d="M3 21V3" /></svg>
    ),
};

export default function BottomNav({ active, onNavigate, onLogout }) {
    return (
        <nav className="bottom-nav">
            <button className={`bottom-nav-btn${active === 'home' ? ' active' : ''}`} onClick={() => onNavigate('home')} aria-label="Home">{icons.home}</button>
            <button className={`bottom-nav-btn${active === 'profile' ? ' active' : ''}`} onClick={() => onNavigate('profile')} aria-label="Profile">{icons.profile}</button>
            <button className={`bottom-nav-btn${active === 'fuel' ? ' active' : ''}`} onClick={() => onNavigate('fuel')} aria-label="Fuel">{icons.fuel}</button>
            <button className={`bottom-nav-btn${active === 'maintenance' ? ' active' : ''}`} onClick={() => onNavigate('maintenance')} aria-label="Maintenance">{icons.maintenance}</button>
            <button className="bottom-nav-btn" onClick={onLogout} aria-label="Logout">{icons.logout}</button>
        </nav>
    );
}
