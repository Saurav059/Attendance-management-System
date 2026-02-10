'use client';

import { useState } from 'react';
import axios from 'axios';

const AddEmployeeForm = ({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        employeeId: '',
        role: 'EMPLOYEE',
        hourlyRate: 20,
        maxHoursPerWeek: 40,
        location: '',
        gender: '',
        dateOfBirth: '',
        joinDate: new Date().toISOString().split('T')[0],
        phoneNumber: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: any = { ...formData };
            if (!payload.employeeId) delete payload.employeeId;
            if (!payload.location) delete payload.location;
            if (!payload.gender) delete payload.gender;
            if (!payload.dateOfBirth) delete payload.dateOfBirth;
            if (!payload.phoneNumber) delete payload.phoneNumber;

            payload.hourlyRate = payload.hourlyRate ? Number(payload.hourlyRate) : 0;
            payload.maxHoursPerWeek = payload.maxHoursPerWeek ? Number(payload.maxHoursPerWeek) : 40;

            await axios.post('/api/employees', payload);
            onSuccess();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to add employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
                        <input
                            required
                            className="w-full bg-slate-900/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-600"
                            placeholder="e.g., Alexander Pierce"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Personnel ID</label>
                        <input
                            className="w-full bg-slate-900/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-600"
                            placeholder="AUTO-GENERATE"
                            value={formData.employeeId}
                            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Allocation (Hours/Wk)</label>
                        <input
                            type="number"
                            className="w-full bg-slate-900/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            placeholder="40"
                            value={formData.maxHoursPerWeek}
                            onChange={(e) => setFormData({ ...formData, maxHoursPerWeek: Number(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Remuneration (Rate $)</label>
                        <input
                            type="number"
                            className="w-full bg-slate-900/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            value={formData.hourlyRate}
                            onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-white/5">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-8 py-5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl font-black uppercase tracking-widest transition-all cursor-pointer border border-white/5"
                >
                    Abort
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-8 py-5 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                    ) : 'Confirm Onboarding'}
                </button>
            </div>
        </form>
    );
};

export default AddEmployeeForm;
