import { useState, useEffect } from 'react';
import { getPurchaseOrders, PurchaseOrder, PurchaseOrderItem } from '../services/mockData';
import { Eye, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import PurchaseOrderDetails from '../components/PurchaseOrderDetails';
import api from '../services/api';

const PurchaseOrders = () => {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'pending_approval' | 'approved'>('all');

    // Modal states
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/api/purchase-order');
            if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
                const backendPos = response.data.data;
                const ordersOnly = backendPos.filter((po: any) => 
                    ['PENDING_FINANCE_APPROVAL', 'APPROVED', 'DISPOSED'].includes(po.status)
                );

                const mappedOrders = ordersOnly.map((po: any) => {
                    const uiStatus = po.status === 'PENDING_FINANCE_APPROVAL' ? 'pending_approval' : 'approved';

                    return {
                        _id: po._id,
                        id: po.purchaseOrderNumber || po._id,
                        supplierName: po.supplier?.name || po.supplierDetails?.name || 'Unknown Supplier',
                        date: new Date(po.purchaseOrderDate || po.createdAt).toISOString().split('T')[0],
                        status: uiStatus,
                        backendStatus: po.status,
                        rejectionNote: po.rejectionNote || '',
                        approvalNote: po.approvalNote || '',
                        items: (po.items || []).map((item: any) => ({
                            id: item._id,
                            name: item.itemName,
                            quantity: item.quantity,
                            supplierUnitPrice: item.merchandiserPrice !== undefined && item.merchandiserPrice !== null ? item.merchandiserPrice : item.unitPrice || 0
                        })),
                        documents: po.documents || [],
                        supplierDetails: po.supplierDetails
                    };
                });
                setOrders(mappedOrders);
            } else {
                setOrders(getPurchaseOrders());
            }
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
            setOrders(getPurchaseOrders());
        }
    };

    useEffect(() => {
        fetchOrders();
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

    const handleSaveOrderDetails = async (
        updatedItems: PurchaseOrderItem[], 
        documents: string[], 
        supplierDetails?: { name: string; email: string; phone: string; address: string }
    ) => {
        if (!selectedOrder) return;

        try {
            const payload = {
                items: updatedItems.map(item => ({
                    id: item.id,
                    itemName: item.name,
                    supplierUnitPrice: item.supplierUnitPrice
                })),
                documents,
                supplierDetails
            };
            const response = await api.put(`/api/purchase-order/${(selectedOrder as any)._id}/audit`, payload);
            if (response.data && response.data.success) {
                toast.success(`Purchase Order ${selectedOrder.id} pricing has been audited and submitted for approval!`);
                fetchOrders();
                setIsDetailOpen(false);
                setSelectedOrder(null);
            } else {
                toast.error(response.data?.message || 'Failed to save PO audit');
            }
        } catch (error: any) {
            console.error('Error saving PO audit:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to save PO audit');
        }
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
                                onClick={() => setActiveTab('pending_approval')}
                                className={`tab-btn ${activeTab === 'pending_approval' ? 'active' : ''}`}
                            >
                                Pending Approval ({orders.filter(po => po.status === 'pending_approval').length})
                            </button>
                            <button
                                onClick={() => setActiveTab('approved')}
                                className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
                            >
                                Approved ({orders.filter(po => po.status === 'approved').length})
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
                                                        <span className={`px-2 py-0.5 rounded-md font-medium ${docsCount === 3 ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
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
                                                            po.backendStatus === 'APPROVED' ? 'badge-green' :
                                                            po.backendStatus === 'REJECTED' ? 'badge-red' :
                                                            po.backendStatus === 'PENDING_FINANCE_APPROVAL' ? 'badge-blue' :
                                                            'badge-orange'
                                                        }`}>
                                                            {po.backendStatus === 'PENDING_FINANCE_APPROVAL' ? 'Pending Finance Approval' :
                                                             po.backendStatus === 'APPROVED' ? 'Approved' :
                                                             po.backendStatus === 'REJECTED' ? 'Rejected' :
                                                             'Pending Audit'}
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

