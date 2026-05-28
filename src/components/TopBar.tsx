import { Menu, Sun, Moon, Car } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';

interface TopBarProps {
    onMenuClick: () => void;
}

const TopBar = ({ onMenuClick }: TopBarProps) => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    // Generate dynamic page title based on path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/dashboard')) return 'Dashboard Analytics';
        if (path.includes('/purchase-orders')) return 'Purchase Orders';
        if (path.includes('/valuations')) return 'Trade-In Valuations';
        if (path.includes('/leads')) return 'Sales Leads';
        if (path.includes('/profile')) return 'My Profile';
        return 'OlaCars Merchandiser';
    };

    return (
        <header
            className="h-16 flex items-center justify-between px-4 lg:px-6 border-b flex-shrink-0"
            style={{
                background: 'var(--bg-topbar)',
                borderColor: 'var(--border-main)',
            }}
        >
            {/* Hamburger for mobile/tablet & Title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="btn-icon lg:hidden"
                    id="topbar-menu-toggle"
                >
                    <Menu size={20} />
                </button>
                <div className="hidden md:flex items-center gap-2">
                    <Car size={18} className="text-lime" style={{ color: 'var(--brand-lime)' }} />
                    <span className="text-sm font-semibold tracking-wider uppercase text-dim" style={{ color: 'var(--text-dim)' }}>
                        Merchandise Platform
                    </span>
                    <span className="text-xs text-dim" style={{ color: 'var(--border-main)' }}>|</span>
                </div>
                <h1 className="text-base font-bold tracking-tight text-main" style={{ color: 'var(--text-main)' }}>
                    {getPageTitle()}
                </h1>
            </div>

            {/* Right-side actions */}
            <div className="flex items-center gap-4">
                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="btn-icon"
                    id="topbar-theme-toggle"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>
        </header>
    );
};

export default TopBar;
