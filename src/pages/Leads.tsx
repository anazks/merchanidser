import { useState, useEffect } from 'react';
import { getLeads, saveLeads, SalesLead } from '../services/mockData';
import { Phone, Mail, User, Calendar, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Leads = () => {
    const [leads, setLeads] = useState<SalesLead[]>([]);
    const [selectedLead, setSelectedLead] = useState<SalesLead | null>(null);
    const [interactionNote, setInteractionNote] = useState('');

    useEffect(() => {
        setLeads(getLeads());
    }, []);

    const updateLeadStatus = (id: string, newStatus: SalesLead['status']) => {
        const updated = leads.map(lead => {
            if (lead.id === id) {
                toast.success(`Lead status updated to ${newStatus}`);
                return { ...lead, status: newStatus };
            }
            return lead;
        });
        setLeads(updated);
        saveLeads(updated);
    };

    const handleLogInteraction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLead || !interactionNote.trim()) return;

        const updated = leads.map(lead => {
            if (lead.id === selectedLead.id) {
                return {
                    ...lead,
                    notes: `${lead.notes} | Update: ${interactionNote.trim()}`,
                    status: lead.status === 'new' ? 'contacted' as const : lead.status
                };
            }
            return lead;
        });

        setLeads(updated);
        saveLeads(updated);
        setInteractionNote('');
        setSelectedLead(null);
        toast.success('Sales interaction logged successfully.');
    };

    return (
        <div className="space-y-6 animate-fadeInUp">
            {/* Header section */}
            <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Sales Leads</h2>
                <p className="text-xs text-muted">Track buyer inquiries, arrange test drives, and manage purchase reservations</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Leads Queue List */}
                <div className="lg:col-span-2 space-y-4">
                    {leads.map((lead) => (
                        <div 
                            key={lead.id} 
                            className="glass-card p-5 relative overflow-hidden transition-all duration-150 border hover:border-lime/30"
                            style={{ borderColor: 'var(--border-main)' }}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                {/* Left Info */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono text-muted uppercase tracking-wider">{lead.id}</span>
                                        <span className="text-xs text-muted">•</span>
                                        <span className="text-xs text-muted flex items-center gap-1">
                                            <Calendar size={12} />
                                            {lead.date}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-main" style={{ color: 'var(--text-main)' }}>
                                        {lead.customerName}
                                    </h3>
                                    
                                    {/* Contacts */}
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted" style={{ color: 'var(--text-muted)' }}>
                                        <span className="flex items-center gap-1">
                                            <Phone size={12} className="text-lime" style={{ color: 'var(--brand-lime)' }} />
                                            {lead.customerPhone}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Mail size={12} className="text-lime" style={{ color: 'var(--brand-lime)' }} />
                                            {lead.customerEmail}
                                        </span>
                                    </div>
                                </div>

                                {/* Right Badges / Actions */}
                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                                    <span className={`badge ${
                                        lead.status === 'new' ? 'badge-blue' :
                                        lead.status === 'contacted' ? 'badge-orange' :
                                        lead.status === 'reserved' ? 'badge-lime' : 'badge-green'
                                    }`}>
                                        {lead.status}
                                    </span>
                                    
                                    <select
                                        value={lead.status}
                                        onChange={(e) => updateLeadStatus(lead.id, e.target.value as SalesLead['status'])}
                                        className="input-field py-1 px-2.5 h-8 text-[11px] rounded-lg bg-white/5 border border-white/10 w-32 cursor-pointer font-medium"
                                        style={{ minHeight: 'auto' }}
                                    >
                                        <option value="new">Mark New</option>
                                        <option value="contacted">Mark Contacted</option>
                                        <option value="reserved">Mark Reserved</option>
                                        <option value="sold">Mark Sold</option>
                                    </select>
                                </div>
                            </div>

                            {/* Interest vehicle details */}
                            <div className="mt-4 p-3 rounded-xl border border-dashed" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-main)' }}>
                                <div className="text-[10px] text-muted uppercase font-bold mb-1">Interested Vehicle</div>
                                <div className="text-xs font-bold text-main" style={{ color: 'var(--text-main)' }}>{lead.vehicleName}</div>
                                <div className="text-xs text-muted mt-2 leading-relaxed flex items-start gap-1">
                                    <MessageSquare size={13} className="mt-0.5 flex-shrink-0 text-lime" style={{ color: 'var(--brand-lime)' }} />
                                    <span>"{lead.notes}"</span>
                                </div>
                            </div>

                            {/* Bottom row action log trigger */}
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => setSelectedLead(lead)}
                                    className="btn-secondary py-1 px-4 text-xs font-bold h-9 cursor-pointer"
                                    style={{ minHeight: 'auto' }}
                                >
                                    Log Interaction
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Log Interaction Sidebar widget */}
                <div className="glass-card p-5 h-fit lg:sticky lg:top-4">
                    <h3 className="font-bold text-sm mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                        <Phone size={16} className="text-lime" style={{ color: 'var(--brand-lime)' }} />
                        Log Call / Inquiry
                    </h3>
                    
                    {selectedLead ? (
                        <form onSubmit={handleLogInteraction} className="space-y-4 mt-4">
                            <div className="p-3 rounded-xl text-xs bg-white/5 border border-white/5 space-y-1">
                                <div className="font-bold text-main" style={{ color: 'var(--text-main)' }}>{selectedLead.customerName}</div>
                                <div className="text-muted">{selectedLead.vehicleName}</div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1 text-muted">Interaction Notes</label>
                                <textarea
                                    required
                                    placeholder="Summarize the outcome of the phone call or email discussion..."
                                    value={interactionNote}
                                    onChange={(e) => setInteractionNote(e.target.value)}
                                    rows={4}
                                    className="input-field w-full text-xs py-2 h-auto"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedLead(null);
                                        setInteractionNote('');
                                    }}
                                    className="btn-secondary py-2 flex-1 text-xs"
                                    style={{ minHeight: '38px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary py-2 flex-1 text-xs font-bold"
                                    style={{ minHeight: '38px' }}
                                >
                                    Save Entry
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="mt-6 flex flex-col items-center justify-center text-center p-6 bg-white/5 rounded-xl border border-white/5">
                            <AlertCircle size={28} className="text-dim mb-2" style={{ color: 'var(--text-dim)' }} />
                            <p className="text-xs text-muted">Select a customer listing from the queue to record phone notes or status updates.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leads;
