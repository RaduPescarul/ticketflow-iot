import React, { useState, useEffect } from 'react';
import api from './api';
import LiquidBackground from './components/LiquidBackground';
import AuthModal from './components/AuthModal';
import InteractiveSeating from './components/InteractiveSeating';
import GateSimulator from './components/GateSimulator';
import OrganizerStudio from './components/OrganizerStudio';
import AdminFleetMonitor from './components/AdminFleetMonitor';
import ThemeSwitch from './components/ThemeSwitch';

function App() {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('tf_theme');
        return saved ? saved === 'dark' : true;
    });

    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('tf_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [activeTab, setActiveTab] = useState('catalog');
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const mode = darkMode ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', mode);
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('tf_theme', mode);
    }, [darkMode]);

    const showToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    };

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTickets = async () => {
        if (!user) return;
        try {
            const res = await api.get('/tickets/my');
            setTickets(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchEvents();
            fetchTickets();
        }
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem('tf_token');
        localStorage.removeItem('tf_user');
        setUser(null);
        setSelectedEvent(null);
        setActiveTab('catalog');
    };

    if (!user) {
        return (
            <>
                <LiquidBackground darkMode={darkMode} />
                <AuthModal
                    onAuthSuccess={(u) => setUser(u)}
                    showToast={showToast}
                    darkMode={darkMode}
                    onToggleDarkMode={() => setDarkMode(!darkMode)}
                />
                <ToastContainer toasts={toasts} />
            </>
        );
    }

    const filteredEvents = events.filter(ev => {
        const matchesCat = selectedCategory === 'All' || ev.category === selectedCategory;
        const matchesQuery =
            ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ev.venue.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
    });

    return (
        <div className="min-h-screen flex flex-col relative">
            <LiquidBackground darkMode={darkMode} />

            {/* Floating Dock */}
            <header className="sticky top-4 z-40 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto saglix-glass rounded-full px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
                    <button
                        onClick={() => { setSelectedEvent(null); setActiveTab('catalog'); }}
                        className="flex items-center gap-2.5 text-left"
                    >
                        <span className="font-bold text-base tracking-tight theme-text">TicketFlow</span>
                    </button>

                    <nav className="flex items-center gap-1 clean-well p-1 rounded-full">
                        <button
                            onClick={() => { setSelectedEvent(null); setActiveTab('catalog'); }}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                                activeTab === 'catalog' ? 'theme-tab-active shadow-sm' : 'theme-tab-inactive'
                            }`}
                        >
                            Explore
                        </button>
                        <button
                            onClick={() => setActiveTab('tickets')}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                                activeTab === 'tickets' ? 'theme-tab-active shadow-sm' : 'theme-tab-inactive'
                            }`}
                        >
                            <span>Wallet</span>
                            <span className="text-[10px] font-mono px-1.5 rounded-full opacity-80">
                {tickets.length}
              </span>
                        </button>
                        {(user.role === 'ORGANIZER' || user.role === 'ADMIN') && (
                            <button
                                onClick={() => setActiveTab('organizer')}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                                    activeTab === 'organizer' ? 'theme-tab-active shadow-sm' : 'theme-tab-inactive'
                                }`}
                            >
                                Studio
                            </button>
                        )}
                        {user.role === 'ADMIN' && (
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                                    activeTab === 'admin' ? 'theme-tab-active shadow-sm' : 'theme-tab-inactive'
                                }`}
                            >
                                Fleet
                            </button>
                        )}
                    </nav>

                    <div className="flex items-center gap-3">
                        <ThemeSwitch darkMode={darkMode} onToggle={() => setDarkMode(!darkMode)} />
                        <span className="hidden md:inline text-xs theme-text-secondary font-medium">{user.fullName}</span>
                        <button
                            onClick={handleLogout}
                            className="px-3.5 py-1.5 rounded-full theme-chip text-xs font-semibold transition"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <ToastContainer toasts={toasts} />

            <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'catalog' && !selectedEvent && (
                    <div className="space-y-8">
                        {/* Hero Banner */}
                        <div className="saglix-glass rounded-[32px] p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="max-w-xl space-y-2">
                                <p className="text-xs font-mono uppercase tracking-widest theme-text-muted font-semibold">Spatial Ticketing</p>
                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight theme-text">
                                    Live Events. Seamless Entry.
                                </h1>
                                <p className="text-sm theme-text-secondary leading-relaxed">
                                    Select exact seats, store cryptographic passes in your Wallet, and walk straight through optical gates.
                                </p>
                            </div>

                            <div className="w-full lg:w-80 space-y-3">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search events or venues..."
                                    className="w-full px-4 py-2.5 rounded-full clean-well text-sm focus:outline-none"
                                />
                                <div className="flex flex-wrap gap-1.5">
                                    {['All', 'Concerts', 'Festivals', 'Theater', 'Comedy'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                                                selectedCategory === cat ? 'theme-tab-active' : 'theme-chip'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Event Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredEvents.map(ev => (
                                <div key={ev.id} className="clean-glass-card rounded-[28px] p-7 flex flex-col justify-between gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="px-3 py-1 rounded-full theme-chip font-semibold">{ev.category}</span>
                                            <span className="font-mono font-semibold text-emerald-500">{ev.totalCapacity - ev.soldCount} seats left</span>
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight theme-text">{ev.title}</h3>
                                        <div className="text-xs theme-text-secondary space-y-0.5">
                                            <p>{ev.venue}</p>
                                            <p className="font-mono theme-text-muted">{ev.date}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t theme-divider flex items-center justify-between">
                                        <div>
                                            <p className="text-[11px] theme-text-muted">From</p>
                                            <p className="text-lg font-bold font-mono theme-text">{ev.gaPrice} RON</p>
                                        </div>
                                        <button onClick={() => setSelectedEvent(ev)} className="px-5 py-2.5 rounded-full apple-pill font-bold text-xs">
                                            Select Seats
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'catalog' && selectedEvent && (
                    <InteractiveSeating
                        event={selectedEvent}
                        user={user}
                        onBack={() => { setSelectedEvent(null); fetchEvents(); }}
                        onCheckoutSuccess={() => {
                            setSelectedEvent(null);
                            fetchEvents();
                            fetchTickets();
                            setActiveTab('tickets');
                        }}
                        showToast={showToast}
                    />
                )}

                {activeTab === 'tickets' && (
                    <GateSimulator
                        tickets={tickets}
                        onRefreshTickets={fetchTickets}
                        onBuyMore={() => { setSelectedEvent(null); setActiveTab('catalog'); }}
                        showToast={showToast}
                    />
                )}

                {activeTab === 'organizer' && (
                    <OrganizerStudio events={events} onEventCreated={fetchEvents} showToast={showToast} />
                )}

                {activeTab === 'admin' && (
                    <AdminFleetMonitor showToast={showToast} />
                )}
            </main>
        </div>
    );
}

const ToastContainer = ({ toasts }) => (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto saglix-glass px-4 py-3 rounded-full text-xs font-semibold theme-text shadow-2xl flex items-center gap-2.5">
        <span className={`w-2 h-2 rounded-full shrink-0 ${
            t.type === 'success' ? 'bg-emerald-500' : t.type === 'error' ? 'bg-rose-500' : 'bg-slate-400'
        }`} />
                <p>{t.message}</p>
            </div>
        ))}
    </div>
);

export default App;