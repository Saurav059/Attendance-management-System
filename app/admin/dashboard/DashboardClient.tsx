'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Users, Clock, UserCheck, UserX, LogOut, Plus, DollarSign, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import EmployeeProfile from './components/EmployeeProfile';
import AddEmployeeForm from './components/AddEmployeeForm';

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
    const [employees, setEmployees] = useState(initialEmployees);
    const [loading, setLoading] = useState(false);
    const [activeView, setActiveView] = useState<'overview' | 'employees' | 'payroll' | 'settings'>('overview');
    const [showAddModal, setShowAddModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

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

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm('Are you sure you want to delete this employee? This will also remove all their attendance history.')) return;
        setIsDeleting(id);
        try {
            await axios.delete(`/api/employees/${id}`);
            setEmployees(employees.filter(e => e.id !== id));
        } catch (err) {
            alert('Failed to delete employee');
        } finally {
            setIsDeleting(null);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-xs md:text-sm mb-1">{title}</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">{value || 0}</h3>
                </div>
                <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-slate-900 flex">
            {/* Sidebar */}
            <div className="w-64 bg-slate-800/50 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col hidden md:flex">
                <h1 className="text-2xl font-bold text-white mb-10">HR Admin</h1>
                <nav className="flex-1 space-y-2">
                    <button
                        onClick={() => { setActiveView('overview'); setSelectedEmployeeId(null); }}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all cursor-pointer ${activeView === 'overview' && !selectedEmployeeId
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'text-slate-400 hover:bg-white/5'
                            }`}
                    >
                        <Clock className="w-5 h-5" />
                        Dashboard
                    </button>
                    <button
                        onClick={() => { setActiveView('employees'); setSelectedEmployeeId(null); }}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all cursor-pointer ${activeView === 'employees' && !selectedEmployeeId
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'text-slate-400 hover:bg-white/5'
                            }`}
                    >
                        <Users className="w-5 h-5" />
                        Employees
                    </button>
                    <button
                        onClick={() => { setActiveView('payroll'); setSelectedEmployeeId(null); }}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all cursor-pointer ${activeView === 'payroll'
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'text-slate-400 hover:bg-white/5'
                            }`}
                    >
                        <DollarSign className="w-5 h-5" />
                        Payroll
                    </button>
                    <button
                        onClick={() => { setActiveView('settings'); setSelectedEmployeeId(null); }}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all cursor-pointer ${activeView === 'settings'
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'text-slate-400 hover:bg-white/5'
                            }`}
                    >
                        <Settings className="w-5 h-5" />
                        Settings
                    </button>
                </nav>

                <div className="border-t border-white/5 pt-6">
                    <div className="flex items-center gap-3 mb-6 px-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {userEmail?.[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{userEmail}</p>
                            <p className="text-xs text-slate-400">Administrator</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm flex items-center gap-2 transition-colors cursor-pointer">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 pb-24 md:p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-6 md:mb-8">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">
                            {selectedEmployeeId ? 'Employee Profile' :
                                activeView === 'overview' ? 'Dashboard Overview' :
                                    activeView === 'employees' ? 'Employee Management' :
                                        activeView === 'payroll' ? 'Payroll Management' : 'HR Settings'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {activeView === 'employees' && !selectedEmployeeId && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20 cursor-pointer text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden md:inline">Add Employee</span>
                                <span className="md:hidden">Add</span>
                            </button>
                        )}
                        <button
                            onClick={logout}
                            className="md:hidden p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            aria-label="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {selectedEmployeeId ? (
                    <EmployeeProfile
                        employeeId={selectedEmployeeId}
                        onBack={() => setSelectedEmployeeId(null)}
                    />
                ) : activeView === 'overview' ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Total Employees" value={stats?.totalEmployees} icon={Users} color="bg-blue-500" />
                            <StatCard title="Present Today" value={stats?.present} icon={UserCheck} color="bg-green-500" />
                            <StatCard title="Absent" value={stats?.absent} icon={UserX} color="bg-red-500" />
                            <StatCard title="Active Clock-ins" value={stats?.activeClockIns} icon={Clock} color="bg-orange-500" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-slate-800/50 border border-white/5 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-6">Attendance Trends</h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="99%" height="100%">
                                        <LineChart data={stats?.chartData || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#94a3b8"
                                                tickFormatter={(str) => {
                                                    try {
                                                        return format(new Date(str), 'MM/dd');
                                                    } catch {
                                                        return str;
                                                    }
                                                }}
                                            />
                                            <YAxis stroke="#94a3b8" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="present"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: '#3b82f6' }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
                                <div className="space-y-4">
                                    {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                                        <p className="text-slate-500 text-center py-4">No activity today</p>
                                    )}
                                    {stats?.recentActivity?.map((record: any) => (
                                        <div key={record.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white uppercase">
                                                    {record.employee.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{record.employee.name}</p>
                                                    <p className="text-xs text-slate-400">
                                                        {record.clockOutTime ? 'Clocked Out' : 'Clocked In'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-400 font-mono">
                                                {format(new Date(record.clockOutTime || record.clockInTime), 'HH:mm')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Daily Detailed Status Table */}
                        <div className="bg-slate-800/50 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                            <div className="p-6 border-b border-white/5">
                                <h3 className="text-lg font-bold text-white">Daily Detailed Status</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5">
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Clock In</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Clock Out</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Total Hours</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {stats?.dailyDetails?.map((detail: any) => (
                                            <tr key={detail.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-sm text-white font-medium">{detail.name}</td>
                                                <td className="px-6 py-4">
                                                    {detail.clockIn ? (
                                                        <span className="text-sm font-mono text-green-400">
                                                            {format(new Date(detail.clockIn), 'HH:mm:ss')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-500">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {detail.clockOut ? (
                                                        <span className="text-sm font-mono text-red-400">
                                                            {format(new Date(detail.clockOut), 'HH:mm:ss')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-500">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                                                        {detail.totalHours.toFixed(2)}h
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${detail.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                                                        detail.status === 'CLOCKED_IN' ? 'bg-blue-500/10 text-blue-400' :
                                                            'bg-red-500/10 text-red-400'
                                                        }`}>
                                                        {detail.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : activeView === 'employees' ? (
                    <div className="space-y-4">
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-slate-800/50 border border-white/5 rounded-2xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5">
                                        <th className="px-6 py-4 text-sm font-medium text-slate-400 uppercase tracking-widest">Employee ID</th>
                                        <th className="px-6 py-4 text-sm font-medium text-slate-400 uppercase tracking-widest">Name</th>
                                        <th className="px-6 py-4 text-sm font-medium text-slate-400 uppercase tracking-widest">Department</th>
                                        <th className="px-6 py-4 text-sm font-medium text-slate-400 uppercase tracking-widest">Role</th>
                                        <th className="px-6 py-4 text-sm font-medium text-slate-400 text-right uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {employees.map((emp) => (
                                        <tr
                                            key={emp.id}
                                            className="hover:bg-white/5 transition-colors group cursor-pointer"
                                            onClick={() => setSelectedEmployeeId(emp.id)}
                                        >
                                            <td className="px-6 py-4 font-mono text-blue-400 text-sm">{emp.employeeId}</td>
                                            <td className="px-6 py-4 text-white font-medium">{emp.name}</td>
                                            <td className="px-6 py-4 text-slate-400">{emp.department || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md text-xs font-medium border border-blue-500/20">
                                                    {emp.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteEmployee(emp.id);
                                                    }}
                                                    disabled={isDeleting === emp.id}
                                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all text-sm font-medium cursor-pointer"
                                                >
                                                    {isDeleting === emp.id ? 'Deleting...' : 'Remove'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3 pb-20">
                            {employees.map((emp) => (
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
                                            <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Department</span>
                                            <span className="text-slate-300 text-sm">{emp.department || 'N/A'}</span>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Action</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteEmployee(emp.id);
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
                        </div>
                    </div>
                ) : activeView === 'payroll' ? (
                    <div className="space-y-8">
                        {initialPayrollData.map((period: any, idx: number) => (
                            <div key={idx} className="bg-slate-800/50 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                                <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Payroll Period</h3>
                                        <p className="text-sm text-slate-400">{period.period}</p>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-900/30">
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Hours</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {period.employees.map((emp: any) => (
                                                <tr key={emp.employeeId} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-white">{emp.name}</td>
                                                    <td className="px-6 py-4 text-right text-slate-300">{emp.hours}h</td>
                                                    <td className="px-6 py-4 text-right font-bold text-white">${emp.amount.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activeView === 'settings' ? (
                    <div className="max-w-md mx-auto">
                        <HRSettingsForm userEmail={userEmail} />
                    </div>
                ) : null}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setShowAddModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-slate-800/90 border border-white/10 rounded-2xl w-full max-w-2xl p-8 shadow-2xl backdrop-blur-xl"
                        >
                            <h3 className="text-xl font-bold text-white mb-6">Add New Employee</h3>
                            <AddEmployeeForm
                                onSuccess={() => {
                                    setShowAddModal(false);
                                    fetchData();
                                }}
                                onCancel={() => setShowAddModal(false)}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/5 px-6 py-3 flex justify-between items-center z-40 pb-safe">
                <button
                    onClick={() => { setActiveView('overview'); setSelectedEmployeeId(null); }}
                    className={`flex flex-col items-center gap-1 transition-all ${activeView === 'overview' && !selectedEmployeeId ? 'text-blue-400' : 'text-slate-500'}`}
                >
                    <Clock className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Dashboard</span>
                </button>
                <button
                    onClick={() => { setActiveView('employees'); setSelectedEmployeeId(null); }}
                    className={`flex flex-col items-center gap-1 transition-all ${activeView === 'employees' && !selectedEmployeeId ? 'text-blue-400' : 'text-slate-500'}`}
                >
                    <Users className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Employees</span>
                </button>
                <button
                    onClick={() => { setActiveView('payroll'); setSelectedEmployeeId(null); }}
                    className={`flex flex-col items-center gap-1 transition-all ${activeView === 'payroll' ? 'text-blue-400' : 'text-slate-500'}`}
                >
                    <DollarSign className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Payroll</span>
                </button>
                <button
                    onClick={() => { setActiveView('settings'); setSelectedEmployeeId(null); }}
                    className={`flex flex-col items-center gap-1 transition-all ${activeView === 'settings' ? 'text-blue-400' : 'text-slate-500'}`}
                >
                    <Settings className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Settings</span>
                </button>
            </div>
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
            className="bg-slate-800/50 border border-white/5 p-8 rounded-2xl backdrop-blur-xl"
        >
            <h3 className="text-xl font-bold text-white mb-6">HR Account Settings</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">HR Email / Login ID</label>
                    <input
                        required
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-slate-500 mb-4">Leave password fields empty to keep current password.</p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">New Password</label>
                            <input
                                type="password"
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </motion.div>
    );
};
