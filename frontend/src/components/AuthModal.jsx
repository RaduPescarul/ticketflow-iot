import React, { useState } from 'react';
import api from '../api';
import ThemeSwitch from './ThemeSwitch';

const AuthModal = ({ onAuthSuccess, showToast, darkMode, onToggleDarkMode }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('client@ticketflow.ro');
    const [password, setPassword] = useState('client123');
    const [role, setRole] = useState('CLIENT');
    const [loading, setLoading] = useState(false);

    const quickFill = (demoEmail, demoPwd) => {
        setIsRegister(false);
        setEmail(demoEmail);
        setPassword(demoPwd);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = isRegister ? '/auth/register' : '/auth/login';
            const payload = isRegister ? { fullName, email, password, role } : { email, password };
            const res = await api.post(endpoint, payload);
            localStorage.setItem('tf_token', res.data.token);
            localStorage.setItem('tf_user', JSON.stringify(res.data.user));
            onAuthSuccess(res.data.user);
            showToast(`Signed in as ${res.data.user.fullName}`, 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Authentication failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="fixed top-5 right-5 z-20">
                <ThemeSwitch darkMode={darkMode} onToggle={onToggleDarkMode} />
            </div>

            <div className="saglix-glass z-10 max-w-md w-full rounded-[32px] p-8 sm:p-10 space-y-6">
                <div className="text-center space-y-1.5">
                    <h1 className="text-2xl font-bold tracking-tight theme-text">TicketFlow</h1>
                    <p className="text-xs theme-text-secondary">Spatial Event Access &amp; Smart Ticketing</p>
                </div>

                <div className="clean-well rounded-2xl p-1.5 grid grid-cols-3 gap-1">
                    <button
                        type="button"
                        onClick={() => quickFill('client@ticketflow.ro', 'client123')}
                        className={`py-2 rounded-xl text-xs font-semibold transition ${
                            email === 'client@ticketflow.ro' && !isRegister ? 'theme-tab-active shadow-sm' : 'theme-tab-inactive'
                        }`}
                    >
                        Client
                    </button>
                    <button
                        type="button"
                        onClick={() => quickFill('organizer@ticketflow.ro', 'org123')}
                        className={`py-2 rounded-xl text-xs font-semibold transition ${
                            email === 'organizer@ticketflow.ro' && !isRegister ? 'theme-tab-active shadow-sm' : 'theme-tab-inactive'
                        }`}
                    >
                        Organizer
                    </button>
                    <button
                        type="button"
                        onClick={() => quickFill('admin@ticketflow.ro', 'admin123')}
                        className={`py-2 rounded-xl text-xs font-semibold transition ${
                            email === 'admin@ticketflow.ro' && !isRegister ? 'theme-tab-active shadow-sm' : 'theme-tab-inactive'
                        }`}
                    >
                        Admin
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <>
                            <input
                                required
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Full Name"
                                className="w-full px-4 py-3 rounded-2xl clean-well text-sm focus:outline-none"
                            />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl clean-well text-sm focus:outline-none"
                            >
                                <option value="CLIENT" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Client</option>
                                <option value="ORGANIZER" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Organizer</option>
                            </select>
                        </>
                    )}

                    <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full px-4 py-3 rounded-2xl clean-well text-sm focus:outline-none"
                    />

                    <input
                        required
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-3 rounded-2xl clean-well text-sm focus:outline-none"
                    />

                    <button disabled={loading} type="submit" className="w-full py-3.5 rounded-full apple-pill font-bold text-sm">
                        {loading ? 'Signing in...' : isRegister ? 'Create Account' : 'Continue'}
                    </button>
                </form>

                <div className="text-center pt-2">
                    <button
                        type="button"
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-xs theme-text-secondary hover:opacity-80 font-medium transition"
                    >
                        {isRegister ? 'Already have an account? Sign In' : 'Create a new account'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;