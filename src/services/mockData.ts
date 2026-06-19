// Mock Data Models and Storage for OlaCarsMerchandiser

export interface PurchaseOrderItem {
    id: string;
    name: string;
    quantity: number;
    supplierUnitPrice: number; // Editable by merchandiser
}

export interface PurchaseOrder {
    _id?: string;
    id: string;
    supplierName: string;
    date: string;
    status: 'pending' | 'processed' | 'pending_approval' | 'approved' | 'rejected';
    items: PurchaseOrderItem[];
    documents: string[]; // Up to 3 file names
    backendStatus?: string;
    rejectionNote?: string;
    approvalNote?: string;
    supplierDetails?: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
}

export interface ValuationRequest {
    id: string;
    customerName: string;
    customerPhone: string;
    brand: string;
    model: string;
    year: number;
    mileage: number;
    conditionDescription: string;
    estimatedRepairs: number;
    customerExpectation: number;
    offeredPrice: number;
    status: 'pending' | 'accepted' | 'rejected' | 'renegotiating';
    date: string;
}

export interface SalesLead {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    vehicleId: string;
    vehicleName: string;
    notes: string;
    status: 'new' | 'contacted' | 'reserved' | 'sold';
    date: string;
}

// Initial Mock Datasets
const defaultPurchaseOrders: PurchaseOrder[] = [
    {
        id: 'PO-801',
        supplierName: 'Bosch Auto Parts',
        date: '2026-05-25',
        status: 'pending',
        items: [
            { id: 'ITM-01', name: 'Premium Oil Filter (XP-9)', quantity: 50, supplierUnitPrice: 0 },
            { id: 'ITM-02', name: 'Brake Pad Kit Front (Semi-Metallic)', quantity: 30, supplierUnitPrice: 0 },
            { id: 'ITM-03', name: 'Spark Plug Dual Iridium', quantity: 120, supplierUnitPrice: 0 }
        ],
        documents: []
    },
    {
        id: 'PO-802',
        supplierName: 'MRF Tyres Ltd',
        date: '2026-05-24',
        status: 'processed',
        items: [
            { id: 'ITM-04', name: 'Radial Tyres 15" ZVTS', quantity: 40, supplierUnitPrice: 3200 },
            { id: 'ITM-05', name: 'All-Weather Tubeless 16"', quantity: 24, supplierUnitPrice: 4100 }
        ],
        documents: ['mrf_quotation_may26.pdf', 'mrf_tax_invoice_signed.pdf', 'mrf_quality_report.pdf']
    },
    {
        id: 'PO-803',
        supplierName: 'Lumax Industries',
        date: '2026-05-26',
        status: 'pending',
        items: [
            { id: 'ITM-06', name: 'LED Headlamp Assembly L/H', quantity: 15, supplierUnitPrice: 0 },
            { id: 'ITM-07', name: 'Tail Light Housing R/H', quantity: 20, supplierUnitPrice: 0 }
        ],
        documents: []
    },
    {
        id: 'PO-804',
        supplierName: 'Exide Batteries',
        date: '2026-05-22',
        status: 'processed',
        items: [
            { id: 'ITM-08', name: '12V 45AH Lead Acid Battery', quantity: 25, supplierUnitPrice: 5200 }
        ],
        documents: ['exide_quote_v2.pdf', 'exide_commercial_invoice.pdf', 'exide_warranty_terms.pdf']
    }
];

const defaultValuations: ValuationRequest[] = [
    {
        id: 'VAL-101',
        customerName: 'Aarav Sharma',
        customerPhone: '+91 98765 43210',
        brand: 'Maruti Suzuki',
        model: 'Baleno Alpha',
        year: 2021,
        mileage: 28000,
        conditionDescription: 'Minor bumper scratch, interior clean, full service record.',
        estimatedRepairs: 12000,
        customerExpectation: 620000,
        offeredPrice: 580000,
        status: 'pending',
        date: '2026-05-26'
    },
    {
        id: 'VAL-102',
        customerName: 'Priya Patel',
        customerPhone: '+91 87654 32109',
        brand: 'Hyundai',
        model: 'i20 Asta',
        year: 2019,
        mileage: 51000,
        conditionDescription: 'Tyres worn out, AC needs gas refill, windshield tiny crack.',
        estimatedRepairs: 25000,
        customerExpectation: 450000,
        offeredPrice: 410000,
        status: 'pending',
        date: '2026-05-27'
    },
    {
        id: 'VAL-103',
        customerName: 'Rohan Verma',
        customerPhone: '+91 76543 21098',
        brand: 'Toyota',
        model: 'Innova Crysta VX',
        year: 2017,
        mileage: 110000,
        conditionDescription: 'Engine healthy, multiple surface scratches, interior moderately clean.',
        estimatedRepairs: 45000,
        customerExpectation: 1200000,
        offeredPrice: 1150000,
        status: 'accepted',
        date: '2026-05-24'
    },
    {
        id: 'VAL-104',
        customerName: 'Sneha Reddy',
        customerPhone: '+91 65432 10987',
        brand: 'Ford',
        model: 'EcoSport Titanium',
        year: 2018,
        mileage: 72000,
        conditionDescription: 'Suspension sounds, clutch slightly hard, electricals fine.',
        estimatedRepairs: 35000,
        customerExpectation: 550000,
        offeredPrice: 480000,
        status: 'renegotiating',
        date: '2026-05-25'
    }
];

