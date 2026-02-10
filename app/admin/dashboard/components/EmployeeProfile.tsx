'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, DollarSign, Activity, MapPin, Phone, User, Trash2, UserCheck } from 'lucide-react';
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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header & Back Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <button
                    onClick={onBack}
                    className="group flex items-center gap-3 text-slate-400 hover:text-white transition-all font-black uppercase tracking-[0.2em] text-xs bg-white/5 px-6 py-3 rounded-2xl border border-white/5 hover:bg-white/10"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl shadow-blue-500/20 text-2xl font-black text-white">
                        {employee?.name[0]}
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">{employee?.name}</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-blue-500 font-black text-xs uppercase tracking-widest">{employee?.employeeId}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                            <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">{employee?.role}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock className="w-16 h-16 text-blue-500" />
                    </div>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2">Hours This Month</p>
                    <h3 className="text-3xl font-black text-white">{(stats.totalMonthlyHours || 0).toFixed(2)}H</h3>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity className="w-16 h-16 text-emerald-500" />
                    </div>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2">Avg. Daily Hours</p>
                    <h3 className="text-3xl font-black text-white">{(stats.avgHoursPerShift || 0).toFixed(2)}H</h3>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign className="w-16 h-16 text-purple-500" />
                    </div>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2">Estimated Salary</p>
                    <h3 className="text-3xl font-black text-white">${((employee?.hourlyRate || 0) * stats.totalMonthlyHours).toLocaleString()}</h3>
                    <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-tight">At ${employee?.hourlyRate}/H</p>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <UserCheck className="w-16 h-16 text-orange-500" />
                    </div>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2">Max Hours/Week</p>
                    <h3 className="text-3xl font-black text-white">{employee?.maxHoursPerWeek}H<span className="text-sm text-slate-500 ml-1">/WK</span></h3>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* 30-Day Activity Flow */}
                <div className="xl:col-span-2 glass-card rounded-[2.5rem] p-10 relative group">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Attendance Activity</h3>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Last 30 Days</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        </div>
                    </div>

                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData || []}>
                                <defs>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#475569"
                                    fontSize={11}
                                    fontWeight={900}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                    tickFormatter={(str) => {
                                        try {
                                            return format(new Date(str), 'MMM d');
                                        } catch {
                                            return str;
                                        }
                                    }}
                                />
                                <YAxis stroke="#475569" fontSize={11} fontWeight={900} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '20px',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="hours"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#areaGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Personnel Metadata */}
                <div className="glass-card rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 p-10 opacity-5">
                        <MapPin className="w-48 h-48 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-10 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            Employee Info
                        </h3>
                        <div className="space-y-8">
                            {[
                                { label: 'Location', value: employee?.location || 'Unassigned', icon: MapPin },
                                { label: 'Gender', value: employee?.gender || 'N/A', icon: User },
                                { label: 'Join Date', value: employee?.joinDate ? format(new Date(employee.joinDate), 'PPP') : 'N/A', icon: Calendar },
                                { label: 'Phone', value: employee?.phoneNumber || 'N/A', icon: Phone },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-5 group/meta">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover/meta:bg-blue-600/10 group-hover/meta:text-blue-400 transition-all border border-white/5 shadow-inner">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                                        <p className="text-sm font-bold text-white mt-0.5">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/5">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black tracking-[0.2em] border ${stats.status === 'CLOCKED_IN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${stats.status === 'CLOCKED_IN' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                            {stats.status}
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Ledger */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden">
                <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">ATTENDANCE HISTORY</h3>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">All records</p>
                    </div>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clock In</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clock Out</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Total Hours</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {history.slice().reverse().map((record: any) => (
                                <tr key={record.id} className="hover:bg-white/5 transition-colors group/row">
                                    <td className="px-10 py-6">
                                        <span className="text-sm font-bold text-white tabular-nums">
                                            {format(new Date(record.clockInTime), 'MMM d, yyyy')}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-emerald-400 tabular-nums">
                                                {format(new Date(record.clockInTime), 'HH:mm:ss')}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                {record.clockInLocation || 'Office'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        {record.clockOutTime ? (
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-rose-400 tabular-nums">
                                                    {format(new Date(record.clockOutTime), 'HH:mm:ss')}
                                                </span>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    {record.clockOutLocation || 'Office'}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] animate-pulse">ACTIVE</span>
                                        )}
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <span className="inline-flex px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-black tabular-nums">
                                            {(record.totalHours || 0).toFixed(2)}H
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <button
                                            onClick={() => handleDeleteAttendance(record.id)}
                                            className="opacity-0 group-hover/row:opacity-100 p-2 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-500/20"
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
        </div>
    );
};

export default EmployeeProfile;
