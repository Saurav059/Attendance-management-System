import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Users, Clock, UserCheck, UserX, LogOut, Plus, DollarSign, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import Loading from '../components/Loading';
import EmployeeProfile from './EmployeeProfile';

const Dashboard = () => {
    const { logout, user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<'overview' | 'employees' | 'payroll' | 'settings'>('overview');
    const [showAddModal, setShowAddModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

    const [weeklyTrend, setWeeklyTrend] = useState<any[]>([]);
    const [payrollData, setPayrollData] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
        if (activeView === 'overview') fetchWeeklyTrend();
        if (activeView === 'payroll') fetchPayroll();
    }, [activeView]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeView === 'overview') {
                const res = await api.get('/reports/dashboard');
                setStats(res.data);
            } else if (activeView === 'employees') {
                const res = await api.get('/employees');
                setEmployees(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchWeeklyTrend = async () => {
        try {
            const res = await api.get('/reports/weekly-history');
            setWeeklyTrend(res.data);
        } catch (err) {
            console.error('Failed to fetch weekly trend:', err);
        }
    };

    const fetchPayroll = async () => {
        setLoading(true);
        try {
            const res = await api.get('/reports/payroll');
            setPayrollData(res.data);
        } catch (err) {
            console.error('Failed to fetch payroll:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm('Are you sure you want to delete this employee? This will also remove all their attendance history.')) return;
        setIsDeleting(id);
        try {
            await api.delete(`/employees/${id}`);
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
                    <p className="text-slate-400 text-sm mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-white">{value || 0}</h3>
                </div>
                <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
            </div>
        </motion.div>
    );

    if (loading && !stats && activeView === 'overview') return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <Loading />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 flex">
            {/* Sidebar */}
            <div className="w-64 bg-slate-800/50 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col hidden md:flex">
                <h1 className="text-2xl font-bold text-white mb-10">HR Admin</h1>
                <nav className="flex-1 space-y-2">
                    <button
                        onClick={() => setActiveView('overview')}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all ${activeView === 'overview'
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'text-slate-400 hover:bg-white/5'
                            }`}
                    >
                        <Clock className="w-5 h-5" />
                        Dashboard
                    </button>
                    <button
                        onClick={() => {
                            setActiveView('employees');
                            setSelectedEmployeeId(null);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all ${activeView === 'employees'
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'text-slate-400 hover:bg-white/5'
                            }`}
                    >
                        <Users className="w-5 h-5" />
                        Employees
                    </button>
                    <button
                        onClick={() => setActiveView('payroll')}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all ${activeView === 'payroll'
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'text-slate-400 hover:bg-white/5'
                            }`}
                    >
                        <DollarSign className="w-5 h-5" />
                        Payroll
                    </button>
                    <button
                        onClick={() => setActiveView('settings')}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all ${activeView === 'settings'
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
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                            <p className="text-xs text-slate-400">Administrator</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm flex items-center gap-2 transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {selectedEmployeeId ? 'Employee Profile' :
                                activeView === 'overview' ? 'Dashboard Overview' :
                                    activeView === 'employees' ? 'Employee Management' :
                                        'HR Settings'}
                        </h2>
                        <p className="text-slate-400">
                            {selectedEmployeeId
                                ? 'Detailed performance and history'
                                : activeView === 'overview'
                                    ? "Welcome back, here's what's happening today."
                                    : activeView === 'employees'
                                        ? "Manage your workforce and view employee details."
                                        : "Manage your HR account credentials."}
                        </p>
                    </div>
                    {activeView === 'employees' && !selectedEmployeeId && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                        >
                            <Plus className="w-4 h-4" />
                            Add Employee
                        </button>
                    )}
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
                                <h3 className="text-lg font-bold text-white mb-6">Attendance Trends (Present Count)</h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
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
                                                        {record.clockOutTime
                                                            ? `Clocked Out at ${record.clockOutLocation || record.location || 'Unknown Location'}`
                                                            : `Clocked In at ${record.clockInLocation || record.location || 'Unknown Location'}`
                                                        }
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

                        {/* Weekly 1-Year Trend */}
                        <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-6">Weekly Attendance History (Last Year)</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={weeklyTrend}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis
                                            dataKey="week"
                                            stroke="#94a3b8"
                                            tickFormatter={(str) => {
                                                try {
                                                    const date = new Date(str.split(' - ')[0]);
                                                    return format(date, 'MMM');
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
                                        <Area type="monotone" dataKey="count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
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
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">ID</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Clock In</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Clock Out</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Locations</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Total Hours</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {stats?.dailyDetails?.map((detail: any) => (
                                            <tr key={detail.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-sm text-white font-medium">{detail.name}</td>
                                                <td className="px-6 py-4 text-sm font-mono text-blue-400">{detail.employeeId}</td>
                                                <td className="px-6 py-4 text-sm text-slate-400">
                                                    {detail.clockIn ? format(new Date(detail.clockIn), 'HH:mm:ss') : '--:--:--'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400">
                                                    {detail.clockOut ? format(new Date(detail.clockOut), 'HH:mm:ss') : (detail.status === 'CLOCKED_IN' ? 'In Progress' : '--:--:--')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400 max-w-[200px] truncate" title={detail.locations?.join(', ')}>
                                                    {detail.locations?.length > 0 ? detail.locations.join(', ') : '-'}
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
                ) : activeView === 'payroll' ? (
                    <div className="space-y-8">
                        {payrollData.map((period: any, idx: number) => (
                            <div key={idx} className="bg-slate-800/50 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                                <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Bi-Weekly Payroll Period</h3>
                                        <p className="text-sm text-slate-400">{period.period}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 uppercase tracking-widest">Total Period Payout</p>
                                        <p className="text-2xl font-bold text-green-400">
                                            ${period.employees.reduce((sum: number, emp: any) => sum + emp.amount, 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-900/30">
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Hours</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Rate</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Gross Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {period.employees.map((emp: any) => (
                                                <tr key={emp.employeeId} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="text-white font-medium">{emp.name}</p>
                                                        <p className="text-xs text-slate-500 font-mono">{emp.employeeId}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-slate-300 font-mono">{emp.hours.toFixed(2)}h</td>
                                                    <td className="px-6 py-4 text-right text-slate-300 font-mono">${emp.rate}/h</td>
                                                    <td className="px-6 py-4 text-right font-bold text-white">${emp.amount.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activeView === 'employees' ? (
                    <div className="bg-slate-800/50 border border-white/5 rounded-2xl overflow-hidden">
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
                                {employees.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            No employees found. Click "Add Employee" to get started.
                                        </td>
                                    </tr>
                                )}
                                {employees.map((emp) => (
                                    <tr
                                        key={emp.id}
                                        onClick={() => setSelectedEmployeeId(emp.id)}
                                        className="hover:bg-white/5 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4 font-mono text-blue-400 text-sm group-hover:text-blue-300">{emp.employeeId}</td>
                                        <td className="px-6 py-4 text-white font-medium group-hover:text-blue-200">{emp.name}</td>
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
                                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all text-sm font-medium flex items-center justify-end gap-1 ml-auto"
                                            >
                                                {isDeleting === emp.id ? 'Deleting...' : 'Remove'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="max-w-md mx-auto">
                        <HRSettingsForm />
                    </div>
                )}
            </div>

            {/* Add Employee Modal */}
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
        </div>
    );
};

const AddEmployeeForm = ({ onSuccess, onCancel }: any) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        employeeId: '',
        department: '',
        role: 'EMPLOYEE',
        hourlyRate: 20,
        position: '',
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
            // Filter out empty strings to send undefined/null for optional fields
            const payload: any = { ...formData };
            if (!payload.employeeId) delete payload.employeeId;
            if (!payload.position) delete payload.position;
            if (!payload.location) delete payload.location;
            if (!payload.gender) delete payload.gender;
            if (!payload.dateOfBirth) delete payload.dateOfBirth;
            if (!payload.phoneNumber) delete payload.phoneNumber;
            if (!payload.department) delete payload.department;

            // Should be number or undefined if 0/empty
            payload.hourlyRate = payload.hourlyRate ? Number(payload.hourlyRate) : 0;

            await api.post('/employees', payload);
            onSuccess();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to add employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <label className="block text-sm font-medium text-slate-400 mb-1">Employee ID <span className="text-xs text-slate-500">(Auto if empty)</span></label>
                            <input
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600"
                                placeholder="Auto-generate"
                                value={formData.employeeId}
                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Position</label>
                            <input
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Software Engineer"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Department</label>
                        <input
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Engineering"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                            <select
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="EMPLOYEE">Employee</option>
                                <option value="MANAGER">Manager</option>
                                <option value="INTERN">Intern</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Hourly Rate ($)</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.hourlyRate}
                                onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Location / Office</label>
                        <input
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="New York Office"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Gender</label>
                            <select
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                            <input
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="+1..."
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Date of Birth</label>
                        <input
                            type="date"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Join Date</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.joinDate}
                            onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                    {loading ? 'Adding...' : 'Add Employee'}
                </button>
            </div>
        </form>
    );
};

const HRSettingsForm = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: user?.email || '',
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
            await api.patch('/auth/account', {
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
                    className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </motion.div>
    );
};

export default Dashboard;
