import { useState } from 'react';
import { PurchaseOrder, PurchaseOrderItem } from '../services/mockData';
import { ArrowLeft, ClipboardList, FileText, Check, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface PurchaseOrderDetailsProps {
    order: PurchaseOrder;
    onClose: () => void;
    onSave: (updatedItems: PurchaseOrderItem[], documents: string[]) => void;
}

const PurchaseOrderDetails = ({ order, onClose, onSave }: PurchaseOrderDetailsProps) => {
    const [editableItems, setEditableItems] = useState<PurchaseOrderItem[]>(() => {
        return JSON.parse(JSON.stringify(order.items)); // deep clone
    });
    const [doc1Name, setDoc1Name] = useState(order.documents?.[0] || '');
    const [doc2Name, setDoc2Name] = useState(order.documents?.[1] || '');
    const [doc3Name, setDoc3Name] = useState(order.documents?.[2] || '');
    const [uploadingDoc, setUploadingDoc] = useState<number | null>(null);

    // Handle unit price edits
    const handlePriceChange = (index: number, val: number) => {
        const updated = [...editableItems];
        updated[index].supplierUnitPrice = val;
        setEditableItems(updated);
    };

    // Simulate file upload
    const handleFileChange = (slot: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingDoc(slot);
        toast.loading(`Uploading ${file.name}...`, { id: 'details-upload-toast' });

        setTimeout(() => {
            setUploadingDoc(null);
            toast.success(`Uploaded ${file.name} successfully!`, { id: 'details-upload-toast' });
            
            if (slot === 1) setDoc1Name(file.name);
            else if (slot === 2) setDoc2Name(file.name);
            else if (slot === 3) setDoc3Name(file.name);
        }, 1200);
    };

    // Calculate total order value
    const calculateOrderTotal = (itemsList: PurchaseOrderItem[]) => {
        return itemsList.reduce((sum, item) => sum + (item.quantity * item.supplierUnitPrice), 0);
    };

    const handleSave = () => {
        // Validate unit prices
        const zeroPriceItems = editableItems.filter(item => item.supplierUnitPrice <= 0);
        if (zeroPriceItems.length > 0) {
            toast.error('Please configure a valid unit price for all items.');
            return;
        }

        // Validate uploads
        if (!doc1Name || !doc2Name || !doc3Name) {
            toast.error('Please upload all 3 required supporting documents.');
            return;
        }

        onSave(editableItems, [doc1Name, doc2Name, doc3Name]);
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
            {/* Back Navigation & Breadcrumb */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={onClose} 
                    className="inline-flex items-center gap-2 text-sm font-semibold text-lime hover:underline bg-transparent border-none cursor-pointer" 
                    style={{ color: 'var(--brand-lime)' }}
                >
                    <ArrowLeft size={16} />
                    <span>Back to Purchase Orders</span>
                </button>
                <div className="text-xs text-muted">
                    Purchase Orders / <span className="text-main" style={{ color: 'var(--text-main)' }}>{order.id}</span>
                </div>
            </div>

            {/* Status Header Banner */}
            <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            order.status === 'processed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}
                    >
                        {order.status === 'processed' ? <ShieldCheck size={24} /> : <Clock size={24} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-main" style={{ color: 'var(--text-main)' }}>
                                Order {order.id} Audit
                            </h2>
                            <span className={`badge ${
                                order.status === 'processed' ? 'badge-lime' : 'badge-orange'
                            }`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                            Supplier: <span className="font-semibold text-main" style={{ color: 'var(--text-main)' }}>{order.supplierName}</span> • Requested on {order.date}
                        </p>
                    </div>
                </div>

                <div className="text-left md:text-right">
                    <span className="text-xs text-muted block">Estimated Purchase Value</span>
                    <span className="text-2xl font-black text-lime" style={{ color: 'var(--brand-lime)' }}>
                        {formatCurrency(calculateOrderTotal(editableItems))}
                    </span>
                </div>
            </div>

            {/* Content Layout Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side: General details & Pricing inputs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Info Card */}
                    <div className="glass-card p-5 space-y-4">
                        <h3 className="text-sm font-bold border-b pb-3 text-main" style={{ borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
                            Purchase Request Information
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-muted">
                            <div>
                                <span className="block text-[9px] uppercase font-bold text-dim mb-0.5" style={{ color: 'var(--text-dim)' }}>Supplier Code</span>
                                <span className="font-medium text-main" style={{ color: 'var(--text-main)' }}>SPL-{order.supplierName.substring(0,3).toUpperCase()}</span>
                            </div>
                            <div>
                                <span className="block text-[9px] uppercase font-bold text-dim mb-0.5" style={{ color: 'var(--text-dim)' }}>Audit Specialist</span>
                                <span className="font-medium text-main" style={{ color: 'var(--text-main)' }}>Vikrant Verma (Merchandiser)</span>
                            </div>
                            <div>
                                <span className="block text-[9px] uppercase font-bold text-dim mb-0.5" style={{ color: 'var(--text-dim)' }}>Verification State</span>
                                <span className="font-medium text-main" style={{ color: 'var(--text-main)' }}>{order.status === 'processed' ? 'Audited' : 'Pending Review'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Config Card */}
                    <div className="glass-card p-5 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-main)' }}>
                            <h3 className="text-sm font-bold text-main" style={{ color: 'var(--text-main)' }}>
                                Configure Supplier Unit Prices
                            </h3>
                            <span className="text-[10px] bg-white/5 border px-2 py-0.5 rounded text-muted" style={{ borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}>
                                {editableItems.length} items listed
                            </span>
                        </div>

                        <div className="space-y-3">
                            {editableItems.map((item, idx) => (
                                <div 
                                    key={item.id} 
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-colors hover:border-lime/20"
                                    style={{ background: 'var(--bg-input)', borderColor: 'var(--border-main)' }}
                                >
                                    <div className="flex-1 space-y-1">
                                        <div className="text-sm font-bold text-main" style={{ color: 'var(--text-main)' }}>{item.name}</div>
                                        <div className="text-[10px] text-muted flex items-center gap-2">
                                            <span>Part ID: <span className="font-mono">{item.id}</span></span>
                                            <span>•</span>
                                            <span>Quantity: <span className="font-bold text-main" style={{ color: 'var(--text-main)' }}>{item.quantity} units</span></span>
                                        </div>
                                    </div>
                                    
                                    {/* Price Input Form */}
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-xs text-muted">Supplier Price (₹):</span>
                                        <input
                                            type="number"
                                            value={item.supplierUnitPrice || ''}
                                            placeholder="Enter Price"
                                            onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                                            className="input-field py-1.5 px-3 h-10 w-32 font-bold text-lime focus:border-lime"
                                            style={{ color: 'var(--brand-lime)', minHeight: 'auto' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Document uploads & summary action */}
                <div className="space-y-6">
                    {/* Document Upload Card */}
                    <div className="glass-card p-5 space-y-4">
                        <h3 className="text-sm font-bold border-b pb-3 text-main" style={{ borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
                            Supporting Documents (3 Required)
                        </h3>

                        <div className="space-y-3">
                            {/* Document slot 1 */}
                            <div className="p-3.5 rounded-xl border flex flex-col items-stretch relative" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-main)' }}>
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className={doc1Name ? "text-lime" : "text-muted"} style={{ color: doc1Name ? "var(--brand-lime)" : "var(--text-muted)" }} />
                                    <div className="flex-1 min-w-0">
                                        <span className="block text-xs font-bold text-main" style={{ color: 'var(--text-main)' }}>1. Supplier Quotation</span>
                                        <span className="block text-[9px] text-dim truncate" style={{ color: 'var(--text-dim)' }}>
                                            {doc1Name || 'No PDF/Image uploaded'}
                                        </span>
                                    </div>
                                    {doc1Name && <span className="text-emerald-500 text-xs font-bold">✓</span>}
                                </div>
                                <label className="mt-3 py-1.5 px-3 bg-white/5 border border-white/10 hover:border-lime rounded-lg text-[10px] font-bold text-center cursor-pointer transition-all">
                                    <span>{doc1Name ? 'Replace Document' : 'Choose File to Upload'}</span>
                                    <input 
                                        type="file" 
                                        accept=".pdf,.png,.jpg,.jpeg" 
                                        onChange={(e) => handleFileChange(1, e)} 
                                        className="hidden" 
                                    />
                                </label>
                            </div>

                            {/* Document slot 2 */}
                            <div className="p-3.5 rounded-xl border flex flex-col items-stretch relative" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-main)' }}>
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className={doc2Name ? "text-lime" : "text-muted"} style={{ color: doc2Name ? "var(--brand-lime)" : "var(--text-muted)" }} />
                                    <div className="flex-1 min-w-0">
                                        <span className="block text-xs font-bold text-main" style={{ color: 'var(--text-main)' }}>2. Commercial Invoice</span>
                                        <span className="block text-[9px] text-dim truncate" style={{ color: 'var(--text-dim)' }}>
                                            {doc2Name || 'No PDF/Image uploaded'}
                                        </span>
                                    </div>
                                    {doc2Name && <span className="text-emerald-500 text-xs font-bold">✓</span>}
                                </div>
                                <label className="mt-3 py-1.5 px-3 bg-white/5 border border-white/10 hover:border-lime rounded-lg text-[10px] font-bold text-center cursor-pointer transition-all">
                                    <span>{doc2Name ? 'Replace Document' : 'Choose File to Upload'}</span>
                                    <input 
                                        type="file" 
                                        accept=".pdf,.png,.jpg,.jpeg" 
                                        onChange={(e) => handleFileChange(2, e)} 
                                        className="hidden" 
                                    />
                                </label>
                            </div>

                            {/* Document slot 3 */}
                            <div className="p-3.5 rounded-xl border flex flex-col items-stretch relative" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-main)' }}>
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className={doc3Name ? "text-lime" : "text-muted"} style={{ color: doc3Name ? "var(--brand-lime)" : "var(--text-muted)" }} />
                                    <div className="flex-1 min-w-0">
                                        <span className="block text-xs font-bold text-main" style={{ color: 'var(--text-main)' }}>3. Compliance Certificate</span>
                                        <span className="block text-[9px] text-dim truncate" style={{ color: 'var(--text-dim)' }}>
                                            {doc3Name || 'No PDF/Image uploaded'}
                                        </span>
                                    </div>
                                    {doc3Name && <span className="text-emerald-500 text-xs font-bold">✓</span>}
                                </div>
                                <label className="mt-3 py-1.5 px-3 bg-white/5 border border-white/10 hover:border-lime rounded-lg text-[10px] font-bold text-center cursor-pointer transition-all">
                                    <span>{doc3Name ? 'Replace Document' : 'Choose File to Upload'}</span>
                                    <input 
                                        type="file" 
                                        accept=".pdf,.png,.jpg,.jpeg" 
                                        onChange={(e) => handleFileChange(3, e)} 
                                        className="hidden" 
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Total & Save Actions Widget */}
                    <div className="glass-card p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted">Audited Cost Sum:</span>
                            <span className="text-xl font-black text-lime" style={{ color: 'var(--brand-lime)' }}>
                                {formatCurrency(calculateOrderTotal(editableItems))}
                            </span>
                        </div>
                        
                        <div className="flex gap-2 text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl">
                            <AlertTriangle size={16} className="flex-shrink-0" />
                            <span>Completing the audit will seal the PO pricing structure and mark it as active.</span>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary flex-1 py-2"
                                style={{ minHeight: '40px' }}
                            >
                                Discard
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="btn-primary flex-1 py-2 font-bold"
                                style={{ minHeight: '40px' }}
                            >
                                Complete PO Audit
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PurchaseOrderDetails;
