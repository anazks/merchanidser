import { useState, useEffect } from 'react';
import { PurchaseOrder, PurchaseOrderItem } from '../services/mockData';
import { Eye, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import PurchaseOrderDetails from '../components/PurchaseOrderDetails';
import api from '../services/api';

const PurchaseRequests = () => {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'rejected'>('all');

    // Modal states
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/api/workshop-procurement');
            if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
                const backendPos = response.data.data;
                
                // Filter for requests: APPROVED, PENDING_FINANCE_APPROVAL, REJECTED
                const requestsOnly = backendPos.filter((po: any) => 
                    ['APPROVED', 'PENDING_FINANCE_APPROVAL', 'REJECTED'].includes(po.status)
                );

                const mappedOrders = requestsOnly.map((po: any) => {
                    const isRejected = po.status === 'REJECTED';
                    const uiStatus = isRejected ? 'rejected' : 'pending';

                    return {
                        _id: po._id,
                        id: po.requestNumber || po._id,
                        supplierName: po.supplier?.name || `Branch: ${po.branch?.name || 'Unknown'}`,
                        date: new Date(po.createdAt).toISOString().split('T')[0],
                        status: uiStatus,
                        backendStatus: po.status,
                        rejectionNote: po.rejectionNote || '',
                        approvalNote: po.approvalNote || '',
                        items: [{
                            id: po.part?._id || '1',
                            name: po.part?.partName || 'Unknown Part',
                            quantity: po.quantity,
                            supplierUnitPrice: po.merchandiserPrice !== undefined && po.merchandiserPrice !== null ? po.merchandiserPrice : po.part?.unitCost || 0
                        }],
                        documents: po.documents || []
                    };
                });
                setOrders(mappedOrders);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error('Error fetching purchase requests:', error);
            setOrders([]);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Filter Requests
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

    // Calculate total order value
    const calculateOrderTotal = (itemsList: PurchaseOrderItem[]) => {
        return itemsList.reduce((sum, item) => sum + (item.quantity * item.supplierUnitPrice), 0);
    };

    // Save audited pricing and files back to backend
    const handleSaveOrderDetails = async (updatedItems: PurchaseOrderItem[], documents: string[]) => {
        if (!selectedOrder) return;

        try {
            const payload = {
                merchandiserPrice: updatedItems[0].supplierUnitPrice,
                documents
            };
            const response = await api.put(`/api/workshop-procurement/${(selectedOrder as any)._id}/audit`, payload);
            if (response.data && response.data.success) {
                toast.success(`Purchase Request ${selectedOrder.id} pricing has been audited and submitted for approval!`);
                fetchRequests();
                setIsDetailOpen(false);
                setSelectedOrder(null);
            } else {
                toast.error(response.data?.message || 'Failed to save audit');
            }
        } catch (error: any) {
            console.error('Error saving audit:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to save audit');
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
                            <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Purchase Requests</h2>
                            <p className="text-xs text-muted">Auditing incoming purchase requests, configure supplier unit prices, and upload supporting billing proofs</p>
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
                                placeholder="Search by supplier or request ID..."
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
                                Pending Audit ({orders.filter(po => po.status === 'pending').length})
                            </button>
                            <button
                                onClick={() => setActiveTab('rejected')}
                                className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
                            >
                                Rejected ({orders.filter(po => po.status === 'rejected').length})
                            </button>
                        </div>
                    </div>

                    {/* Data table representation */}
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Request ID</th>
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
                                            const hasProposed = po.items.some(item => item.supplierUnitPrice > 0);
                                            const poTotal = calculateOrderTotal(po.items);
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
                                                        {hasProposed ? formatCurrency(poTotal) : (
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
                                                            title="View request details"
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
                                                No purchase requests match the search or filter settings.
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

export default PurchaseRequests;
