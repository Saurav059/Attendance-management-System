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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Full Name *</label>
                        <input
                            required
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Employee ID</label>
                            <input
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600"
                                placeholder="Auto"
                                value={formData.employeeId}
                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Max Hours/Week</label>
                        <input
                            type="number"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="40"
                            value={formData.maxHoursPerWeek}
                            onChange={(e) => setFormData({ ...formData, maxHoursPerWeek: Number(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Hourly Rate ($)</label>
                        <input
                            type="number"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.hourlyRate}
                            onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                >
                    {loading ? 'Adding...' : 'Add Employee'}
                </button>
            </div>
        </form>
    );
};

export default AddEmployeeForm;