const defaultLeads: SalesLead[] = [
    {
        id: 'LEA-201',
        customerName: 'Vikram Singh',
        customerEmail: 'vikram.singh@gmail.com',
        customerPhone: '+91 99998 88888',
        vehicleId: 'CAR-001',
        vehicleName: 'Hyundai Creta SX',
        notes: 'Requested test drive for upcoming Sunday. Interested in valuation for trade-in.',
        status: 'new',
        date: '2026-05-27'
    },
    {
        id: 'LEA-202',
        customerName: 'Neha Kapoor',
        customerEmail: 'neha.k@hotmail.com',
        customerPhone: '+91 88887 77777',
        vehicleId: 'CAR-004',
        vehicleName: 'Tata Nexon EV XZ+',
        notes: 'Enquired about battery health report and warranty extension details.',
        status: 'contacted',
        date: '2026-05-26'
    },
    {
        id: 'LEA-203',
        customerName: 'Aditya Sen',
        customerEmail: 'aditya.sen@outlook.com',
        customerPhone: '+91 77776 66666',
        vehicleId: 'CAR-002',
        vehicleName: 'Maruti Suzuki Swift ZXi',
        notes: 'Offered 5.0L cash down. Waiting for loan approval status.',
        status: 'reserved',
        date: '2026-05-25'
    }
];

// Helper functions for state persistence in LocalStorage
export const initializeStorage = () => {
    if (!localStorage.getItem('merch_purchase_orders')) {
        localStorage.setItem('merch_purchase_orders', JSON.stringify(defaultPurchaseOrders));
    }
    if (!localStorage.getItem('merch_valuations')) {
        localStorage.setItem('merch_valuations', JSON.stringify(defaultValuations));
    }
    if (!localStorage.getItem('merch_leads')) {
        localStorage.setItem('merch_leads', JSON.stringify(defaultLeads));
    }
};

export const getPurchaseOrders = (): PurchaseOrder[] => {
    initializeStorage();
    return JSON.parse(localStorage.getItem('merch_purchase_orders') || '[]');
};

export const savePurchaseOrders = (orders: PurchaseOrder[]): void => {
    localStorage.setItem('merch_purchase_orders', JSON.stringify(orders));
};

export const getValuations = (): ValuationRequest[] => {
    initializeStorage();
    return JSON.parse(localStorage.getItem('merch_valuations') || '[]');
};

export const saveValuations = (valuations: ValuationRequest[]): void => {
    localStorage.setItem('merch_valuations', JSON.stringify(valuations));
};

export const getLeads = (): SalesLead[] => {
    initializeStorage();
    return JSON.parse(localStorage.getItem('merch_leads') || '[]');
};

export const saveLeads = (leads: SalesLead[]): void => {
    localStorage.setItem('merch_leads', JSON.stringify(leads));
};

// Analytics Data
export const getSalesTrends = () => [
    { name: 'Jan', Sales: 3, Revenue: 2100000, Margin: 320000 },
    { name: 'Feb', Sales: 5, Revenue: 3800000, Margin: 550000 },
    { name: 'Mar', Sales: 8, Revenue: 5900000, Margin: 890000 },
    { name: 'Apr', Sales: 6, Revenue: 4400000, Margin: 680000 },
    { name: 'May', Sales: 12, Revenue: 9800000, Margin: 1450000 }
];

export const getBrandDistribution = () => [
    { name: 'Hyundai', value: 35 },
    { name: 'Maruti Suzuki', value: 25 },
    { name: 'Tata', value: 20 },
    { name: 'Honda', value: 15 },
    { name: 'Other', value: 5 }
];
