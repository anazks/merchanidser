import { useState, useEffect } from 'react';
import { getValuations, saveValuations, getPurchaseOrders, savePurchaseOrders, ValuationRequest, PurchaseOrder } from '../services/mockData';
import { DollarSign, Clock, FileText, CheckCircle, XCircle, Edit, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const Valuations = () => {
    const [valuations, setValuations] = useState<ValuationRequest[]>([]);
    const [selectedValuation, setSelectedValuation] = useState<ValuationRequest | null>(null);
    const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
    
    // Evaluation Form States
    const [offeredPrice, setOfferedPrice] = useState(0);
    const [estimatedRepairs, setEstimatedRepairs] = useState(0);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        setValuations(getValuations());
    }, []);

    const openEvaluation = (valuation: ValuationRequest) => {
        setSelectedValuation(valuation);
        setOfferedPrice(valuation.offeredPrice);
        setEstimatedRepairs(valuation.estimatedRepairs);
        setNotes(valuation.conditionDescription);
        setIsEvalModalOpen(true);
    };

    const handleAction = (status: 'accepted' | 'rejected' | 'renegotiating') => {
        if (!selectedValuation) return;

        // Update Valuations State
        const updatedValuations = valuations.map(v => {
            if (v.id === selectedValuation.id) {
                return {
                    ...v,
                    offeredPrice,
                    estimatedRepairs,
                    conditionDescription: notes,
                    status
                };
            }
            return v;
        });

        setValuations(updatedValuations);
        saveValuations(updatedValuations);

        // If accepted, add to Purchase Orders instead of Vehicles
        if (status === 'accepted') {
            const currentOrders = getPurchaseOrders();
            const newOrder: PurchaseOrder = {
                id: `PO-${800 + currentOrders.length + 1}`,
                supplierName: `Trade-In: ${selectedValuation.customerName}`,
                date: new Date().toISOString().split('T')[0],
                status: 'processed', // processed because we agreed on procurement pricing
                items: [
                    {
                        id: `ITM-VAL-${selectedValuation.id}`,
                        name: `${selectedValuation.brand} ${selectedValuation.model} (${selectedValuation.year}) - Trade-In Procurement`,
                        quantity: 1,
                        supplierUnitPrice: offeredPrice
                    }
                ],
                documents: ['procured_consent.pdf', 'rto_transfer_form.pdf', 'inspection_report.pdf']
            };

            const updatedOrders = [newOrder, ...currentOrders];
            savePurchaseOrders(updatedOrders);
            toast.success(`Trade-in Approved! Created processed PO ${newOrder.id} for procurement.`);
        } else if (status === 'rejected') {
            toast.error('Offer declined by customer or evaluator.');
        } else {
            toast.success('Counter offer sent back to customer.');
        }

        setIsEvalModalOpen(false);
        setSelectedValuation(null);
    };


    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="space-y-6 animate-fadeInUp">
            {/* Header section */}
            <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Trade-In Valuations</h2>
                <p className="text-xs text-muted">Review, inspect, and purchase vehicles from customers to add to inventory</p>
            </div>

            {/* Valuation List Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {valuations.map((val) => (
                    <div 
                        key={val.id} 
                        className="glass-card p-5 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                    >
                        {/* Status bar marker */}
                        <div 
                            className="absolute left-0 top-0 bottom-0 w-1.5"
                            style={{
                                backgroundColor: 
                                    val.status === 'pending' ? 'var(--warn-orange)' : 
                                    val.status === 'accepted' ? '#27AE60' : 
                                    val.status === 'rejected' ? 'var(--alert-red)' : '#3498DB'
                            }}
                        />

                        <div className="pl-2 space-y-4">
                            {/* Card Top Title */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono text-muted uppercase tracking-wider">{val.id}</span>
                                        <span className="text-xs text-muted">•</span>
                                        <span className="text-xs text-muted font-medium">{val.date}</span>
                                    </div>
                                    <h3 className="text-base font-bold mt-1 text-main" style={{ color: 'var(--text-main)' }}>
                                        {val.brand} {val.model}
                                    </h3>
                                </div>
                                <span className={`badge ${
                                    val.status === 'pending' ? 'badge-orange' : 
                                    val.status === 'accepted' ? 'badge-green' : 
                                    val.status === 'rejected' ? 'badge-red' : 'badge-blue'
                                }`}>
                                    {val.status}
                                </span>
                            </div>

                            {/* Customer Profile */}
                            <div className="grid grid-cols-2 gap-y-2 text-xs border-y py-3" style={{ borderColor: 'var(--border-main)' }}>
                                <div>
                                    <span className="block text-dim uppercase text-[9px] font-semibold" style={{ color: 'var(--text-dim)' }}>Customer</span>
                                    <span className="font-medium text-main" style={{ color: 'var(--text-main)' }}>{val.customerName}</span>
                                </div>
                                <div>
                                    <span className="block text-dim uppercase text-[9px] font-semibold" style={{ color: 'var(--text-dim)' }}>Phone</span>
                                    <span className="text-muted" style={{ color: 'var(--text-muted)' }}>{val.customerPhone}</span>
                                </div>
                                <div className="mt-1.5">
                                    <span className="block text-dim uppercase text-[9px] font-semibold" style={{ color: 'var(--text-dim)' }}>Mileage / Year</span>
                                    <span className="text-muted" style={{ color: 'var(--text-muted)' }}>{val.mileage.toLocaleString()} km ({val.year})</span>
                                </div>
                                <div className="mt-1.5">
                                    <span className="block text-dim uppercase text-[9px] font-semibold" style={{ color: 'var(--text-dim)' }}>Expected Price</span>
                                    <span className="font-semibold text-main" style={{ color: 'var(--text-main)' }}>{formatCurrency(val.customerExpectation)}</span>
                                </div>
                            </div>

                            {/* Condition note */}
                            <div>
                                <span className="block text-[9px] font-semibold uppercase text-dim mb-1" style={{ color: 'var(--text-dim)' }}>Condition Assessment</span>
                                <p className="text-xs text-muted leading-relaxed italic bg-white/5 p-2 rounded-lg border border-white/5">
                                    "{val.conditionDescription}"
                                </p>
                            </div>

                            {/* Actions / Cost estimates */}
                            <div className="flex items-center justify-between pt-2">
                                <div className="space-y-1">
                                    <span className="block text-[9px] uppercase font-semibold text-dim" style={{ color: 'var(--text-dim)' }}>Procurement Bid</span>
                                    <span className="text-lg font-bold text-lime" style={{ color: 'var(--brand-lime)' }}>{formatCurrency(val.offeredPrice)}</span>
                                </div>
                                
                                {val.status === 'pending' || val.status === 'renegotiating' ? (
                                    <button
                                        onClick={() => openEvaluation(val)}
                                        className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Edit size={14} />
                                        <span>Evaluate Offer</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-xs text-dim" style={{ color: 'var(--text-dim)' }}>
                                        {val.status === 'accepted' ? (
                                            <>
                                                <CheckCircle size={16} className="text-green-500" />
                                                <span>Procured ({formatCurrency(val.offeredPrice)})</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={16} className="text-red-500" />
                                                <span>Offer Rejected</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Valuation Dialog Modal */}
            {isEvalModalOpen && selectedValuation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="flex items-center justify-between border-b pb-4 mb-4" style={{ borderColor: 'var(--border-main)' }}>
                            <div className="flex items-center gap-2">
                                <DollarSign className="text-lime" style={{ color: 'var(--brand-lime)' }} />
                                <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Valuation Pricing Calculator</h3>
                            </div>
                            <button
                                onClick={() => setIsEvalModalOpen(false)}
                                className="text-dim hover:text-white cursor-pointer bg-transparent border-none"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                                <div className="text-[10px] text-muted uppercase font-bold">Vehicle Details</div>
                                <div className="text-sm font-bold text-main" style={{ color: 'var(--text-main)' }}>
                                    {selectedValuation.brand} {selectedValuation.model} ({selectedValuation.year})
                                </div>
                                <div className="text-xs text-muted">
                                    Customer Expectation: <span className="font-semibold text-main" style={{ color: 'var(--text-main)' }}>{formatCurrency(selectedValuation.customerExpectation)}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5 text-muted">Procurement Offer Price (₹)</label>
                                <input
                                    type="number"
                                    value={offeredPrice}
                                    onChange={(e) => setOfferedPrice(Number(e.target.value))}
                                    className="input-field w-full text-base font-bold text-lime"
                                    style={{ color: 'var(--brand-lime)' }}
                                />
                                <p className="text-[10px] text-dim mt-1" style={{ color: 'var(--text-dim)' }}>
                                    Current recommended margin: ~20% below customer expected price
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5 text-muted">Estimated Repair Cost (₹)</label>
                                <input
                                    type="number"
                                    value={estimatedRepairs}
                                    onChange={(e) => setEstimatedRepairs(Number(e.target.value))}
                                    className="input-field w-full text-main font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5 text-muted">Evaluator Remarks / Condition Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    className="input-field w-full text-xs py-2 h-auto"
                                />
                            </div>

                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl flex gap-2 text-xs text-amber-500">
                                <ShieldAlert size={18} className="flex-shrink-0" />
                                <div>
                                    <span className="font-bold">Important:</span> Approving the bid will automatically create a completed purchase order record for this vehicle procurement.
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-main)' }}>
                                <button
                                    type="button"
                                    onClick={() => handleAction('rejected')}
                                    className="btn-danger flex-1"
                                >
                                    Decline Offer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleAction('renegotiating')}
                                    className="btn-secondary flex-1"
                                >
                                    Counter Bid
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleAction('accepted')}
                                    className="btn-primary flex-1 font-bold"
                                >
                                    Approve & Procure
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Valuations;
