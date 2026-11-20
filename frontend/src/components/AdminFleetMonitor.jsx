import React, { useState, useEffect } from 'react';
import api from '../api';

const AdminFleetMonitor = ({ showToast }) => {
    const [devices, setDevices] = useState([]);
    const [users, setUsers] = useState([]);

    const loadData = async () => {
        try {
            const [devRes, usrRes] = await Promise.all([api.get('/admin/devices'), api.get('/admin/users')]);
            setDevices(devRes.data);
            setUsers(usrRes.data);
        } catch (err) {
            showToast('Admin privileges required.', 'error');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const toggleDevice = async (id) => {
        try {
            const res = await api.post(`/admin/devices/${id}/toggle`);
            setDevices(devices.map(d => (d.id === id ? res.data : d)));
            showToast(`${res.data.name}: ${res.data.online ? 'Online' : 'Offline'}`, res.data.online ? 'success' : 'warning');
        } catch (err) {
            showToast('Failed to update node', 'error');
        }
    };

    const approvePayout = async (id) => {
        try {
            const res = await api.post(`/admin/users/${id}/payout`);
            showToast(res.data.message, 'success');
            loadData();
        } catch (err) {
            showToast('Payout failed', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="saglix-glass rounded-[28px] overflow-hidden">
                <div className="p-6 border-b theme-divider">
                    <h2 className="text-base font-bold theme-text">IoT Gate Nodes</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="text-[11px] font-mono uppercase theme-text-muted border-b theme-divider">
                            <th className="py-3 px-6">Node</th>
                            <th className="py-3 px-6">Venue</th>
                            <th className="py-3 px-6">Scans</th>
                            <th className="py-3 px-6 text-right">Status</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y theme-divider text-xs">
                        {devices.map(dev => (
                            <tr key={dev.id}>
                                <td className="py-3.5 px-6 font-semibold theme-text">{dev.name}</td>
                                <td className="py-3.5 px-6 theme-text-secondary">{dev.venue}</td>
                                <td className="py-3.5 px-6 font-mono theme-text">{dev.scansProcessed}</td>
                                <td className="py-3.5 px-6 text-right">
                                    <button
                                        onClick={() => toggleDevice(dev.id)}
                                        className={`px-3.5 py-1 rounded-full font-semibold transition backdrop-blur-md border ${
                                            dev.online
                                                ? 'bg-emerald-500/15 border-emerald-400/35 text-emerald-500'
                                                : 'bg-rose-500/15 border-rose-400/35 text-rose-500'
                                        }`}
                                    >
                                        {dev.online ? 'Online' : 'Offline'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="saglix-glass rounded-[28px] overflow-hidden">
                <div className="p-6 border-b theme-divider">
                    <h3 className="text-base font-bold theme-text">Users &amp; Settlements</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="text-[11px] font-mono uppercase theme-text-muted border-b theme-divider">
                            <th className="py-3 px-6">User</th>
                            <th className="py-3 px-6">Role</th>
                            <th className="py-3 px-6">Balance</th>
                            <th className="py-3 px-6 text-right">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y theme-divider text-xs">
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="py-3.5 px-6">
                                    <p className="font-semibold theme-text">{u.fullName}</p>
                                    <p className="font-mono text-[11px] theme-text-muted">{u.email}</p>
                                </td>
                                <td className="py-3.5 px-6 font-mono theme-text-secondary">{u.role}</td>
                                <td className="py-3.5 px-6 font-mono font-semibold text-emerald-500">
                                    {u.role === 'ORGANIZER' ? `${Number(u.netBalance).toLocaleString()} RON` : '—'}
                                </td>
                                <td className="py-3.5 px-6 text-right">
                                    {u.role === 'ORGANIZER' && Number(u.netBalance) > 0 ? (
                                        <button onClick={() => approvePayout(u.id)} className="px-3.5 py-1 rounded-full apple-pill font-bold">
                                            Settle
                                        </button>
                                    ) : (
                                        <span className="theme-text-muted font-mono">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminFleetMonitor;