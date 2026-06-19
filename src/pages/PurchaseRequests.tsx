import { useState, useEffect } from 'react';
import { PurchaseOrder, PurchaseOrderItem } from '../services/mockData';
import { Eye, Search, Truck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PurchaseOrderDetails from '../components/PurchaseOrderDetails';
import api from '../services/api';

const PurchaseRequests = () => {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'rejected'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeTab]);

    // Modal states
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/api/workshop-procurement', {
                params: { limit: 1000 }
            });
            if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
                const backendPos = response.data.data;
                
                // Filter for requests visible to merchandiser
                const requestsOnly = backendPos.filter((po: any) => 
                    ['APPROVED', 'PENDING_FINANCE_APPROVAL', 'REJECTED', 'COST_APPROVED', 'IN_TRANSIT', 'RECEIVED'].includes(po.status)
                );

                const mappedOrders = requestsOnly.map((po: any) => {
                    const isRejected = po.status === 'REJECTED';
                    const isShipped = po.status === 'IN_TRANSIT';
                    const isReceived = po.status === 'RECEIVED';
                    const isCostApproved = po.status === 'COST_APPROVED';
                    const uiStatus = isRejected ? 'rejected' : (isShipped || isReceived || isCostApproved) ? 'shipped' : 'pending';

                    return {
                        _id: po._id,
                        id: po.requestNumber || po._id,
                        supplierName: po.supplier?.name || po.supplierDetails?.name || `Branch: ${po.branch?.name || 'Unknown'}`,
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
                        documents: po.documents || [],
                        supplierDetails: po.supplierDetails
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

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
    const handleSaveOrderDetails = async (
        updatedItems: PurchaseOrderItem[], 
        documents: string[], 
        supplierDetails?: { name: string; email: string; phone: string; address: string }
    ) => {
        if (!selectedOrder) return;

        try {
            const payload = {
                merchandiserPrice: updatedItems[0].supplierUnitPrice,
                documents,
                supplierDetails
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
                                        <th>Supplier Details</th>
                                        <th>Order Date</th>
                                        <th>Items</th>
                                        <th>Billing Files</th>
                                        <th>Total Cost</th>
                                        <th>Status</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedOrders.length > 0 ? (
                                        paginatedOrders.map((po) => {
                                            const hasProposed = po.items.some(item => item.supplierUnitPrice > 0);
                                            const poTotal = calculateOrderTotal(po.items);
                                            const docsCount = po.documents.filter(Boolean).length;
                                            return (
                                                <tr key={po.id}>
                                                    <td className="font-mono text-xs font-bold text-lime" style={{ color: 'var(--brand-lime)' }}>{po.id}</td>
                                                    <td className="text-xs">
                                                        <div className="font-semibold text-main" style={{ color: 'var(--text-main)' }}>
                                                            {po.supplierDetails?.name || po.supplierName}
                                                        </div>
                                                        {po.supplierDetails && (
                                                            <div className="text-[10px] text-muted space-y-0.5 mt-1" style={{ color: 'var(--text-muted)' }}>
                                                                {(po.supplierDetails.email || po.supplierDetails.phone) && (
                                                                    <div>{po.supplierDetails.email || 'N/A'} | {po.supplierDetails.phone || 'N/A'}</div>
                                                                )}
                                                                {po.supplierDetails.address && (
                                                                    <div className="truncate max-w-[200px]">{po.supplierDetails.address}</div>
                                                                )}
                                                            </div>
                                                        )}
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
                                                            po.backendStatus === 'COST_APPROVED' ? 'badge-green' :
                                                            po.backendStatus === 'IN_TRANSIT' ? 'badge-blue' :
                                                            po.backendStatus === 'RECEIVED' ? 'badge-green' :
                                                            po.backendStatus === 'APPROVED' ? 'badge-green' :
                                                            po.backendStatus === 'REJECTED' ? 'badge-red' :
                                                            po.backendStatus === 'PENDING_FINANCE_APPROVAL' ? 'badge-blue' :
                                                            'badge-orange'
                                                        }`}>
                                                            {po.backendStatus === 'PENDING_FINANCE_APPROVAL' ? 'Pending Finance Approval' :
                                                             po.backendStatus === 'COST_APPROVED' ? 'Cost Approved' :
                                                             po.backendStatus === 'IN_TRANSIT' ? 'In Transit' :
                                                             po.backendStatus === 'RECEIVED' ? 'Received' :
                                                             po.backendStatus === 'APPROVED' ? 'Approved' :
                                                             po.backendStatus === 'REJECTED' ? 'Rejected' :
                                                             'Pending Audit'}
                                                        </span>
                                                    </td>
                                                    <td className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {po.backendStatus === 'COST_APPROVED' && (
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        try {
                                                                            await api.put(`/api/workshop-procurement/${po._id}/ship`);
                                                                            toast.success('Request marked as shipped!');
                                                                            fetchRequests();
                                                                        } catch (err: any) {
                                                                            toast.error(err.response?.data?.message || 'Failed to ship');
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border-none cursor-pointer"
                                                                >
                                                                    <Truck size={14} />
                                                                    Ship
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleOpenDetail(po)}
                                                                className="p-1.5 rounded-lg bg-white/5 text-muted hover:text-lime hover:bg-lime/10 transition-colors cursor-pointer border-none"
                                                                title="View request details"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                        </div>
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
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                                <span className="text-xs text-muted" style={{ color: 'var(--text-dim)' }}>
                                    Showing <span className="font-semibold text-main" style={{ color: 'var(--text-main)' }}>{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                    <span className="font-semibold text-main" style={{ color: 'var(--text-main)' }}>
                                        {Math.min(currentPage * itemsPerPage, filteredOrders.length)}
                                    </span>{' '}
                                    of <span className="font-semibold text-main" style={{ color: 'var(--text-main)' }}>{filteredOrders.length}</span> entries
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-40 disabled:hover:bg-white/5 cursor-pointer disabled:cursor-not-allowed border-none"
                                        style={{ color: 'var(--text-main)' }}
                                    >
                                        Previous
                                    </button>
                                    {Array.from({ length: totalPages }, (_, index) => {
                                        const pageNumber = index + 1;
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => setCurrentPage(pageNumber)}
                                                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center ${
                                                    currentPage === pageNumber
                                                        ? 'bg-[#C8E600] text-black shadow-lg shadow-[#C8E600]/20'
                                                        : 'bg-white/5 text-muted hover:bg-white/10 hover:text-main'
                                                }`}
                                                style={currentPage === pageNumber ? {} : { color: 'var(--text-dim)' }}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-40 disabled:hover:bg-white/5 cursor-pointer disabled:cursor-not-allowed border-none"
                                        style={{ color: 'var(--text-main)' }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default PurchaseRequests;
