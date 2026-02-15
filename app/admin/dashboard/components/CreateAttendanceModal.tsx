import React, { useState } from 'react';
import { X, Clock, User, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import axios from 'axios';

interface CreateAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    employees: any[];
}

export default function CreateAttendanceModal({ isOpen, onClose, onSuccess, employees }: CreateAttendanceModalProps) {
    const [employeeId, setEmployeeId] = useState('');
    const [clockIn, setClockIn] = useState(format(new Date(), "yyyy-MM-dd'T'09:00"));
    const [clockOut, setClockOut] = useState(format(new Date(), "yyyy-MM-dd'T'17:00"));
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await axios.post('/api/attendance/manual', {
                employeeId,
                clockInTime: clockIn,
                clockOutTime: clockOut || null,
                reason,
                clockInLocation: 'HR Manual Entry'
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create record');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg glass-card rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-white/10"
                >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Manual Attendance</h3>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">HR Adjustment</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm font-bold">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Select Employee</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <select
                                        required
                                        value={employeeId}
                                        onChange={(e) => setEmployeeId(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:bg-white/10 focus:border-blue-500/50 outline-none transition-all appearance-none"
                                    >
                                        <option value="" className="bg-slate-900">Select an employee...</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id} className="bg-slate-900">
                                                {emp.name} ({emp.employeeId})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Clock In Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={clockIn}
                                        onChange={(e) => setClockIn(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white font-bold focus:bg-white/10 focus:border-blue-500/50 outline-none transition-all [color-scheme:dark]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Clock Out Time</label>
                                    <input
                                        type="datetime-local"
                                        value={clockOut}
                                        onChange={(e) => setClockOut(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white font-bold focus:bg-white/10 focus:border-blue-500/50 outline-none transition-all [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Reason</label>
                                <textarea
                                    required
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="e.g., Manual correction for missing entry"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold focus:bg-white/10 focus:border-blue-500/50 outline-none transition-all h-24 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-4 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Create Record
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
