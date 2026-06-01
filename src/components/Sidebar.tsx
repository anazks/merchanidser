import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    DollarSign,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Users,
    Tag,
    FileText
} from 'lucide-react';
import { logout, getUser, getUserRole } from '../utils/auth';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
    const navigate = useNavigate();
    const user = getUser();
    const displayName = (user?.fullName as string) || 'Merchandiser';
    const role = getUserRole();

    const baseNavItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/purchase-requests', icon: FileText, label: 'Purchase Request' },
        { path: '/purchase-orders', icon: ClipboardList, label: 'Purchase Orders' },
        { path: '/profile', icon: User, label: 'Profile' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside
            className="h-full flex flex-col transition-all duration-300 relative"
            style={{
                width: isCollapsed ? '72px' : '260px',
                background: 'var(--bg-sidebar)',
                borderRight: '1px solid var(--border-main)',
            }}
        >
            {/* Logo / Brand */}
            <div className="flex items-center gap-3 px-4 h-16 border-b" style={{ borderColor: 'var(--border-main)' }}>
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--brand-lime)' }}
                >
                    <Tag size={18} color="#0A0A0A" strokeWidth={2.5} />
                </div>
                {!isCollapsed && (
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--text-main)' }}>
                            OlaCars
                        </p>
                        <p className="text-[10px] font-medium uppercase tracking-widest text-lime" style={{ color: 'var(--brand-lime)' }}>
                            Merchandiser
                        </p>
                    </div>
                )}
            </div>

            {/* User Info */}
            {!isCollapsed && (
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-main)' }}>
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-main)' }}>
                        {displayName}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Merchandise Manager
                    </p>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
                {baseNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                isActive ? 'text-brand-black font-semibold' : ''
                            }`
                        }
                        style={({ isActive }) => ({
                            background: isActive ? 'var(--brand-lime)' : 'transparent',
                            color: isActive ? '#0A0A0A' : 'var(--sidebar-text)',
                            minHeight: '44px',
                        })}
                    >
                        <item.icon size={20} className="flex-shrink-0" />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="px-2 py-3 border-t" style={{ borderColor: 'var(--border-main)' }}>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200 cursor-pointer"
                    style={{
                        color: 'var(--alert-red)',
                        background: 'transparent',
                        border: 'none',
                        minHeight: '44px',
                    }}
                >
                    <LogOut size={20} className="flex-shrink-0" />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>

            {/* Collapse Toggle Button */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer z-10 transition-all duration-200 hover:scale-110"
                style={{
                    background: 'var(--brand-lime)',
                    color: '#0A0A0A',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
        </aside>
    );
};

export default Sidebar;
