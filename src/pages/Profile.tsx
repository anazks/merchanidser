import { useEffect, useState } from 'react';
import { getUser, getUserRole, logout } from '../utils/auth';
import { useTheme } from '../context/ThemeContext';
import { User, Shield, Key, Sun, Moon, Database, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { theme, toggleTheme } = useTheme();
    const [user, setUserData] = useState<Record<string, unknown> | null>(null);
    const role = getUserRole();

    useEffect(() => {
        setUserData(getUser());
    }, []);

    const handleResetDemoState = () => {
        // Clear local storage keys
        localStorage.removeItem('merch_purchase_orders');
        localStorage.removeItem('merch_valuations');
        localStorage.removeItem('merch_leads');
        
        toast.success('Demo platform state reset to default mock values.');
        
        // Reload page to re-initialize data
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeInUp">
            {/* Header section */}
            <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Account Profile</h2>
                <p className="text-xs text-muted">Manage your personal preferences, view role permissions, or reset app demo data</p>
            </div>

            {/* Profile Detail Card */}
            <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-5">
                <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-lime/30"
                    style={{ background: 'var(--bg-input)' }}
                >
                    <User size={36} className="text-lime" style={{ color: 'var(--brand-lime)' }} />
                </div>

                <div className="text-center sm:text-left flex-1 space-y-1">
                    <h3 className="text-lg font-bold text-main" style={{ color: 'var(--text-main)' }}>
                        {user?.fullName as string || 'OlaCars User'}
                    </h3>
                    <p className="text-sm text-muted" style={{ color: 'var(--text-muted)' }}>
                        {user?.email as string || 'user@olacars.com'}
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/5 border border-white/10 mt-1">
                        <Shield size={12} className="text-lime" style={{ color: 'var(--brand-lime)' }} />
                        <span>{role === 'merchandiser' ? 'Merchandise Manager' : 'Lead Buyer'}</span>
                    </div>
                </div>
            </div>

            {/* Settings block */}
            <div className="glass-card p-5 space-y-5">
                <h3 className="font-bold text-sm border-b pb-3" style={{ borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>Preferences & Administration</h3>
                
                {/* Theme Selector Toggle Row */}
                <div className="flex items-center justify-between py-2">
                    <div>
                        <span className="block text-sm font-semibold text-main" style={{ color: 'var(--text-main)' }}>Visual Theme Color</span>
                        <span className="text-xs text-muted">Choose between light interface and dark coding interface</span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="btn-secondary px-4 py-2 flex items-center gap-2 text-xs font-bold"
                    >
                        {theme === 'dark' ? (
                            <>
                                <Sun size={14} className="text-amber-500" />
                                <span>Switch to Light</span>
                            </>
                        ) : (
                            <>
                                <Moon size={14} className="text-blue-500" />
                                <span>Switch to Dark</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Reset Data State Row */}
                <div className="flex items-center justify-between py-2 border-t" style={{ borderColor: 'var(--border-main)' }}>
                    <div>
                        <span className="block text-sm font-semibold text-main" style={{ color: 'var(--text-main)' }}>Reset Platform Demo State</span>
                        <span className="text-xs text-muted">Reload initial mock data arrays and clear changes for a clean evaluation</span>
                    </div>
                    <button
                        onClick={handleResetDemoState}
                        className="p-2 px-4 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
                    >
                        <span className="flex items-center gap-1.5">
                            <Database size={14} />
                            Reset Data
                        </span>
                    </button>
                </div>

                {/* Sign Out Row */}
                <div className="flex items-center justify-between py-2 border-t" style={{ borderColor: 'var(--border-main)' }}>
                    <div>
                        <span className="block text-sm font-semibold text-main" style={{ color: 'var(--text-main)' }}>Session Access</span>
                        <span className="text-xs text-muted">End your login session and return to the credentials screen</span>
                    </div>
                    <button
                        onClick={logout}
                        className="btn-danger px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                    >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
