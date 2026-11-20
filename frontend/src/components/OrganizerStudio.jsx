import React, { useState, useEffect } from 'react';
import api from '../api';

const OrganizerStudio = ({ events, onEventCreated, showToast }) => {
    const [stats, setStats] = useState({ totalRevenue: 0, totalSold: 0, totalCapacity: 192, totalTickets: 0, usedTickets: 0 });
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Concerts');
    const [eventDate, setEventDate] = useState('Dec 18, 2026 • 20:00');
    const [venue, setVenue] = useState('');
    const [vipPrice, setVipPrice] = useState(320);
    const [gaPrice, setGaPrice] = useState(140);

    const fetchStats = async () => {
        try {
            const res = await api.get('/organizer/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [events]);

    const handlePublish = async (e) => {
        e.preventDefault();
        try {
            await api.post('/organizer/events', {
                title,
                category,
                eventDate,
                venue,
                vipPrice: Number(vipPrice),
                gaPrice: Number(gaPrice),
            });
            setTitle('');
            setVenue('');
            showToast(`"${title}" published.`, 'success');
            onEventCreated();
            fetchStats();
        } catch (err) {
            showToast('Organizer or Admin role required.', 'error');
        }
    };

    const checkinRate = stats.totalTickets > 0 ? Math.round((stats.usedTickets / stats.totalTickets) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="saglix-glass rounded-[24px] p-5">
                    <p className="text-xs theme-text-muted">Revenue</p>
                    <p className="text-2xl font-bold font-mono theme-text mt-1">{Number(stats.totalRevenue).toLocaleString()} RON</p>
                </div>
                <div className="saglix-glass rounded-[24px] p-5">
                    <p className="text-xs theme-text-muted">Seats Sold</p>
                    <p className="text-2xl font-bold font-mono theme-text mt-1">{stats.totalSold} / {stats.totalCapacity}</p>
                </div>
                <div className="saglix-glass rounded-[24px] p-5">
                    <p className="text-xs theme-text-muted">Check-In Rate</p>
                    <p className="text-2xl font-bold font-mono theme-text mt-1">{checkinRate}%</p>
                </div>
                <div className="saglix-glass rounded-[24px] p-5">
                    <p className="text-xs theme-text-muted">Gate Savings</p>
                    <p className="text-2xl font-bold font-mono theme-text mt-1">4,200 RON</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 saglix-glass rounded-[28px] p-6">
                    <h3 className="text-base font-bold theme-text mb-4">Publish Event</h3>
                    <form onSubmit={handlePublish} className="space-y-3.5">
                        <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Title" className="w-full px-4 py-2.5 rounded-2xl clean-well text-sm focus:outline-none" />
                        <div className="grid grid-cols-2 gap-3">
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3.5 py-2.5 rounded-2xl clean-well text-sm focus:outline-none">
                                <option value="Concerts" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Concerts</option>
                                <option value="Festivals" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Festivals</option>
                                <option value="Theater" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Theater</option>
                                <option value="Comedy" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Comedy</option>
                            </select>
                            <input required type="text" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-2xl clean-well text-sm focus:outline-none" />
                        </div>
                        <input required type="text" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Venue & City" className="w-full px-4 py-2.5 rounded-2xl clean-well text-sm focus:outline-none" />
                        <div className="grid grid-cols-2 gap-3">
                            <input required type="number" min="50" value={vipPrice} onChange={(e) => setVipPrice(e.target.value)} placeholder="VIP (RON)" className="w-full px-4 py-2.5 rounded-2xl clean-well text-sm font-mono focus:outline-none" />
                            <input required type="number" min="20" value={gaPrice} onChange={(e) => setGaPrice(e.target.value)} placeholder="GA (RON)" className="w-full px-4 py-2.5 rounded-2xl clean-well text-sm font-mono focus:outline-none" />
                        </div>
                        <button type="submit" className="w-full py-3 rounded-full apple-pill font-bold text-xs">
                            Publish
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-7 saglix-glass rounded-[28px] p-6 space-y-4">
                    <h3 className="text-base font-bold theme-text">Venue Occupancy</h3>
                    <div className="space-y-3">
                        {events.map(ev => {
                            const pct = Math.round((ev.soldCount / ev.totalCapacity) * 100);
                            return (
                                <div key={ev.id} className="clean-well rounded-2xl p-4 space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-semibold theme-text">{ev.title}</span>
                                        <span className="font-mono theme-text-secondary">{ev.soldCount}/{ev.totalCapacity} ({pct}%)</span>
                                    </div>
                                    <div className="w-full h-2 clean-well rounded-full overflow-hidden">
                                        <div className="h-full apple-pill rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerStudio;