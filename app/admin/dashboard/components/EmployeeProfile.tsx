'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, DollarSign, Activity, MapPin, Phone, User, Trash2, Briefcase } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';

interface EmployeeProfileProps {
    employeeId: string;
    onBack: () => void;
}

const EmployeeProfile = ({ employeeId, onBack }: EmployeeProfileProps) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchEmployeeStats();
    }, [employeeId]);

    const fetchEmployeeStats = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/reports/employee/${employeeId}`);
            setData(res.data);
        } catch (err) {
            console.error('Failed to fetch employee stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAttendance = async (attendanceId: string) => {
        if (!confirm('Are you sure you want to delete this attendance record?')) return;
        setDeletingId(attendanceId);
        try {
            await axios.delete(`/api/reports/attendance/${attendanceId}`);
            fetchEmployeeStats();
        } catch (err) {
            alert('Failed to delete record');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return (
        <div className="h-[400px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );

    if (!data) return (
        <div className="text-center py-12">
            <p className="text-slate-400">Failed to load employee data.</p>
            <button onClick={onBack} className="mt-4 text-blue-400 hover:underline flex items-center gap-2 mx-auto cursor-pointer">
                <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
        </div>
    );

    const { employee, stats, history, chartData } = data;

    const StatCard = ({ label, value, icon: Icon, color }: any) => (
        <div className="bg-slate-800/50 border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
                    <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
                </div>
                <span className="text-slate-400 text-sm font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    );

    const InfoItem = ({ icon: Icon, label, value }: any) => (
        <div className="flex items-start gap-4">
            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                <Icon className="w-4 h-4 text-slate-400" />
            </div>
            <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest">{label}</p>
                <p className="text-sm text-white font-medium">{value || 'N/A'}</p>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 pb-12"
        >
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-600/10 via-slate-800/50 to-purple-600/10 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                    <div className="flex flex-col md:flex-row md:items-center gap-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-5xl font-bold text-white shadow-2xl shadow-blue-500/20">
                                {employee.name.charAt(0)}
                            </div>
                            <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider shadow-lg ${stats.status === 'CLOCKED_IN' ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'
                                }`}>
                                {stats.status}
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-4 mb-2">
                                <h1 className="text-4xl font-bold text-white">{employee.name}</h1>
                                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold border border-blue-500/20">
                                    {employee.role}
                                </span>
                            </div>
                            <p className="text-slate-400 text-lg mb-6">Max Hours: {employee.maxHoursPerWeek || 40}h/week</p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <InfoItem icon={User} label="Employee ID" value={employee.employeeId} />
                                <InfoItem icon={MapPin} label="Location" value={employee.location} />
                                <InfoItem icon={Briefcase} label="Joined" value={employee.joinDate ? format(new Date(employee.joinDate), 'MMM yyyy') : 'N/A'} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Contact & Details</h3>
                    <div className="space-y-6">
                        <InfoItem icon={Phone} label="Phone Number" value={employee.phoneNumber} />
                        <InfoItem icon={Calendar} label="Date of Birth" value={employee.dateOfBirth ? format(new Date(employee.dateOfBirth), 'MMM dd, yyyy') : 'N/A'} />
                        <InfoItem icon={User} label="Gender" value={employee.gender} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Monthly Hours" value={`${stats.totalMonthlyHours}h`} icon={Clock} color="bg-blue-500" />
                <StatCard label="Total Shifts" value={stats.totalShifts} icon={Calendar} color="bg-purple-500" />
                <StatCard label="Avg. Shift" value={`${stats.avgHoursPerShift}h`} icon={Activity} color="bg-green-500" />
                <StatCard label="Hourly Rate" value={`$${employee.hourlyRate}`} icon={DollarSign} color="bg-orange-500" />
            </div>

            <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">30-Day Working Trend (Hours)</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#64748b"
                                fontSize={12}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(str) => {
                                    try {
                                        return format(new Date(str), 'd');
                                    } catch {
                                        return str;
                                    }
                                }}
                            />
                            <YAxis stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Area type="monotone" dataKey="hours" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHours)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-slate-800/50 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h3 className="text-lg font-bold text-white">Detailed Attendance Logs</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Clock In</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Location (In/Out)</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Clock Out</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Hours</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {history.map((record: any) => (
                                <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-white font-medium">
                                        {format(new Date(record.clockInTime), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                                        {format(new Date(record.clockInTime), 'HH:mm:ss')}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-400">
                                        <div className="flex flex-col">
                                            <span>{record.clockInLocation || '—'}</span>
                                            {record.clockOutLocation && <span className="text-slate-500">{record.clockOutLocation}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                                        {record.clockOutTime ? format(new Date(record.clockOutTime), 'HH:mm:ss') : '--:--:--'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                            {record.totalHours ? record.totalHours.toFixed(2) : '0.00'}h
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDeleteAttendance(record.id)}
                                            disabled={deletingId === record.id}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default EmployeeProfile;
