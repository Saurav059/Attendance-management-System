"use client";

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Users, Clock, UserCheck, UserX, LogOut, Plus, DollarSign, Settings, Activity, Calendar, MapPin, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import EmployeeProfile from './components/EmployeeProfile';
import AddEmployeeForm from './components/AddEmployeeForm';
import EditAttendanceModal from './components/EditAttendanceModal';
import CreateAttendanceModal from './components/CreateAttendanceModal';

export default function DashboardClient({
    initialStats,
    initialEmployees,
    initialPayrollData,
    initialWeeklyTrend,
    userEmail
}: {
    initialStats: any,
    initialEmployees: any[],
    initialPayrollData: any[],
    initialWeeklyTrend: any[],
    userEmail: string
}) {
    const router = useRouter();
    const [stats, setStats] = useState(initialStats);
    const [employees, setEmployees] = useState(initialEmployees || []);
    const [payrollData, setPayrollData] = useState(initialPayrollData || []);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!initialStats);
    const [activeView, setActiveView] = useState<'overview' | 'employees' | 'payroll' | 'settings'>('overview');
    const [showAddModal, setShowAddModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showManualModal, setShowManualModal] = useState(false);
    const [recordToEdit, setRecordToEdit] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [filterTab, setFilterTab] = useState<'all' | 'present' | 'absent' | 'clocked-in'>('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Pagination states
    const [attendancePage, setAttendancePage] = useState(1);
    const [employeesPage, setEmployeesPage] = useState(1);
    const itemsPerPage = 10;

    // Reset pagination when filters change
    useEffect(() => {
        setAttendancePage(1);
    }, [filterTab, selectedDate]);

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!initialStats) {
                setInitialLoading(true);
                try {
                    const [statsRes, empRes] = await Promise.all([
                        axios.get(`/api/reports/dashboard-stats?date=${selectedDate}`),
                        axios.get('/api/employees')
                    ]);
                    setStats(statsRes.data);
                    setEmployees(empRes.data);
                } catch (err) {
                    console.error('Failed to load initial data:', err);
                } finally {
                    setInitialLoading(false);
                }
            }
        };
        fetchInitialData();
    }, [initialStats]);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTo(0, 0);
        }
    }, [activeView, selectedEmployeeId]);

    // Fetch payroll data when switching to payroll view
    useEffect(() => {
        const fetchPayrollData = async () => {
            if (activeView === 'payroll' && payrollData.length === 0) {
                setLoading(true);
                try {
                    const res = await axios.get('/api/reports/payroll');
                    setPayrollData(res.data);
                } catch (err) {
                    console.error('Failed to fetch payroll data:', err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchPayrollData();
    }, [activeView]);

    const fetchStats = async (date: string) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/reports/dashboard-stats?date=${date}`);
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await axios.post('/api/auth/logout');
        router.push('/login');
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/employees');
            setEmployees(res.data);
        } catch (err: any) {
            console.error(err);
            alert('Failed to load employee data: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEmployee = async () => {
        if (!employeeToDelete) return;
        setIsDeleting(employeeToDelete.id);
        try {
            await axios.delete(`/api/employees/${employeeToDelete.id}`);
            setEmployees(employees.filter(e => e.id !== employeeToDelete.id));
            setShowDeleteConfirm(false);
            setEmployeeToDelete(null);
        } catch (err) {
            alert('Failed to delete employee');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleManualClockIn = async (empId: string) => {
        setActionLoading(empId);
        try {
            await axios.post('/api/attendance/clock-in', { identifier: empId, location: 'Admin Manual Entry' });
            await fetchStats(selectedDate);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to clock in');
        } finally {
            setActionLoading(null);
        }
    };

    const handleManualClockOut = async (empId: string) => {
        setActionLoading(empId);
        try {
            await axios.post('/api/attendance/clock-out', { identifier: empId, location: 'Admin Manual Entry' });
            await fetchStats(selectedDate);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to clock out');
        } finally {
            setActionLoading(null);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, onClick }: any) => (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className={`glass-card p-8 rounded-[2rem] relative group/card cursor-pointer border-t-2 ${color === 'bg-blue-500' ? 'border-blue-500/50' :
                color === 'bg-green-500' ? 'border-green-500/50' :
                    color === 'bg-red-500' ? 'border-rose-500/50' : 'border-orange-500/50'
                }`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 group-hover/card:text-white transition-colors">
                        {title}
                    </p>
                    <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                        {value || 0}
                    </h3>
                </div>
                <div className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover/card:bg-opacity-20 transition-all duration-300`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
            </div>
            <div className={`absolute bottom-6 right-8 w-1 h-1 rounded-full ${color.replace('bg-', 'bg-')} blur-sm group-hover/card:scale-[10] transition-transform duration-500 opacity-20`}></div>
        </motion.div>
    );

    return (
        <div className="h-screen mesh-gradient flex relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-float pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full animate-float pointer-events-none" style={{ animationDelay: '-3s' }}></div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 bg-slate-950/80 z-40 lg:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                className={`w-72 bg-slate-900/95 backdrop-blur-2xl border-r border-white/5 p-8 flex flex-col fixed inset-y-0 left-0 z-50 lg:static lg:bg-slate-900/40 lg:z-10 transition-transform duration-300 ease-in-out h-full overflow-y-auto custom-scrollbar ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <UserCheck className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-black text-white tracking-tight">ADMIN DASHBOARD</h1>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { id: 'overview', label: 'Dashboard', icon: Clock },
                        { id: 'employees', label: 'Employees', icon: Users },
                        { id: 'payroll', label: 'Payroll', icon: DollarSign },
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveView(item.id as any);
                                setSelectedEmployeeId(null);
                                setMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-5 py-3.5 rounded-2xl font-semibold flex items-center gap-4 transition-all duration-300 group ${activeView === item.id && !selectedEmployeeId
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-[1.02]'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeView === item.id && !selectedEmployeeId ? '' : 'group-hover:scale-110'}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
                    <div className="flex items-center gap-4 px-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/10 shadow-inner">
                            <span className="text-lg font-bold text-white">{userEmail?.[0].toUpperCase()}</span>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{userEmail}</p>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Administrator</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowLogoutConfirmation(true)}
                        className="w-full px-5 py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all group cursor-pointer"
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                    </button>
                </div>
            </motion.div>

            {/* Main Content */}
            <div ref={contentRef} className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
                <header className="sticky top-0 z-30 bg-slate-900/40 backdrop-blur-md border-b border-white/5 py-6 px-6 md:px-12 flex flex-row items-center gap-6">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="lg:hidden p-2 text-white bg-white/5 rounded-xl border border-white/10"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl md:text-5xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                                {selectedEmployeeId ? 'Employee Profile' :
                                    activeView === 'overview' ? 'Dashboard' :
                                        activeView === 'employees' ? 'Employees' :
                                            activeView === 'payroll' ? 'Payroll' : 'Settings'}
                            </h2>
                            <p className="text-slate-400 font-medium mt-1 md:mt-2 text-sm md:text-base hidden md:block">
                                {activeView === 'overview' ? 'View attendance trends and stats' :
                                    activeView === 'employees' ? 'Manage your employees and profiles' :
                                        activeView === 'payroll' ? 'Track earnings and history' :
                                            'Manage your account settings'}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {activeView === 'employees' && !selectedEmployeeId && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl flex items-center gap-2 md:gap-3 transition-all shadow-xl shadow-blue-500/20 cursor-pointer text-xs md:text-sm font-bold"
                                >
                                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                                    <span>Add Employee</span>
                                </motion.button>
                            )}
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-12 pt-10">
                    {initialLoading ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
                            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm animate-pulse">Loading Dashboard Data...</p>
                        </div>
                    ) : selectedEmployeeId ? (
                        <EmployeeProfile
                            employeeId={selectedEmployeeId}
                            onBack={() => setSelectedEmployeeId(null)}
                        />
                    ) : activeView === 'overview' ? (
                        <div className="space-y-10">
                            {/* ... existing StatCards and Chart ... */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <StatCard title="Total Employees" value={stats?.totalEmployees} icon={Users} color="bg-blue-500" />
                                <StatCard
                                    title="Present Today"
                                    value={stats?.present}
                                    icon={UserCheck}
                                    color="bg-green-500"
                                    onClick={() => setFilterTab('present')}
                                />
                                <StatCard
                                    title="Absent"
                                    value={stats?.absent}
                                    icon={UserX}
                                    color="bg-red-500"
                                    onClick={() => setFilterTab('absent')}
                                />
                                <StatCard
                                    title="Active Clock-ins"
                                    value={stats?.activeClockIns}
                                    icon={Clock}
                                    color="bg-orange-500"
                                    onClick={() => setFilterTab('clocked-in')}
                                />
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                <div className="xl:col-span-2 glass-card rounded-[2.5rem] p-10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Activity className="w-24 h-24 text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        Attendance Chart
                                    </h3>
                                    <div className="h-[350px] w-full">
                                        <ResponsiveContainer width="99%" height="100%">
                                            <LineChart data={stats?.chartData || []}>
                                                <defs>
                                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                                <XAxis
                                                    dataKey="date"
                                                    stroke="#475569"
                                                    fontSize={12}
                                                    fontWeight={600}
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
                                                <YAxis stroke="#475569" fontSize={12} fontWeight={600} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '16px',
                                                        backdropFilter: 'blur(10px)',
                                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                                    }}
                                                    itemStyle={{ color: '#60a5fa', fontWeight: 700 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="present"
                                                    stroke="#3b82f6"
                                                    strokeWidth={4}
                                                    dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }}
                                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="glass-card rounded-[2.5rem] p-10 flex flex-col">
                                    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        Recent Activity
                                    </h3>
                                    <div className="space-y-5 overflow-y-auto custom-scrollbar flex-1 pr-2 max-h-[500px]">
                                        {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 opacity-50">
                                                <Clock className="w-12 h-12" />
                                                <p className="font-medium">No activity recorded today</p>
                                            </div>
                                        )}
                                        {stats?.recentActivity?.map((record: any) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={record.id}
                                                className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-[1.25rem] group/item hover:bg-white/10 transition-all duration-300"
                                            >
                                                <div className={`p-3 rounded-xl transition-transform group-hover/item:scale-110 ${!record.clockOutTime ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {!record.clockOutTime ? <Clock className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-slate-300 text-xs font-medium leading-relaxed">
                                                        <span className="text-white font-bold">{record.employee.name}</span>{' '}
                                                        clocked {record.clockOutTime ? 'out' : 'in'} at{' '}
                                                        <span className="text-blue-400 font-bold whitespace-nowrap">
                                                            {format(new Date(record.clockOutTime || record.clockInTime), 'hh:mm a')}
                                                        </span>{' '}
                                                        from{' '}
                                                        <span className="text-emerald-400 font-bold break-words">
                                                            {record.location || (record.clockOutTime ? record.clockOutLocation : record.clockInLocation) || 'Unspecified location'}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Daily Detailed Status Table */}
                            <div id="status-report" className="glass-card rounded-[2.5rem] overflow-hidden group">
                                <div className="p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full xl:w-auto">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            Attendance List
                                        </h3>
                                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto">
                                            {[
                                                { id: 'all', label: 'All', count: stats?.totalEmployees },
                                                { id: 'present', label: 'Present', count: stats?.present },
                                                { id: 'absent', label: 'Absent', count: stats?.absent },
                                                { id: 'clocked-in', label: 'Clocked In', count: stats?.activeClockIns }
                                            ].map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setFilterTab(tab.id as any)}
                                                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterTab === tab.id
                                                        ? 'bg-blue-600 text-white shadow-lg'
                                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                                        }`}
                                                >
                                                    {tab.label} ({tab.count || 0})
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 group-hover:border-white/20 transition-colors">
                                            <Calendar className="w-4 h-4 text-slate-400 ml-2" />
                                            <input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    setSelectedDate(e.target.value);
                                                    fetchStats(e.target.value);
                                                }}
                                                className="bg-transparent text-white text-sm font-bold px-3 py-1 outline-none border-none [color-scheme:dark]"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setShowManualModal(true)}
                                            className="p-3 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl border border-blue-500/20 transition-all group/btn"
                                            title="Add Manual Attendance"
                                        >
                                            <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                                <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5">
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">In</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Out</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Hours</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {(() => {
                                                const filtered = stats?.dailyDetails?.filter((detail: any) => {
                                                    if (filterTab === 'all') return true;
                                                    if (filterTab === 'present') return detail.status === 'COMPLETED' || detail.status === 'CLOCKED_IN';
                                                    if (filterTab === 'absent') return detail.status === 'ABSENT';
                                                    if (filterTab === 'clocked-in') return detail.status === 'CLOCKED_IN';
                                                    return true;
                                                }) || [];
                                                const totalPages = Math.ceil(filtered.length / itemsPerPage);
                                                const paginated = filtered.slice((attendancePage - 1) * itemsPerPage, attendancePage * itemsPerPage);

                                                if (paginated.length === 0) {
                                                    return (
                                                        <tr>
                                                            <td colSpan={7} className="px-8 py-10 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">No records found</td>
                                                        </tr>
                                                    );
                                                }

                                                return (
                                                    <>
                                                        {paginated.map((detail: any) => (
                                                            <tr key={detail.id} className="hover:bg-white/5 transition-colors group/row">
                                                                <td className="px-8 py-6">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs font-black">
                                                                            {detail.name[0]}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm text-white font-bold">{detail.name}</span>
                                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{detail.employeeId}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-6 text-right">
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setRecordToEdit(detail);
                                                                                setShowEditModal(true);
                                                                            }}
                                                                            className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                        {detail.status === 'ABSENT' && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleManualClockIn(detail.employeeId);
                                                                                }}
                                                                                disabled={actionLoading === detail.employeeId}
                                                                                className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                                                            >
                                                                                {actionLoading === detail.employeeId ? 'Processing...' : 'Manual In'}
                                                                            </button>
                                                                        )}
                                                                        {detail.status === 'CLOCKED_IN' && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleManualClockOut(detail.employeeId);
                                                                                }}
                                                                                disabled={actionLoading === detail.employeeId}
                                                                                className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                                                            >
                                                                                {actionLoading === detail.employeeId ? 'Processing...' : 'Manual Out'}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    {detail.clockIn ? (
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-black text-emerald-400 tabular-nums">
                                                                                {format(new Date(detail.clockIn), 'HH:mm:ss')}
                                                                            </span>
                                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                                                                                {format(new Date(detail.clockIn), 'aaa')}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-xs font-bold text-slate-600 tracking-widest">PENDING</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    {detail.clockOut ? (
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-black text-amber-400 tabular-nums">
                                                                                {format(new Date(detail.clockOut), 'HH:mm:ss')}
                                                                            </span>
                                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                                                                                {format(new Date(detail.clockOut), 'aaa')}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-xs font-bold text-slate-600 tracking-widest">--:--:--</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <div className="flex items-center gap-2">
                                                                        <MapPin className="w-3 h-3 text-slate-500" />
                                                                        <span className="text-xs font-black text-slate-400 uppercase tracking-tight">
                                                                            {detail.location || detail.clockInLocation || detail.clockOutLocation || 'UNSPECIFIED'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-6 text-right">
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 tabular-nums">
                                                                        {(detail.totalHours || 0).toFixed(2)}H
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${detail.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                        detail.status === 'CLOCKED_IN' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse' :
                                                                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                                        }`}>
                                                                        {detail.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {totalPages > 1 && (
                                                            <tr>
                                                                <td colSpan={7} className="px-8 py-4 bg-white/5">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                                            Page {attendancePage} of {totalPages}
                                                                        </p>
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => setAttendancePage(p => Math.max(1, p - 1))}
                                                                                disabled={attendancePage === 1}
                                                                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                                                                            >
                                                                                Previous
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setAttendancePage(p => Math.min(totalPages, p + 1))}
                                                                                disabled={attendancePage === totalPages}
                                                                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                                                                            >
                                                                                Next
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Attendance View */}
                                <div className="lg:hidden p-4 space-y-4 pb-32 overflow-y-auto">
                                    {(() => {
                                        const filtered = stats?.dailyDetails?.filter((detail: any) => {
                                            if (filterTab === 'all') return true;
                                            if (filterTab === 'present') return detail.status === 'COMPLETED' || detail.status === 'CLOCKED_IN';
                                            if (filterTab === 'absent') return detail.status === 'ABSENT';
                                            if (filterTab === 'clocked-in') return detail.status === 'CLOCKED_IN';
                                            return true;
                                        }) || [];
                                        const totalPages = Math.ceil(filtered.length / itemsPerPage);
                                        const paginated = filtered.slice((attendancePage - 1) * itemsPerPage, attendancePage * itemsPerPage);

                                        if (paginated.length === 0) {
                                            return <div className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">No records found</div>;
                                        }

                                        return (
                                            <>
                                                {paginated.map((detail: any) => (
                                                    <div key={detail.id} className="bg-white/5 border border-white/5 rounded-[1.5rem] p-5 space-y-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-sm">
                                                                    {detail.name[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="text-white font-bold text-sm">{detail.name}</p>
                                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{detail.employeeId}</p>
                                                                </div>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${detail.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                detail.status === 'CLOCKED_IN' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                                }`}>
                                                                {detail.status}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                                            <div>
                                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Time In</p>
                                                                <p className="text-xs text-white font-bold tabular-nums">
                                                                    {detail.clockIn ? format(new Date(detail.clockIn), 'HH:mm:ss') : '--:--:--'}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Hours</p>
                                                                <p className="text-xs text-blue-400 font-black tabular-nums">{(detail.totalHours || 0).toFixed(2)}H</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2 pt-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setRecordToEdit(detail);
                                                                    setShowEditModal(true);
                                                                }}
                                                                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                                                            >
                                                                Edit
                                                            </button>
                                                            {detail.status === 'ABSENT' && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleManualClockIn(detail.employeeId);
                                                                    }}
                                                                    disabled={actionLoading === detail.employeeId}
                                                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                                                                >
                                                                    {actionLoading === detail.employeeId ? '...' : 'Manual In'}
                                                                </button>
                                                            )}
                                                            {detail.status === 'CLOCKED_IN' && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleManualClockOut(detail.employeeId);
                                                                    }}
                                                                    disabled={actionLoading === detail.employeeId}
                                                                    className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-600/20"
                                                                >
                                                                    {actionLoading === detail.employeeId ? '...' : 'Manual Out'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {totalPages > 1 && (
                                                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                            Page {attendancePage}
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setAttendancePage(p => Math.max(1, p - 1))}
                                                                disabled={attendancePage === 1}
                                                                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 text-[10px] font-black"
                                                            >
                                                                PREV
                                                            </button>
                                                            <button
                                                                onClick={() => setAttendancePage(p => Math.min(totalPages, p + 1))}
                                                                disabled={attendancePage === totalPages}
                                                                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 text-[10px] font-black"
                                                            >
                                                                NEXT
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    ) : activeView === 'employees' ? (
                        <div className="space-y-10">
                            {/* Attendance Chart for Employees */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-10 rounded-[2.5rem] group"
                            >
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">Attendance Trend</h3>
                                        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Last 14 Days</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats?.chartData || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#475569"
                                                fontSize={11}
                                                fontWeight={600}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(str: string) => format(new Date(str), 'MMM d')}
                                            />
                                            <YAxis stroke="#475569" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '16px',
                                                    backdropFilter: 'blur(10px)'
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="present"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#0f172a' }}
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Desktop Table View */}
                            <div className="hidden lg:block glass-card rounded-[2.5rem] overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5">
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Name</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {(() => {
                                            const totalPages = Math.ceil(employees.length / itemsPerPage);
                                            const paginated = employees.slice((employeesPage - 1) * itemsPerPage, employeesPage * itemsPerPage);

                                            return (
                                                <>
                                                    {paginated.map((emp) => (
                                                        <tr
                                                            key={emp.id}
                                                            className="hover:bg-white/5 transition-all group/row cursor-pointer"
                                                            onClick={() => setSelectedEmployeeId(emp.id)}
                                                        >
                                                            <td className="px-8 py-6">
                                                                <span className="text-sm font-black text-blue-400 tracking-wider tabular-nums">
                                                                    {emp.employeeId}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold group-hover/row:from-blue-600 group-hover/row:to-blue-700 transition-all duration-300 shadow-lg">
                                                                        {emp.name[0]}
                                                                    </div>
                                                                    <span className="text-base text-white font-bold group-hover/row:text-blue-400 transition-colors uppercase tracking-tight">{emp.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black tracking-widest border border-blue-500/20 uppercase">
                                                                    {emp.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-6 text-right">
                                                                <button
                                                                    onClick={(e: React.MouseEvent) => {
                                                                        e.stopPropagation();
                                                                        setEmployeeToDelete(emp);
                                                                        setShowDeleteConfirm(true);
                                                                    }}
                                                                    disabled={isDeleting === emp.id}
                                                                    className="opacity-0 group-hover/row:opacity-100 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-4 py-2 rounded-xl transition-all text-xs font-black uppercase tracking-widest cursor-pointer border border-rose-500/20"
                                                                >
                                                                    {isDeleting === emp.id ? 'Deleting...' : 'Delete'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {totalPages > 1 && (
                                                        <tr>
                                                            <td colSpan={4} className="px-8 py-4 bg-white/5">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                                        Page {employeesPage} of {totalPages}
                                                                    </p>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => setEmployeesPage(p => Math.max(1, p - 1))}
                                                                            disabled={employeesPage === 1}
                                                                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                                                                        >
                                                                            Previous
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setEmployeesPage(p => Math.min(totalPages, p + 1))}
                                                                            disabled={employeesPage === totalPages}
                                                                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                                                                        >
                                                                            Next
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="lg:hidden space-y-3 pb-32">
                                {(() => {
                                    const totalPages = Math.ceil(employees.length / itemsPerPage);
                                    const paginated = employees.slice((employeesPage - 1) * itemsPerPage, employeesPage * itemsPerPage);

                                    return (
                                        <>
                                            {paginated.map((emp) => (
                                                <div
                                                    key={emp.id}
                                                    className="bg-slate-800/50 p-4 rounded-xl border border-white/5 active:scale-[0.98] transition-transform"
                                                    onClick={() => setSelectedEmployeeId(emp.id)}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="text-white font-medium text-base">{emp.name}</h4>
                                                            <p className="text-blue-400 text-xs font-mono bg-blue-500/10 px-2 py-0.5 rounded inline-block mt-1">
                                                                {emp.employeeId}
                                                            </p>
                                                        </div>
                                                        <span className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-md text-[10px] font-medium border border-white/5 uppercase tracking-wider">
                                                            {emp.role}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                                                        <div>
                                                            <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Max Hours/Week</span>
                                                            <span className="text-slate-300 text-sm">{emp.maxHoursPerWeek || 40}h</span>
                                                        </div>
                                                        <div className="text-right flex flex-col items-end">
                                                            <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Action</span>
                                                            <button
                                                                onClick={(e: React.MouseEvent) => {
                                                                    e.stopPropagation();
                                                                    setEmployeeToDelete(emp);
                                                                    setShowDeleteConfirm(true);
                                                                }}
                                                                disabled={isDeleting === emp.id}
                                                                className="text-red-400 text-sm font-medium active:text-red-300 py-1"
                                                            >
                                                                {isDeleting === emp.id ? 'Deleting...' : 'Remove User'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {totalPages > 1 && (
                                                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                        Page {employeesPage} of {totalPages}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEmployeesPage(p => Math.max(1, p - 1))}
                                                            disabled={employeesPage === 1}
                                                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 text-xs font-bold"
                                                        >
                                                            Prev
                                                        </button>
                                                        <button
                                                            onClick={() => setEmployeesPage(p => Math.min(totalPages, p + 1))}
                                                            disabled={employeesPage === totalPages}
                                                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 text-xs font-bold"
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    ) : activeView === 'payroll' ? (
                        <div className="space-y-10">
                            {payrollData.map((period: any, idx: number) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={idx}
                                    className="glass-card rounded-[2.5rem] overflow-hidden"
                                >
                                    <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                                                <DollarSign className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white tracking-tight uppercase">{period.period}</h3>
                                                <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mt-1">Payment summary</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Cycle Total</p>
                                            <p className="text-2xl font-black text-emerald-400 tabular-nums">
                                                ${period.employees.reduce((acc: number, e: any) => acc + e.amount, 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-900/30">
                                                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                                                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Hours</th>
                                                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {period.employees.map((emp: any) => (
                                                    <tr key={emp.employeeId} className="hover:bg-white/5 transition-colors group/row">
                                                        <td className="px-10 py-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                                                                    {emp.name[0]}
                                                                </div>
                                                                <span className="text-sm text-white font-bold">{emp.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-6 text-right">
                                                            <span className="text-sm font-bold text-slate-300 tabular-nums">{emp.hours}H</span>
                                                        </td>
                                                        <td className="px-10 py-6 text-right">
                                                            <span className="text-base font-black text-white tabular-nums">${emp.amount.toLocaleString()}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Payroll View */}
                                    <div className="lg:hidden p-4 space-y-3">
                                        {period.employees.map((emp: any) => (
                                            <div key={emp.employeeId} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                                                        {emp.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-white font-bold">{emp.name}</p>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{emp.hours}H Worked</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-emerald-400 font-mono">${emp.amount.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                            {/* Mobile Spacing */}
                            <div className="h-32 md:hidden"></div>
                        </div>
                    ) : activeView === 'settings' ? (
                        <div className="max-w-md mx-auto space-y-10 pb-32">
                            <HRSettingsForm userEmail={userEmail} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <Activity className="w-16 h-16 text-slate-600 mb-6" />
                            <p className="text-slate-500 font-black uppercase tracking-[0.2em]">Select an option from the sidebar</p>
                        </div>
                    )}
                </div>
            </div>

            <AddEmployeeForm
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchData}
            />

            <EditAttendanceModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setRecordToEdit(null);
                }}
                onSuccess={() => fetchStats(selectedDate)}
                record={recordToEdit}
                selectedDate={selectedDate}
            />

            <CreateAttendanceModal
                isOpen={showManualModal}
                onClose={() => setShowManualModal(false)}
                onSuccess={() => fetchStats(selectedDate)}
                employees={employees}
            />

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirmation && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLogoutConfirmation(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-sm glass-card rounded-[2.5rem] p-8 text-center border border-white/10 shadow-2xl"
                        >
                            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <LogOut className="w-10 h-10 text-rose-500" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Sign Out</h3>
                            <p className="text-slate-400 font-medium mb-8">Are you sure you want to end your session?</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowLogoutConfirmation(false)}
                                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={logout}
                                    className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold transition-all shadow-xl shadow-rose-500/20"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Employee Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteConfirm(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md glass-card rounded-[2.5rem] p-10 text-center border border-white/10 shadow-2xl"
                        >
                            <div className="w-24 h-24 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                                <UserX className="w-12 h-12 text-rose-500" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Delete Employee</h3>
                            <div className="mb-8">
                                <p className="text-slate-400 font-medium mb-1">Are you sure you want to remove</p>
                                <p className="text-xl font-black text-white uppercase tracking-tight">{employeeToDelete?.name}?</p>
                                <div className="mt-4 p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">
                                        Warning: This will permanently delete all associated attendance history and payroll records.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteEmployee}
                                    disabled={isDeleting !== null}
                                    className="flex-1 py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-rose-600/20 disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete Employee'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

const HRSettingsForm = ({ userEmail }: { userEmail: string }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: userEmail || '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await axios.patch('/api/auth/account', {
                email: formData.email,
                password: formData.password || undefined
            });
            alert('Settings updated successfully!');
            setFormData({ ...formData, password: '', confirmPassword: '' });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Settings className="w-24 h-24 text-white" />
            </div>

            <h3 className="text-2xl font-black text-white mb-10 tracking-tight">Account Settings</h3>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                    <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input
                        required
                        className="w-full bg-slate-900/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        value={formData.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div className="pt-8 border-t border-white/5 space-y-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
                        <p className="text-xs font-bold text-blue-400 leading-relaxed uppercase tracking-wide">Leave password fields empty to keep current password.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                            <input
                                type="password"
                                className="w-full bg-slate-900/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                value={formData.password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                            <input
                                type="password"
                                className="w-full bg-slate-900/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                value={formData.confirmPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 px-8 py-5 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                    ) : 'Update Settings'}
                </motion.button>
            </form>
        </motion.div>
    );
};
