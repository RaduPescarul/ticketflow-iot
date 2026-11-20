import React, { useState, useEffect } from 'react';
import api from '../api';

const InteractiveSeating = ({ event, user, onBack, onCheckoutSuccess, showToast }) => {
    const [seats, setSeats] = useState([]);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('apple');

    const fetchSeats = async () => {
        try {
            const res = await api.get(`/events/${event.id}/seats`);
            setSeats(res.data);
        } catch (err) {
            showToast('Failed to load seats', 'error');
        }
    };

    useEffect(() => {
        fetchSeats();
    }, [event.id]);

    const myLockedSeats = seats.filter(s => s.status === 'LOCKED' && s.lockedByUserId === user.id);

    useEffect(() => {
        if (myLockedSeats.length === 0) {
            setSecondsLeft(0);
            return;
        }
        setSecondsLeft(300);
        const timer = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    fetchSeats();
                    showToast('Seat reservation expired.', 'warning');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [myLockedSeats.length]);

    const handleSeatClick = async (seat) => {
        if (seat.status === 'SOLD') return;
        if (seat.status === 'LOCKED' && seat.lockedByUserId !== user.id) {
            showToast('Seat is held by another guest.', 'warning');
            return;
        }
        if (seat.status === 'AVAILABLE' && myLockedSeats.length >= 6) {
            showToast('Maximum 6 seats per order.', 'warning');
            return;
        }
        try {
            await api.post(`/seats/${seat.id}/toggle-lock`);
            await fetchSeats();
        } catch (err) {
            showToast(err.response?.data?.message || 'Seat unavailable', 'error');
            fetchSeats();
        }
    };

    const handleCheckout = async () => {
        try {
            const seatIds = myLockedSeats.map(s => s.id);
            const res = await api.post('/orders/checkout', { eventId: event.id, seatIds, paymentMethod });
            showToast(`Issued ${res.data.issuedCount} pass(es) to Wallet.`, 'success');
            onCheckoutSuccess();
        } catch (err) {
            showToast(err.response?.data?.message || 'Checkout failed', 'error');
        }
    };

    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const totalAmount = myLockedSeats.reduce((sum, s) => sum + s.price, 0);
    const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const secs = String(secondsLeft % 60).padStart(2, '0');

    return (
        <div className="space-y-6">
            <div className="saglix-glass rounded-[28px] p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <button onClick={onBack} className="w-9 h-9 rounded-full apple-pill flex items-center justify-center text-sm font-bold">
                        ←
                    </button>
                    <div>
                        <h2 className="text-lg font-bold theme-text">{event.title}</h2>
                        <p className="text-xs theme-text-secondary">{event.venue} • {event.date}</p>
                    </div>
                </div>

                {myLockedSeats.length > 0 && (
                    <div className="px-4 py-1.5 rounded-full apple-pill font-mono text-xs font-semibold text-amber-500">
                        Hold: {mins}:{secs}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 saglix-glass rounded-[28px] p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                            <span className="text-xs font-semibold theme-text-secondary">Select Seats</span>
                            <div className="flex items-center gap-3 text-[11px] theme-text-secondary">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> VIP</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Golden</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400/60 inline-block" /> General</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Yours</span>
                            </div>
                        </div>

                        <div className="w-3/4 mx-auto h-8 rounded-t-full clean-well flex items-center justify-center mb-6">
                            <span className="text-[10px] font-mono tracking-[0.25em] theme-text-muted uppercase font-semibold">Stage</span>
                        </div>

                        <div className="space-y-2.5 max-w-lg mx-auto overflow-x-auto py-2">
                            {rows.map(rowChar => {
                                const rowSeats = seats.filter(s => s.seatIdentifier.startsWith(rowChar));
                                if (rowSeats.length === 0) return null;
                                return (
                                    <div key={rowChar} className="flex items-center justify-center gap-2">
                                        <span className="w-5 text-[11px] font-mono theme-text-muted text-right">{rowChar}</span>
                                        <div className="flex items-center gap-1.5">
                                            {rowSeats.map((s, idx) => {
                                                const isMine = s.status === 'LOCKED' && s.lockedByUserId === user.id;
                                                const isUnavailable = s.status === 'SOLD' || (s.status === 'LOCKED' && !isMine);
                                                const aisle = idx === 3 ? 'mr-4' : '';

                                                let style = 'theme-chip theme-text';
                                                if (s.tier.includes('VIP')) {
                                                    style = 'bg-amber-400/20 border border-amber-400/50 theme-text backdrop-blur-md';
                                                } else if (s.tier.includes('Golden')) {
                                                    style = 'bg-sky-400/20 border border-sky-400/50 theme-text backdrop-blur-md';
                                                }

                                                if (isMine) style = 'bg-emerald-500/80 border border-emerald-300 text-white font-bold scale-105 shadow-lg backdrop-blur-md';
                                                if (isUnavailable) style = 'clean-well opacity-25 cursor-not-allowed';

                                                return (
                                                    <button
                                                        key={s.id}
                                                        disabled={isUnavailable}
                                                        onClick={() => handleSeatClick(s)}
                                                        className={`w-8 h-8 rounded-lg font-mono text-[11px] transition ${style} ${aisle}`}
                                                    >
                                                        {s.seatIdentifier}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <span className="w-16 text-[11px] font-mono theme-text-muted pl-1">{rowSeats[0]?.price} RON</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="saglix-glass rounded-[28px] p-6 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-bold text-base theme-text">Order Summary</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {myLockedSeats.length === 0 ? (
                                <p className="text-xs theme-text-muted py-10 text-center">Tap any available seat on the map.</p>
                            ) : (
                                myLockedSeats.map(s => (
                                    <div key={s.id} className="flex items-center justify-between clean-well rounded-2xl px-3.5 py-2.5">
                                        <div>
                                            <p className="text-xs font-semibold theme-text">Seat {s.seatIdentifier}</p>
                                            <p className="text-[11px] theme-text-secondary">{s.tier}</p>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <span className="font-mono text-xs font-semibold theme-text">{s.price} RON</span>
                                            <button onClick={() => handleSeatClick(s)} className="theme-text-muted hover:opacity-80 text-xs">✕</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 border-t theme-divider pt-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs theme-text-secondary">Total</span>
                            <span className="font-mono text-xl font-bold theme-text">{totalAmount} RON</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('apple')}
                                className={`py-2.5 rounded-full text-xs font-semibold transition ${
                                    paymentMethod === 'apple' ? 'apple-pill' : 'theme-chip'
                                }`}
                            >
                                 Pay
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('card')}
                                className={`py-2.5 rounded-full text-xs font-semibold transition ${
                                    paymentMethod === 'card' ? 'apple-pill' : 'theme-chip'
                                }`}
                            >
                                Card
                            </button>
                        </div>

                        <button
                            disabled={myLockedSeats.length === 0}
                            onClick={handleCheckout}
                            className={`w-full py-3 rounded-full font-bold text-xs transition ${
                                myLockedSeats.length === 0 ? 'theme-chip opacity-40 cursor-not-allowed' : 'apple-pill'
                            }`}
                        >
                            {myLockedSeats.length === 0 ? 'Select Seats' : `Pay ${totalAmount} RON`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteractiveSeating;