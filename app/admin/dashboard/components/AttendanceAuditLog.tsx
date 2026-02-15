import React from 'react';
import { History, User, Clock, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceAuditLogProps {
    record: any;
}

export default function AttendanceAuditLog({ record }: AttendanceAuditLogProps) {
    if (!record?.isManuallyEdited) return null;

    return (
        <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
                <History className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/70">Audit Information</span>
                <span className="ml-auto px-2 py-0.5 bg-blue-500/10 rounded text-[9px] font-black tracking-widest text-blue-400">HR ADJUSTED</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-400">Edited by: {record.editedBy}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-400">Date: {format(new Date(record.editedAt), 'MMM dd, hh:mm a')}</span>
                </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
                <MessageSquare className="w-3 h-3 text-slate-500 mt-1" />
                <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                    "{record.editReason}"
                </p>
            </div>
        </div>
    );
}
