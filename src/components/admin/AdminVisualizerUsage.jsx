import React, { useState, useEffect } from 'react';
import { Sparkles, Lock, Unlock, RefreshCw, Snowflake, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import './AdminCommon.css';

/**
 * Admin dashboard for the Karrota Visualizer:
 *  - Shows totals (this week + lifetime) of customer spend on generations.
 *  - Per-user table with weekly spend, lifetime spend, freeze status,
 *    weekly cap override, and freeze/unfreeze actions.
 *
 * Mounted at /admin/visualizer (requires role:admin).
 */
const AdminVisualizerUsage = () => {
    const [data, setData] = useState(null);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busyUserId, setBusyUserId] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const r = await api.get('/admin/visualizer/users');
            if (!r.data?.success) throw new Error('Failed to load');
            setData(r.data.data || []);
            setMeta(r.data.meta || null);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.error || err.message || 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const freezeUser = async (user) => {
        const days = prompt(`Freeze ${user.name || user.email} for how many days?`, '7');
        if (!days) return;
        const n = parseInt(days, 10);
        if (!Number.isFinite(n) || n < 1) { alert('Invalid number of days.'); return; }
        setBusyUserId(user.id);
        try {
            await api.post(`/admin/visualizer/users/${user.id}/freeze`, { days: n });
            await load();
        } catch (err) {
            alert('Failed to freeze: ' + (err?.response?.data?.error || err.message));
        } finally {
            setBusyUserId(null);
        }
    };

    const unfreezeUser = async (user) => {
        if (!confirm(`Unfreeze ${user.name || user.email}?`)) return;
        setBusyUserId(user.id);
        try {
            await api.post(`/admin/visualizer/users/${user.id}/unfreeze`);
            await load();
        } catch (err) {
            alert('Failed to unfreeze: ' + (err?.response?.data?.error || err.message));
        } finally {
            setBusyUserId(null);
        }
    };

    const setLimit = async (user) => {
        const cap = prompt(
            `Weekly cap for ${user.name || user.email} in EUR (leave blank to use default of €${meta?.default_weekly_cap_eur ?? '1.00'}):`,
            user.visualizer_weekly_limit ?? ''
        );
        if (cap === null) return;
        const value = cap === '' ? null : Number(cap);
        if (cap !== '' && (!Number.isFinite(value) || value < 0)) { alert('Invalid amount.'); return; }
        setBusyUserId(user.id);
        try {
            await api.put(`/admin/visualizer/users/${user.id}/limit`, { weekly_limit_eur: value });
            await load();
        } catch (err) {
            alert('Failed to set limit: ' + (err?.response?.data?.error || err.message));
        } finally {
            setBusyUserId(null);
        }
    };

    const fmt = (n) => '€' + Number(n || 0).toFixed(2);
    const renderFreezeCell = (u) => {
        const frozen = u.visualizer_frozen_until && new Date(u.visualizer_frozen_until) > new Date();
        if (frozen) {
            return (
                <span style={{ color: '#b91c1c', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                    <Lock size={14} /> Frozen until {new Date(u.visualizer_frozen_until).toLocaleDateString()}
                </span>
            );
        }
        return <span style={{ color: '#16a34a' }}>Active</span>;
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={20} /> Visualizer Usage</h1>
                    <p style={{ color: '#666', margin: 0 }}>Customer spend on cabinet renders. Freeze users or change their weekly cap.</p>
                </div>
                <button className="btn btn-secondary" onClick={load} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 12, borderRadius: 6, color: '#7f1d1d', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <AlertTriangle size={16} /> {error}
                </div>
            )}

            {meta && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                    <StatCard label="This week" value={fmt(meta.totals?.week_spent)} hint={`Resets ${meta.week_end ? new Date(meta.week_end).toLocaleDateString() : ''}`} />
                    <StatCard label="Lifetime" value={fmt(meta.totals?.total_spent)} hint="All-time customer renders" />
                    <StatCard label="Default weekly cap" value={fmt(meta.default_weekly_cap_eur)} hint="Per user, unless overridden" />
                    <StatCard label="Cost per render" value={fmt(meta.cost_per_render_eur)} hint="Charged on success only" />
                </div>
            )}

            <div className="admin-table-wrap" style={{ background: '#fff', borderRadius: 8, overflow: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f7f7f6', borderBottom: '1px solid #e5e5e5' }}>
                            <th style={th}>User</th>
                            <th style={th}>Role</th>
                            <th style={th}>This week</th>
                            <th style={th}>Generations</th>
                            <th style={th}>Lifetime</th>
                            <th style={th}>Weekly cap</th>
                            <th style={th}>Status</th>
                            <th style={th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#888' }}>Loading…</td></tr>
                        )}
                        {!loading && (data || []).length === 0 && (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#888' }}>No users yet.</td></tr>
                        )}
                        {!loading && (data || []).map((u) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={td}>
                                    <strong>{u.name || '(no name)'}</strong>
                                    <div style={{ color: '#888', fontSize: 12 }}>{u.email}</div>
                                </td>
                                <td style={td}>{u.role}</td>
                                <td style={td}><strong>{fmt(u.week_spent)}</strong></td>
                                <td style={td}>{u.generations_this_week ?? 0}</td>
                                <td style={td}>{fmt(u.total_spent)}</td>
                                <td style={td}>
                                    {u.visualizer_weekly_limit !== null && u.visualizer_weekly_limit !== undefined
                                        ? <span title="Override">{fmt(u.visualizer_weekly_limit)}</span>
                                        : <span style={{ color: '#999' }}>{fmt(meta?.default_weekly_cap_eur)} (default)</span>}
                                </td>
                                <td style={td}>{renderFreezeCell(u)}</td>
                                <td style={td}>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {u.visualizer_frozen_until && new Date(u.visualizer_frozen_until) > new Date() ? (
                                            <button className="btn btn-secondary" disabled={busyUserId === u.id} onClick={() => unfreezeUser(u)} style={btnSm}>
                                                <Unlock size={12} /> Unfreeze
                                            </button>
                                        ) : (
                                            <button className="btn btn-secondary" disabled={busyUserId === u.id} onClick={() => freezeUser(u)} style={btnSm}>
                                                <Snowflake size={12} /> Freeze
                                            </button>
                                        )}
                                        <button className="btn btn-secondary" disabled={busyUserId === u.id} onClick={() => setLimit(u)} style={btnSm}>
                                            Set cap
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, hint }) => (
    <div style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a' }}>{value}</div>
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{hint}</div>
    </div>
);

const th = { textAlign: 'left', padding: 12, fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 };
const td = { padding: 12, fontSize: 14 };
const btnSm = { padding: '4px 8px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 };

export default AdminVisualizerUsage;
