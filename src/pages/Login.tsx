import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Eye, EyeOff, Loader2, Sun, Moon } from 'lucide-react';
import { setToken, setUser } from '../utils/auth';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Login = () => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [email, setEmail] = useState('merchandiser@olacars.com');
    const [password, setPassword] = useState('password123');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsLoading(true);

        // Simulate network latency
        setTimeout(() => {
            setIsLoading(false);
            
            // Mock authentication for Merchandiser role only
            const mockUser = { 
                id: 'M-001', 
                email: 'merchandiser@olacars.com', 
                fullName: 'Vikrant Verma', 
                role: 'merchandiser' 
            };

            // Create a mock base64 token representing the user state
            const payload = JSON.stringify({
                ...mockUser,
                exp: Math.floor(Date.now() / 1000) + 3600 * 24 // 24 hours expiry
            });
            const base64Token = btoa(payload);
            
            // Replicate standard format header.payload.signature
            const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64Token}.mocksignature`;

            setToken(mockJwt);
            setUser(mockUser);
            
            toast.success(`Welcome back, ${mockUser.fullName}`);
            navigate('/dashboard', { replace: true });
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
            {/* Top Right Theme Toggle */}
            <div className="absolute top-6 right-6 flex items-center gap-4 z-50 animate-slideInRight">
                <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center p-2 rounded-xl transition-all duration-300 cursor-pointer text-gray-400 hover:text-lime bg-[#00000033] backdrop-blur-md"
                    style={{ border: '1px solid var(--border-main)' }}
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            {/* Glowing background circles */}
            <div
                className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full opacity-[0.15] pointer-events-none z-0"
                style={{ background: 'var(--brand-lime)', filter: 'blur(120px)' }}
            />
            <div
                className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full opacity-[0.05] pointer-events-none z-0"
                style={{ background: '#3498DB', filter: 'blur(150px)' }}
            />

            <div className="w-full max-w-md relative z-10 animate-fadeInUp">
                {/* Logo and Brand Title */}
                <div className="text-center mb-8">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{
                            background: 'var(--brand-lime)',
                            boxShadow: '0 0 50px rgba(200, 230, 0, 0.35)',
                        }}
                    >
                        <Tag size={28} color="#0A0A0A" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-extrabold mb-1 tracking-tight" style={{ color: '#FFFFFF' }}>
                        OlaCars Merchandiser
                    </h1>
                    <p className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        Purchase Orders & Valuations Portal
                    </p>
                </div>

                {/* Login Card */}
                <div 
                    className="glass-card p-8 backdrop-blur-2xl bg-[#00000055] rounded-2xl" 
                    style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                >
                    <div className="text-center mb-6">
                        <span className="text-xs font-semibold text-lime uppercase tracking-widest" style={{ color: 'var(--brand-lime)' }}>
                            Authorized Personnel Sign In
                        </span>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-gray-400">
                                Email Address
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="merchandiser@olacars.com"
                                className="input-field bg-white/5 border-white/10 text-white focus:border-lime/50 w-full"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-gray-400">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field bg-white/5 border-white/10 text-white focus:border-lime/50 pr-12 w-full"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer bg-transparent border-none outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full mt-6 h-12 text-sm font-bold tracking-wide cursor-pointer"
                            id="login-submit"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Verifying Session...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center text-xs mt-6 text-gray-500">
                    <p>Demo account credentials prefilled.</p>
                    <p className="mt-1">
                        Use <span className="text-gray-400 font-semibold">merchandiser@olacars.com</span> to test.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
