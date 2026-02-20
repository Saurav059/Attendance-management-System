import React, { useState } from 'react';
import { X, Clock, MapPin, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import axios from 'axios';

interface EditAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    record: any;
    selectedDate: string;
}

export default function EditAttendanceModal({ isOpen, onClose, onSuccess, record, selectedDate }: EditAttendanceModalProps) {
    const [clockIn, setClockIn] = useState(record?.clockIn ? format(new Date(record.clockIn), "HH:mm") : '');
    const [clockOut, setClockOut] = useState(record?.clockOut ? format(new Date(record.clockOut), "HH:mm") : '');
    const [location, setLocation] = useState(record?.clockInLocation || record?.location || '');
    const [reason, setReason] = useState(record?.editReason || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            setClockIn(record?.clockIn ? format(new Date(record.clockIn), "HH:mm") : '');
            setClockOut(record?.clockOut ? format(new Date(record.clockOut), "HH:mm") : '');
            setLocation(record?.location || record?.clockInLocation || '');
            setReason(record?.editReason || '');
            setError(null);
        }
    }, [isOpen, record]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await axios.patch('/api/admin/attendance', {
                employeeId: record?.employeeId,
                date: selectedDate,
                clockIn,
                clockOut: clockOut || null,
                location: location || null,
                reason
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update record');
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
                            <h3 className="text-2xl font-black text-white tracking-tight">Edit Attendance</h3>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Audit Trail Active</p>
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
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center text-sm">
                                <div>
                                    <span className="text-slate-500 font-bold mr-2">Employee:</span>
                                    <span className="text-white font-black">{record?.name}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 font-bold mr-2">Date:</span>
                                    <span className="text-white font-black">{selectedDate}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Clock In Time</label>
                                    <div className="relative group">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="time"
                                            required
                                            value={clockIn}
                                            onChange={(e) => setClockIn(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:bg-white/10 focus:border-blue-500/50 outline-none transition-all [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Clock Out Time</label>
                                    <div className="relative group">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="time"
                                            value={clockOut}
                                            onChange={(e) => setClockOut(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:bg-white/10 focus:border-blue-500/50 outline-none transition-all [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Location</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g., Office, Remote, Site A"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:bg-white/10 focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Reason for Edit</label>
                                <textarea
                                    required
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="e.g., Employee forgot to clock out, network error..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold focus:bg-white/10 focus:border-blue-500/50 outline-none transition-all h-32 resize-none"
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
                                        Save Changes
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
