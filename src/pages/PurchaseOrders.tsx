import { useState, useEffect } from 'react';
import { getPurchaseOrders, savePurchaseOrders, PurchaseOrder, PurchaseOrderItem } from '../services/mockData';
import { Eye, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import PurchaseOrderDetails from '../components/PurchaseOrderDetails';

const PurchaseOrders = () => {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processed'>('all');
    
    // Modal states
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        setOrders(getPurchaseOrders());
    }, []);

    // Filter POs
    const filteredOrders = orders.filter(po => {
        const matchesSearch = po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              po.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (activeTab === 'all') return matchesSearch;
        return matchesSearch && po.status === activeTab;
    });

    // Opening detail modal
    const handleOpenDetail = (po: PurchaseOrder) => {
        setSelectedOrder(po);
        setIsDetailOpen(true);
    };

    // Calculate total order value for list rendering
    const calculateOrderTotal = (itemsList: PurchaseOrderItem[]) => {
        return itemsList.reduce((sum, item) => sum + (item.quantity * item.supplierUnitPrice), 0);
    };

    // Save audited pricing and files back to store (received from child component)
    const handleSaveOrderDetails = (updatedItems: PurchaseOrderItem[], documents: string[]) => {
        if (!selectedOrder) return;

        const updatedOrders = orders.map(po => {
            if (po.id === selectedOrder.id) {
                return {
                    ...po,
                    items: updatedItems,
                    documents,
                    status: 'processed' as const
                };
            }
            return po;
        });

        setOrders(updatedOrders);
        savePurchaseOrders(updatedOrders);
        setIsDetailOpen(false);
        setSelectedOrder(null);
        toast.success(`Purchase Order ${selectedOrder.id} pricing has been audited and completed!`);
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
            {isDetailOpen && selectedOrder ? (
                <PurchaseOrderDetails
                    order={selectedOrder}
                    onClose={() => {
                        setIsDetailOpen(false);
                        setSelectedOrder(null);
                    }}
                    onSave={handleSaveOrderDetails}
                />
            ) : (
                <>
                    {/* Header section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Purchase Orders</h2>
                            <p className="text-xs text-muted">Auditing incoming purchase orders, configure supplier unit prices, and upload supporting billing proofs</p>
                        </div>
                    </div>

                    {/* Filter controls bar */}
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-card p-4 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-md">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" style={{ color: 'var(--text-dim)' }}>
                                <Search size={18} />
                            </span>
                            <input
                                type="text"
                                placeholder="Search by supplier or order ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pl-11 w-full"
                            />
                        </div>

                        {/* Tabs */}
                        <div className="tab-nav">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                            >
                                All ({orders.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                            >
                                Pending ({orders.filter(po => po.status === 'pending').length})
                            </button>
                            <button
                                onClick={() => setActiveTab('processed')}
                                className={`tab-btn ${activeTab === 'processed' ? 'active' : ''}`}
                            >
                                Processed ({orders.filter(po => po.status === 'processed').length})
                            </button>
                        </div>
                    </div>

                    {/* Data table representation */}
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Supplier Name</th>
                                        <th>Order Date</th>
                                        <th>Items</th>
                                        <th>Billing Files</th>
                                        <th>Total Cost</th>
                                        <th>Status</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((po) => {
                                            const poTotal = po.status === 'processed' ? calculateOrderTotal(po.items) : 0;
                                            const docsCount = po.documents.filter(Boolean).length;
                                            return (
                                                <tr key={po.id}>
                                                    <td className="font-mono text-xs font-bold text-lime" style={{ color: 'var(--brand-lime)' }}>{po.id}</td>
                                                    <td className="font-semibold text-main" style={{ color: 'var(--text-main)' }}>
                                                        {po.supplierName}
                                                    </td>
                                                    <td>{po.date}</td>
                                                    <td>{po.items.length} positions</td>
                                                    <td className="text-xs">
                                                        <span className={`px-2 py-0.5 rounded-md font-medium ${
                                                            docsCount === 3 ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                                                        }`}>
                                                            {docsCount}/3 files
                                                        </span>
                                                    </td>
                                                    <td className="font-bold text-main" style={{ color: 'var(--text-main)' }}>
                                                        {po.status === 'processed' ? formatCurrency(poTotal) : (
                                                            <span className="text-xs text-amber-500 font-medium">Pending Pricing</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${
                                                            po.status === 'processed' ? 'badge-lime' : 'badge-orange'
                                                        }`}>
                                                            {po.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-right">
                                                        <button
                                                            onClick={() => handleOpenDetail(po)}
                                                            className="p-1.5 rounded-lg bg-white/5 text-muted hover:text-lime hover:bg-lime/10 transition-colors cursor-pointer border-none"
                                                            title="View order details"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="text-center py-8 text-dim" style={{ color: 'var(--text-dim)' }}>
                                                No purchase orders match the search or filter settings.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PurchaseOrders;

