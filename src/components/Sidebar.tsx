import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    ShoppingCart
} from 'lucide-react';
import { logout, getUser, getUserRole } from '../utils/auth';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

interface SubItem {
    label: string;
    path: string;
}

interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: SubItem[];
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [openSection, setOpenSection] = useState<string | null>(null);

    const user = getUser();
    const displayName = (user?.fullName as string) || 'Merchandiser';
    const roleName = getUserRole() || 'Merchandise Manager';

    const menuItems: MenuItem[] = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard size={22} />,
            path: '/dashboard'
        },
        {
            id: 'purchase',
            label: 'Purchase',
            icon: <ShoppingCart size={22} />,
            subItems: [
                { label: 'Purchase Request', path: '/purchase-requests' },
                { label: 'Purchase Orders', path: '/purchase-orders' }
            ]
        },
        {
            id: 'profile',
            label: 'Profile',
            icon: <User size={22} />,
            path: '/profile'
        }
    ];

    const isActive = (path: string) => {
        if (!path) return false;
        if (path === '/dashboard') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    useEffect(() => {
        const activeItem = menuItems.find(item =>
            item.subItems?.some(sub => isActive(sub.path))
        );
        if (activeItem) {
            setOpenSection(activeItem.id);
        }
    }, [location.pathname]);

    const toggleSection = (id: string) => {
        setOpenSection(prev => prev === id ? null : id);
    };

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside
            className="w-full h-full flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out relative bg-[var(--bg-sidebar)] border-r border-[var(--border-main)]"
            style={{ width: isCollapsed ? '72px' : '260px' }}
        >
            {/* Logo Header */}
            <div className="h-20 flex items-center border-b border-[var(--border-main)] px-6 justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center border-2 border-[#D4F12E] overflow-hidden flex-shrink-0">
                        <div className="bg-black w-[22px] h-[22px] rounded-full flex items-center justify-center">
                            <div className="bg-[#D4F12E] w-2.5 h-2.5 rounded-full"></div>
                        </div>
                    </div>
                    {!isCollapsed && (
                        <div className="flex items-center border-l border-[var(--border-main)] h-7 pl-3 ml-1">
                            <span className="text-[var(--text-main)] font-bold tracking-widest text-[16px] uppercase whitespace-nowrap">Ola Cars</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto pt-6 custom-scrollbar overflow-x-hidden">
                <div className="space-y-1">
                    {menuItems.map((item) => {
                        const hasSub = item.subItems && item.subItems.length > 0;
                        const isOpen = openSection === item.id;
                        const hasActiveSub = item.subItems?.some(sub => isActive(sub.path));
                        const isCurrentlyActive = item.path ? isActive(item.path) : (hasSub ? hasActiveSub : false);

                        return (
                            <div key={item.id}>
                                <div
                                    onClick={() => {
                                        if (isCollapsed && onToggle) {
                                            onToggle();
                                            if (hasSub) {
                                                setOpenSection(item.id);
                                            } else if (item.path) {
                                                handleNavigation(item.path);
                                            }
                                        } else {
                                            if (hasSub) {
                                                toggleSection(item.id);
                                            } else if (item.path) {
                                                handleNavigation(item.path);
                                            }
                                        }
                                    }}
                                    className={`group relative flex items-center gap-4 px-6 py-3.5 cursor-pointer transition-all duration-200
                                        ${isCurrentlyActive ? 'bg-[var(--sidebar-hover)]/80' : 'hover:bg-[var(--sidebar-hover)]'}
                                        ${isCollapsed ? 'justify-center px-0' : ''}
                                    `}
                                    style={{
                                        borderLeft: isCurrentlyActive ? '4px solid var(--sidebar-active)' : '4px solid transparent',
                                    }}
                                >
                                    <div className={`${isCurrentlyActive ? 'text-[var(--sidebar-active)]' : 'text-[var(--sidebar-text)] group-hover:text-[var(--text-main)]'} transition-colors`}>
                                        {item.icon}
                                    </div>
                                    {!isCollapsed && (
                                        <div className="flex items-center justify-between w-full">
                                            <span className={`text-[15px] font-medium transition-colors ${isCurrentlyActive ? 'text-[var(--text-main)]' : 'text-[var(--sidebar-text)] group-hover:text-[var(--text-main)]'}`}>
                                                {item.label}
                                            </span>
                                            {hasSub && (
                                                <span className="text-[var(--sidebar-text)]/50 group-hover:text-[var(--sidebar-text)]">
                                                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {!isCollapsed && hasSub && (
                                    <div
                                        className={`ml-12 pl-4 relative border-l border-[var(--border-main)] flex flex-col gap-0.5 transition-all duration-300 ease-in-out overflow-hidden
                                            ${isOpen ? 'max-h-[500px] opacity-100 mt-1 mb-2 py-1' : 'max-h-0 opacity-0 mt-0 mb-0 py-0'}
                                        `}
                                    >
                                        {item.subItems!.map((sub, idx) => {
                                            const isItActive = isActive(sub.path);
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => handleNavigation(sub.path)}
                                                    className={`cursor-pointer py-2 text-sm transition-colors
                                                        ${isItActive ? 'text-[var(--sidebar-active)] font-medium' : 'text-[var(--sidebar-text)] hover:text-[var(--text-main)]'}
                                                    `}
                                                >
                                                    {sub.label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* User Profile Section */}
            <div className="mt-auto border-t border-[var(--border-main)] px-6 py-4">
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center px-0' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-input)] overflow-hidden border-2 border-[#D4F12E] flex-shrink-0 flex items-center justify-center">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} className="text-[var(--sidebar-text)]" />
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-[var(--text-main)] text-sm font-semibold truncate">{displayName}</span>
                            <span className="text-[var(--sidebar-text)] text-xs truncate">{roleName}</span>
                            <button
                                onClick={handleLogout}
                                className="text-xs text-red-400 hover:text-red-300 bg-red-900/30 px-2 py-0.5 rounded mt-1 inline-block w-fit cursor-pointer border-none"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
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
