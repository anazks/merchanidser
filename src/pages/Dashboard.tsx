import { useState, useEffect } from 'react';
import { getPurchaseOrders, getSalesTrends, PurchaseOrder } from '../services/mockData';
import { 
    ClipboardList, 
    DollarSign, 
    TrendingUp, 
    ChevronRight, 
    CheckCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const Dashboard = () => {
    const { theme } = useTheme();
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/api/purchase-order');
            if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
                const backendPos = response.data.data;
                
                const mappedOrders = backendPos.map((po: any) => {
                    const uiStatus = ['PENDING_FINANCE_APPROVAL', 'APPROVED', 'REJECTED'].includes(po.status) ? 'processed' : 'pending';
                    
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
                        documents: po.documents || []
                    };
                });
                setPurchaseOrders(mappedOrders);
            } else {
                setPurchaseOrders(getPurchaseOrders());
            }
        } catch (error) {
            console.error('Error fetching purchase orders for dashboard:', error);
            setPurchaseOrders(getPurchaseOrders());
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Calculate metrics
    const pendingOrders = purchaseOrders.filter(po => po.status === 'pending');
    const processedOrders = purchaseOrders.filter(po => po.status === 'processed');

    // Calculate total procurement spend (on processed orders)
    const totalProcurementSpend = processedOrders.reduce((sum, po) => {
        const poTotal = po.items.reduce((poSum, item) => poSum + (item.quantity * item.supplierUnitPrice), 0);
        return sum + poTotal;
    }, 0);

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    // Chart styling vars
    const gridColor = theme === 'dark' ? '#2A2A2A' : '#E5E7EB';
    const textColor = theme === 'dark' ? '#9CA3AF' : '#4B5563';
    const tooltipBg = theme === 'dark' ? '#1C1C1C' : '#FFFFFF';
    const tooltipBorder = theme === 'dark' ? '#2A2A2A' : '#E5E7EB';

    const salesData = getSalesTrends();

    return (
        <div className="space-y-6 animate-fadeInUp">
            {/* Top row stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pending POs */}
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <span className="stat-label">Pending POs</span>
                        <div className="p-2 rounded-lg bg-lime/10 text-lime" style={{ color: 'var(--brand-lime)' }}>
                            <ClipboardList size={18} />
                        </div>
                    </div>
                    <span className="stat-value">{pendingOrders.length}</span>
                    <span className="text-xs text-muted">Awaiting unit pricing</span>
                </div>

                {/* Processed POs */}
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <span className="stat-label">Processed POs</span>
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <CheckCircle size={18} />
                        </div>
                    </div>
                    <span className="stat-value">{processedOrders.length}</span>
                    <span className="text-xs text-muted">Pricing configured</span>
                </div>

                {/* Total Procurement Spend */}
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <span className="stat-label">PO Spend Commit</span>
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                            <DollarSign size={18} />
                        </div>
                    </div>
                    <span className="stat-value text-xl truncate">{formatCurrency(totalProcurementSpend)}</span>
                    <span className="text-xs text-emerald-500 flex items-center gap-1 font-semibold">
                        <TrendingUp size={12} />
                        Active Supplier Accounts
                    </span>
                </div>
            </div>

            {/* Performance charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales volume over time */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>Monthly Procurement Cost</h3>
                            <p className="text-xs text-muted">Overview of sales count and profit margins</p>
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--brand-lime)" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="var(--brand-lime)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis dataKey="name" stroke={textColor} fontSize={11} tickLine={false} />
                                <YAxis stroke={textColor} fontSize={11} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: tooltipBg, 
                                        borderColor: tooltipBorder,
                                        borderRadius: '12px',
                                        color: 'var(--text-main)',
                                        fontSize: '12px'
                                    }} 
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                <Area 
                                    type="monotone" 
                                    dataKey="Margin" 
                                    name="Profit Margin (₹)" 
                                    stroke="var(--brand-lime)" 
                                    fillOpacity={1} 
                                    fill="url(#colorMargin)" 
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sales Count Bar Chart */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>PO Volume Processed</h3>
                            <p className="text-xs text-muted">Quantity of units processed per month</p>
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis dataKey="name" stroke={textColor} fontSize={11} tickLine={false} />
                                <YAxis stroke={textColor} fontSize={11} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: tooltipBg, 
                                        borderColor: tooltipBorder,
                                        borderRadius: '12px',
                                        color: 'var(--text-main)',
                                        fontSize: '12px'
                                    }} 
                                />
                                <Bar 
                                    dataKey="Sales" 
                                    name="POs Completed" 
                                    fill="var(--brand-lime)" 
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Recent Purchase Orders */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>Recent Purchase Orders</h3>
                        <p className="text-xs text-muted">Configured and pending purchase orders</p>
                    </div>
                    <Link to="/purchase-orders" className="text-xs font-semibold text-lime flex items-center gap-1 hover:underline" style={{ color: 'var(--brand-lime)' }}>
                        Go to POs <ChevronRight size={14} />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>PO ID</th>
                                <th>Supplier</th>
                                <th>Date</th>
                                <th>Items Count</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseOrders.slice(0, 3).map((po) => (
                                <tr key={po.id}>
                                    <td className="font-mono text-xs font-bold text-lime" style={{ color: 'var(--brand-lime)' }}>{po.id}</td>
                                    <td>{po.supplierName}</td>
                                    <td>{po.date}</td>
                                    <td>{po.items.length} items</td>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
