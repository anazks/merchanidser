import { useState, useEffect } from 'react';
import { getVehicles, saveVehicles, Vehicle } from '../services/mockData';
import { Plus, Search, Edit2, Check, RefreshCw, X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const Inventory = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'sold'>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Form States
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [mileage, setMileage] = useState(0);
    const [fuelType, setFuelType] = useState('Petrol');
    const [transmission, setTransmission] = useState('Manual');
    const [valuationPrice, setValuationPrice] = useState(0);
    const [retailPrice, setRetailPrice] = useState(0);
    const [healthGrade, setHealthGrade] = useState<'A' | 'B' | 'C' | 'D'>('A');
    const [optionsString, setOptionsString] = useState('');

    useEffect(() => {
        setVehicles(getVehicles());
    }, []);

    const handleAddVehicle = (e: React.FormEvent) => {
        e.preventDefault();
        if (!brand || !model || !year || !retailPrice) {
            toast.error('Please fill in all required fields.');
            return;
        }

        const newCar: Vehicle = {
            id: `CAR-0${vehicles.length + 1}`,
            brand,
            model,
            year: Number(year),
            mileage: Number(mileage),
            fuelType,
            transmission,
            valuationPrice: Number(valuationPrice),
            retailPrice: Number(retailPrice),
            status: 'active', // default status
            options: optionsString.split(',').map(s => s.trim()).filter(Boolean),
            healthGrade,
            addedDate: new Date().toISOString().split('T')[0]
        };

        const updated = [newCar, ...vehicles];
        setVehicles(updated);
        saveVehicles(updated);
        setIsAddModalOpen(false);
        toast.success(`Successfully listed ${brand} ${model}!`);

        // Reset form
        setBrand('');
        setModel('');
        setYear(new Date().getFullYear());
        setMileage(0);
        setFuelType('Petrol');
        setTransmission('Manual');
        setValuationPrice(0);
        setRetailPrice(0);
        setHealthGrade('A');
        setOptionsString('');
    };

    const handleMarkAsSold = (id: string) => {
        const updated = vehicles.map(v => {
            if (v.id === id) {
                toast.success(`${v.brand} ${v.model} marked as Sold!`);
                return { ...v, status: 'sold' as const };
            }
            return v;
        });
        setVehicles(updated);
        saveVehicles(updated);
    };

    // Filters
    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch = `${v.brand} ${v.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              v.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (activeTab === 'all') return matchesSearch;
        return matchesSearch && v.status === activeTab;
    });

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Listed Vehicles</h2>
                    <p className="text-xs text-muted">Manage car pricing tags, listings status, and upload details</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-primary flex items-center justify-center gap-2 cursor-pointer self-start"
                >
                    <Plus size={18} />
                    <span>List Vehicle</span>
                </button>
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
                        placeholder="Search by brand, model or ID..."
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
                        All listings ({vehicles.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                    >
                        Active ({vehicles.filter(v => v.status === 'active').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('draft')}
                        className={`tab-btn ${activeTab === 'draft' ? 'active' : ''}`}
                    >
                        Draft ({vehicles.filter(v => v.status === 'draft').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('sold')}
                        className={`tab-btn ${activeTab === 'sold' ? 'active' : ''}`}
                    >
                        Sold ({vehicles.filter(v => v.status === 'sold').length})
                    </button>
                </div>
            </div>

            {/* Data table representation */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Car ID</th>
                                <th>Vehicle Detail</th>
                                <th>Year / Mileage</th>
                                <th>Specs</th>
                                <th>Valuation Price</th>
                                <th>Retail Price</th>
                                <th>Health</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVehicles.length > 0 ? (
                                filteredVehicles.map((car) => (
                                    <tr key={car.id}>
                                        <td className="font-mono text-xs text-dim" style={{ color: 'var(--text-dim)' }}>{car.id}</td>
                                        <td className="font-semibold text-main" style={{ color: 'var(--text-main)' }}>
                                            {car.brand} {car.model}
                                        </td>
                                        <td>{car.year} / {car.mileage.toLocaleString()} km</td>
                                        <td className="text-xs">
                                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10" style={{ color: 'var(--text-muted)' }}>
                                                {car.fuelType}
                                            </span>
                                            <span className="ml-1 px-2 py-0.5 rounded bg-white/5 border border-white/10" style={{ color: 'var(--text-muted)' }}>
                                                {car.transmission}
                                            </span>
                                        </td>
                                        <td className="text-dim" style={{ color: 'var(--text-muted)' }}>{formatCurrency(car.valuationPrice)}</td>
                                        <td className="font-bold text-lime" style={{ color: 'var(--brand-lime)' }}>{formatCurrency(car.retailPrice)}</td>
                                        <td>
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                                                car.healthGrade === 'A' ? 'bg-emerald-500/10 text-emerald-500' :
                                                car.healthGrade === 'B' ? 'bg-blue-500/10 text-blue-500' :
                                                'bg-amber-500/10 text-amber-500'
                                            }`}>
                                                Grade {car.healthGrade}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                car.status === 'active' ? 'badge-lime' :
                                                car.status === 'sold' ? 'badge-green' : 'badge-gray'
                                            }`}>
                                                {car.status}
                                            </span>
                                        </td>
                                        <td className="text-right space-x-2">
                                            {car.status === 'active' && (
                                                <button
                                                    onClick={() => handleMarkAsSold(car.id)}
                                                    className="p-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors cursor-pointer border-none"
                                                    title="Mark as Sold"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            <button
                                                className="p-1.5 rounded-lg bg-white/5 text-muted hover:text-lime hover:bg-lime/10 transition-colors cursor-pointer border-none"
                                                title="Edit listing details"
                                                onClick={() => toast.success(`Edit trigger for ${car.brand} ${car.model} (Mock)`)}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="text-center py-8 text-dim" style={{ color: 'var(--text-dim)' }}>
                                        No listed vehicles match the search or filter settings.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Layer for adding new listing */}
            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content w-full max-w-xl">
                        <div className="flex items-center justify-between border-b pb-4 mb-4" style={{ borderColor: 'var(--border-main)' }}>
                            <div className="flex items-center gap-2">
                                <Tag className="text-lime" style={{ color: 'var(--brand-lime)' }} />
                                <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>List Vehicle for Sale</h3>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-dim hover:text-white cursor-pointer bg-transparent border-none"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddVehicle} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 text-muted">Brand *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Honda"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        className="input-field w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 text-muted">Model *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Civic Type R"
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        className="input-field w-full"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 text-muted">Year *</label>
                                    <input
                                        type="number"
                                        value={year}
                                        onChange={(e) => setYear(Number(e.target.value))}
                                        className="input-field w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 text-muted">Mileage (km)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 24000"
                                        value={mileage || ''}
                                        onChange={(e) => setMileage(Number(e.target.value))}
                                        className="input-field w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 text-muted">Health Grade</label>
                                    <select
                                        value={healthGrade}
                                        onChange={(e) => setHealthGrade(e.target.value as 'A'|'B'|'C'|'D')}
                                        className="input-field w-full"
                                    >
                                        <option value="A">Grade A (Excellent)</option>
                                        <option value="B">Grade B (Good)</option>
                                        <option value="C">Grade C (Fair)</option>
                                        <option value="D">Grade D (Needs Repair)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 text-muted">Fuel Type</label>
                                    <select
                                        value={fuelType}
                                        onChange={(e) => setFuelType(e.target.value)}
                                        className="input-field w-full"
                                    >
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Electric">Electric</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 text-muted">Transmission</label>
                                    <select
                                        value={transmission}
                                        onChange={(e) => setTransmission(e.target.value)}
                                        className="input-field w-full"
                                    >
                                        <option value="Manual">Manual</option>
                                        <option value="Automatic">Automatic</option>
                                        <option value="CVT">CVT</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 text-muted">Procurement Price (₹) *</label>
                                    <input
                                        type="number"
                                        placeholder="Internal cost price"
                                        value={valuationPrice || ''}
                                        onChange={(e) => setValuationPrice(Number(e.target.value))}
                                        className="input-field w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 text-muted">Listed Retail Price (₹) *</label>
                                    <input
                                        type="number"
                                        placeholder="Listing sale price"
                                        value={retailPrice || ''}
                                        onChange={(e) => setRetailPrice(Number(e.target.value))}
                                        className="input-field w-full"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5 text-muted">Included Features / Options (comma-separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Leather Seats, Bluetooth, Sunroof"
                                    value={optionsString}
                                    onChange={(e) => setOptionsString(e.target.value)}
                                    className="input-field w-full"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-main)' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="btn-secondary px-6"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-6"
                                >
                                    List Vehicle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
