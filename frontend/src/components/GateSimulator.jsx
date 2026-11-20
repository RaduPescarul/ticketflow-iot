import React, { useState } from 'react';
import api from '../api';

const DeterministicQR = ({ seed }) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    const size = 11;
    const rects = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const isCorner = (r < 3 && c < 3) || (r < 3 && c >= size - 3) || (r >= size - 3 && c < 3);
            const filled = isCorner || (Math.abs((hash * (r + 3) * (c + 7) + r * 13 + c * 17)) % 3 === 0);
            if (filled) {
                rects.push(<rect key={`${r}-${c}`} x={c * 8 + 6} y={r * 8 + 6} width="7" height="7" rx="1.6" fill="#05060a" />);
            }
        }
    }
    return <svg viewBox="0 0 100 100" className="w-20 h-20 bg-white/90 p-1.5 rounded-xl border border-white/40 shadow-sm">{rects}</svg>;
};

const GateSimulator = ({ tickets, onRefreshTickets, onBuyMore, showToast }) => {
    const [gateName, setGateName] = useState('GATE-01 Main Entrance');
    const [manualToken, setManualToken] = useState('');
    const [scanState, setScanState] = useState('IDLE');
    const [statusTitle, setStatusTitle] = useState('Ready to Scan');
    const [statusSub, setStatusSub] = useState('Tap a pass to unlock the turnstile.');
    const [armOpen, setArmOpen] = useState(false);

    const triggerScan = async (qrHash) => {
        try {
            const res = await api.post('/tickets/validate', { qrHash, gateName });
            setScanState('GRANTED');
            setStatusTitle('Access Granted');
            setStatusSub(`${res.data.seatLabel} • ${res.data.scannedAt}`);
            setArmOpen(true);
            setTimeout(() => setArmOpen(false), 3000);
            showToast(`Gate unlocked for ${qrHash}`, 'success');
            onRefreshTickets();
        } catch (err) {
            const errData = err.response?.data || { code: 'DENIED', message: 'Invalid pass' };
            setScanState('DENIED');
            setStatusTitle(errData.code || 'Access Denied');
            setStatusSub(errData.message);
            showToast(errData.message, 'error');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Wallet Passes */}
            <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-bold theme-text">
                        Wallet Passes ({tickets.length})
                    </h2>
                    <button onClick={onBuyMore} className="px-4 py-1.5 rounded-full apple-pill font-bold text-xs">
                        + Get Passes
                    </button>
                </div>

                {tickets.length === 0 ? (
                    <div className="saglix-glass rounded-[28px] p-10 text-center theme-text-secondary text-sm font-medium">
                        No passes in your Wallet yet.
                    </div>
                ) : (
                    tickets.map(tkt => {
                        const isActive = tkt.status === 'ACTIVE';
                        return (
                            <div
                                key={tkt.id}
                                className={`saglix-glass rounded-[26px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                                    !isActive ? 'opacity-75' : ''
                                }`}
                            >
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2">
                    <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-md border ${
                            isActive
                                ? 'bg-emerald-500/15 border-emerald-400/35 text-emerald-500'
                                : 'bg-rose-500/15 border-rose-400/35 text-rose-500'
                        }`}
                    >
                      {isActive ? 'Active' : `Used (${tkt.scannedAt})`}
                    </span>
                                        <span className="font-mono text-xs theme-text-muted">{tkt.id}</span>
                                    </div>
                                    <h4 className="text-base font-bold theme-text">{tkt.eventTitle}</h4>
                                    <p className="text-xs theme-text-secondary">{tkt.venue} • {tkt.date}</p>
                                    <p className="text-xs font-mono font-medium theme-text pt-1">
                                        {tkt.tier} — {tkt.seat}
                                    </p>
                                </div>

                                <div className="flex sm:flex-col items-center gap-3 shrink-0">
                                    <DeterministicQR seed={tkt.id} />
                                    <button
                                        onClick={() => triggerScan(tkt.id)}
                                        className={`px-4 py-1.5 rounded-full font-bold text-xs transition ${
                                            isActive ? 'apple-pill' : 'theme-chip text-rose-500'
                                        }`}
                                    >
                                        {isActive ? 'Scan' : 'Replay'}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Right: Liquid Glass Edge Reader */}
            <div className="lg:col-span-5 sticky top-24">
                <div className="saglix-glass rounded-[28px] p-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold theme-text-secondary">EDGE READER</span>
                        <select
                            value={gateName}
                            onChange={(e) => setGateName(e.target.value)}
                            className="clean-well text-xs font-mono font-medium rounded-full px-3 py-1.5 focus:outline-none"
                        >
                            <option value="GATE-01 Main Entrance" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
                                GATE-01 Main Entrance
                            </option>
                            <option value="GATE-02 VIP North" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
                                GATE-02 VIP North
                            </option>
                            <option value="GATE-03 East Wing" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
                                GATE-03 East Wing
                            </option>
                        </select>
                    </div>

                    <div
                        className={`rounded-2xl p-6 text-center space-y-2 border backdrop-blur-md transition ${
                            scanState === 'GRANTED'
                                ? 'bg-emerald-500/15 border-emerald-400/40'
                                : scanState === 'DENIED'
                                    ? 'bg-rose-500/15 border-rose-400/40'
                                    : 'clean-well'
                        }`}
                    >
                        <div
                            className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold text-xl ${
                                scanState === 'GRANTED'
                                    ? 'bg-emerald-500/85 text-white'
                                    : scanState === 'DENIED'
                                        ? 'bg-rose-500/85 text-white'
                                        : 'apple-pill'
                            }`}
                        >
                            {scanState === 'GRANTED' ? '✓' : scanState === 'DENIED' ? '✕' : '◎'}
                        </div>
                        <h4 className="font-bold text-base theme-text">{statusTitle}</h4>
                        <p className="text-xs theme-text-secondary">{statusSub}</p>
                    </div>

                    {/* Turnstile Actuator */}
                    <div className="clean-well rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between text-[11px] font-mono">
                            <span className="theme-text-muted font-semibold">TURNSTILE ARM</span>
                            <span className={armOpen ? 'text-emerald-500 font-bold' : 'theme-text font-semibold'}>
                {armOpen ? 'OPEN' : 'LOCKED'}
              </span>
                        </div>
                        <div className="relative h-12 clean-well rounded-xl flex items-center px-3 overflow-hidden">
                            <div className="w-7 h-8 rounded apple-pill flex items-center justify-center text-[9px] font-mono font-bold">
                                IO
                            </div>
                            <div
                                className={`turnstile-arm h-2.5 w-44 rounded-r-full ml-1 ${
                                    armOpen ? 'turnstile-open bg-emerald-400' : 'bg-white/40'
                                }`}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={manualToken}
                            onChange={(e) => setManualToken(e.target.value)}
                            placeholder="Pass token (TKT-AUR-8821)"
                            className="flex-1 px-4 py-2 rounded-full clean-well text-xs font-mono focus:outline-none"
                        />
                        <button
                            onClick={() => manualToken.trim() && triggerScan(manualToken.trim().toUpperCase())}
                            className="px-4 py-2 rounded-full apple-pill font-bold text-xs"
                        >
                            Verify
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GateSimulator;