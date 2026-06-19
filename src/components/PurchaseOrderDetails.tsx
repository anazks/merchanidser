import { useState } from 'react';
import { PurchaseOrder, PurchaseOrderItem } from '../services/mockData';
import { ArrowLeft, ClipboardList, FileText, Check, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { getUser } from '../utils/auth';

interface PurchaseOrderDetailsProps {
    order: PurchaseOrder;
    onClose: () => void;
    onSave: (updatedItems: PurchaseOrderItem[], documents: string[], supplierDetails?: { name: string; email: string; phone: string; address: string }) => void;
}

const PurchaseOrderDetails = ({ order, onClose, onSave }: PurchaseOrderDetailsProps) => {
    const [editableItems, setEditableItems] = useState<PurchaseOrderItem[]>(() => {
        return JSON.parse(JSON.stringify(order.items)); // deep clone
    });
    const [doc1Name, setDoc1Name] = useState(order.documents?.[0] || '');
    const [doc2Name, setDoc2Name] = useState(order.documents?.[1] || '');
    const [doc3Name, setDoc3Name] = useState(order.documents?.[2] || '');
    const [uploadingDoc, setUploadingDoc] = useState<number | null>(null);
    const [supplierDetails, setSupplierDetails] = useState(() => {
        if (order.supplierDetails && order.supplierDetails.name) {
            return {
                name: order.supplierDetails.name,
                email: order.supplierDetails.email || '',
                phone: order.supplierDetails.phone || '',
                address: order.supplierDetails.address || ''
            };
        }
        const user = getUser();
        const merchSupplier = user?.supplier as any;
        return {
            name: merchSupplier?.name || order.supplierName || '',
            email: merchSupplier?.email || '',
            phone: merchSupplier?.phone || '',
            address: merchSupplier?.address || ''
        };
    });
    const [isEditingSupplier, setIsEditingSupplier] = useState(false);

    // Handle unit price edits
    const handlePriceChange = (index: number, val: number) => {
        const updated = [...editableItems];
        updated[index].supplierUnitPrice = val;
        setEditableItems(updated);
    };

    // Helper to format S3/local file paths for display
    const getFilename = (pathStr: string) => {
        if (!pathStr) return 'No PDF/Image uploaded';
        const parts = pathStr.split('/');
        const filenameWithTimestamp = parts[parts.length - 1];
        const underscoreIdx = filenameWithTimestamp.indexOf('_');
        if (underscoreIdx !== -1 && underscoreIdx < 15) {
            return filenameWithTimestamp.substring(underscoreIdx + 1);
        }
        return filenameWithTimestamp;
    };

    // Upload document to backend
    const handleFileChange = async (slot: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingDoc(slot);
        toast.loading(`Uploading ${file.name}...`, { id: 'details-upload-toast' });

        try {
            const formData = new FormData();
            formData.append('document', file);

            const response = await api.post('/api/purchase-order/upload-document', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.success) {
                const uploadedUrl = response.data.data.url;
                toast.success(`Uploaded ${file.name} successfully!`, { id: 'details-upload-toast' });
                if (slot === 1) setDoc1Name(uploadedUrl);
                else if (slot === 2) setDoc2Name(uploadedUrl);
                else if (slot === 3) setDoc3Name(uploadedUrl);
            } else {
                toast.error(response.data?.message || `Failed to upload ${file.name}`, { id: 'details-upload-toast' });
            }
        } catch (error: any) {
            console.error('Error uploading document:', error);
            toast.error(error.response?.data?.message || error.message || 'Upload failed', { id: 'details-upload-toast' });
        } finally {
            setUploadingDoc(null);
        }
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

        onSave(editableItems, [doc1Name, doc2Name, doc3Name], supplierDetails);
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

            {order.backendStatus === 'REJECTED' && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl flex gap-3 text-xs leading-relaxed animate-fadeIn">
                    <AlertTriangle size={18} className="flex-shrink-0" />
                    <div>
                        <span className="font-bold">This PO was rejected by Financial Admin:</span>
                        <p className="mt-1 font-mono italic">"{order.rejectionNote || 'No rejection note provided.'}"</p>
                        <p className="mt-2 text-[10px] opacity-75">You can update the pricing or files and re-submit the PO audit for approval.</p>
                    </div>
                </div>
            )}

            {order.backendStatus === 'APPROVED' && order.approvalNote && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl flex gap-3 text-xs leading-relaxed animate-fadeIn">
                    <ShieldCheck size={18} className="flex-shrink-0" />
                    <div>
                        <span className="font-bold">Approval Note from Financial Admin:</span>
                        <p className="mt-1 font-mono italic">"{order.approvalNote}"</p>
                    </div>
                </div>
            )}

            {/* Status Header Banner */}
            <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            order.backendStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' :
                            order.backendStatus === 'REJECTED' ? 'bg-rose-500/10 text-rose-500' :
                            order.backendStatus === 'PENDING_FINANCE_APPROVAL' ? 'bg-sky-500/10 text-sky-500' :
                            'bg-amber-500/10 text-amber-500'
                        }`}
                    >
                        {order.backendStatus === 'APPROVED' ? <ShieldCheck size={24} /> : <Clock size={24} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-main" style={{ color: 'var(--text-main)' }}>
                                Order {order.id} Audit
                            </h2>
                            <span className={`badge ${
                                order.backendStatus === 'APPROVED' ? 'badge-green' :
                                order.backendStatus === 'REJECTED' ? 'badge-red' :
                                order.backendStatus === 'PENDING_FINANCE_APPROVAL' ? 'badge-blue' :
                                'badge-orange'
                            }`}>
                                {order.backendStatus === 'PENDING_FINANCE_APPROVAL' ? 'Pending Finance Approval' :
                                 order.backendStatus === 'APPROVED' ? 'Approved' :
                                 order.backendStatus === 'REJECTED' ? 'Rejected' :
                                 'Pending Audit'}
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
                        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-main)' }}>
                            <h3 className="text-sm font-bold text-main" style={{ color: 'var(--text-main)' }}>
                                Purchase Request Information
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsEditingSupplier(!isEditingSupplier)}
                                className="text-xs font-semibold text-lime underline cursor-pointer bg-transparent border-none"
                                style={{ color: 'var(--brand-lime)' }}
                            >
                                {isEditingSupplier ? 'Cancel' : 'Change'}
                            </button>
                        </div>
                        
                        {isEditingSupplier ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="space-y-1">
                                    <label className="block text-[9px] uppercase font-bold text-dim" style={{ color: 'var(--text-dim)' }}>Supplier Name</label>
                                    <input
                                        type="text"
                                        value={supplierDetails.name}
                                        onChange={(e) => setSupplierDetails({ ...supplierDetails, name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl outline-none text-xs focus:ring-1 focus:ring-lime"
                                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-main)', color: 'var(--text-main)' }}
                                        placeholder="Supplier Name"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[9px] uppercase font-bold text-dim" style={{ color: 'var(--text-dim)' }}>Supplier Email</label>
                                    <input
                                        type="email"
                                        value={supplierDetails.email}
                                        onChange={(e) => setSupplierDetails({ ...supplierDetails, email: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl outline-none text-xs focus:ring-1 focus:ring-lime"
                                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-main)', color: 'var(--text-main)' }}
                                        placeholder="Supplier Email"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[9px] uppercase font-bold text-dim" style={{ color: 'var(--text-dim)' }}>Supplier Phone</label>
                                    <input
                                        type="text"
                                        value={supplierDetails.phone}
                                        onChange={(e) => setSupplierDetails({ ...supplierDetails, phone: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl outline-none text-xs focus:ring-1 focus:ring-lime"
                                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-main)', color: 'var(--text-main)' }}
                                        placeholder="Supplier Phone"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[9px] uppercase font-bold text-dim" style={{ color: 'var(--text-dim)' }}>Supplier Address</label>
                                    <input
                                        type="text"
                                        value={supplierDetails.address}
                                        onChange={(e) => setSupplierDetails({ ...supplierDetails, address: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl outline-none text-xs focus:ring-1 focus:ring-lime"
                                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-main)', color: 'var(--text-main)' }}
                                        placeholder="Supplier Address"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-muted">
                                <div>
                                    <span className="block text-[9px] uppercase font-bold text-dim mb-0.5" style={{ color: 'var(--text-dim)' }}>Supplier Name</span>
                                    <span className="font-semibold text-main text-xs" style={{ color: 'var(--text-main)' }}>{supplierDetails.name || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] uppercase font-bold text-dim mb-0.5" style={{ color: 'var(--text-dim)' }}>Supplier Email</span>
                                    <span className="font-semibold text-main text-xs" style={{ color: 'var(--text-main)' }}>{supplierDetails.email || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] uppercase font-bold text-dim mb-0.5" style={{ color: 'var(--text-dim)' }}>Supplier Phone</span>
                                    <span className="font-semibold text-main text-xs" style={{ color: 'var(--text-main)' }}>{supplierDetails.phone || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] uppercase font-bold text-dim mb-0.5" style={{ color: 'var(--text-dim)' }}>Supplier Address</span>
                                    <span className="font-semibold text-main text-xs" style={{ color: 'var(--text-main)' }}>{supplierDetails.address || '—'}</span>
                                </div>
                            </div>
                        )}
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
                                            {getFilename(doc1Name)}
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
                                            {getFilename(doc2Name)}
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
                                            {getFilename(doc3Name)}
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
