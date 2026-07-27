
import React, { useState } from 'react';
import { Order } from '../../types';
import { 
    ShoppingBag, ListOrdered, DollarSign, CreditCard, RefreshCw, 
    TrendingUp, ArrowUpRight, ArrowDownRight, Package, 
    AlertCircle, Sparkles, User, ChevronRight, Phone, Wallet, Smartphone
} from 'lucide-react';
import { useAppStore } from '../../store';

const getStatusColor = (status: Order['status']) => {
    switch (status) {
        case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-300';
        case 'Confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'Shipped': return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        case 'Cancelled': return 'bg-rose-100 text-rose-800 border-rose-300';
        default: return 'bg-stone-100 text-stone-500 border-stone-200';
    }
}

const PrimaryStatCard: React.FC<{ title: string, value: string, icon: React.ElementType, trend?: string, color: 'black' | 'stone' }> = ({ title, value, icon: Icon, trend, color }) => {
    const colorClasses = {
        black: 'bg-stone-900 shadow-stone-200',
        stone: 'bg-stone-600 shadow-stone-100'
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-stone-100 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-all duration-500">
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-none opacity-5 group-hover:scale-150 transition-transform duration-700 ${colorClasses[color]}`}></div>
            
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className={`p-3 sm:p-4 rounded-none text-white shadow-xl ${colorClasses[color]}`}>
                    <Icon size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-xs font-black text-stone-900 uppercase tracking-wider bg-stone-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-none border border-stone-100">
                        <TrendingUp size={10} /> {trend}
                    </div>
                )}
            </div>
            
            <p className="text-xs font-black text-stone-500 uppercase tracking-wider mb-1 sm:mb-2">{title}</p>
            <p className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tighter font-admin">{value}</p>
        </div>
    );
};

const SecondaryStatCard: React.FC<{ title: string, value: string | number, icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-5 rounded-none border border-stone-100 flex items-center gap-5 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300">
        <div className="p-3 bg-stone-50 rounded-none text-stone-500">
            <Icon size={18} />
        </div>
        <div>
            <p className="text-xs font-black text-stone-500 uppercase tracking-wider leading-none mb-2">{title}</p>
            <p className="text-base font-black text-stone-800 leading-none">{value}</p>
        </div>
    </div>
);

const CategoryPerformanceItem: React.FC<{ label: string, revenue: number, orders: number, icon: React.ElementType, color: string }> = ({ label, revenue, orders, icon: Icon, color }) => (
    <div className="group flex items-center justify-between p-4 sm:p-6 bg-white rounded-none border border-stone-100 hover:border-stone-950 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-stone-100/30 font-admin">
        <div className="flex items-center gap-3 sm:gap-4">
            <div className={`p-3 sm:p-4 rounded-none ${color} shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div>
                <h4 className="text-xs sm:text-sm font-black text-stone-900 uppercase tracking-tight">{label}</h4>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">{orders} Orders</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-lg sm:text-xl font-black text-stone-900 tracking-tight font-admin">৳{revenue.toLocaleString()}</p>
            <div className="flex items-center justify-end gap-1 text-xs font-bold text-stone-500 uppercase tracking-tight">
                <ArrowUpRight size={10} /> Active
            </div>
        </div>
    </div>
);

const AdminDashboardPage: React.FC = () => {
    const { orders, navigate, dashboardStats, loadAdminData, notify } = useAppStore();
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const stats = dashboardStats || {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        onlineTransactions: 0,
        outOfStockCount: 0,
        fashionRevenue: 0,
        cosmeticsRevenue: 0,
        fashionOrders: 0,
        cosmeticsOrders: 0,
        customerCount: 0
    };

    const recentOrders = [...orders].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
        return dateB - dateA;
    }).slice(0, 7);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await loadAdminData();
            notify("Dashboard metrics updated.", "success");
        } catch (e) {
            notify("Refresh failed.", "error");
        } finally {
            setIsRefreshing(false);
        }
    };

    // --- DYNAMIC INSIGHTS ENGINE ---
    const getSystemInsight = () => {
        if (stats.totalOrders === 0) return "Launch your first collection to see sales insights here.";
        
        const fashionLead = stats.fashionRevenue > stats.cosmeticsRevenue;
        
        if (fashionLead) {
            return `Premium Silk is dominating with ৳${stats.fashionRevenue.toLocaleString()} in sales. Consider expanding your luxury collection.`;
        } else {
            return `Party Wear is trending! Your festive wing is generating high volume. Stock up on top-selling gowns.`;
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto animate-fadeIn pb-24">
            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-6 px-2">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tighter uppercase leading-none font-admin">
                        Admin <span className="text-stone-500">Dashboard</span>
                    </h1>
                    <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mt-2 sm:mt-3 flex items-center gap-2 font-admin">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-stone-950 rounded-none animate-pulse"></span> SAZO Logistics
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="hidden lg:flex flex-col items-end mr-4">
                         <span className="text-xs font-black text-stone-400 uppercase tracking-wider font-admin">System Sync</span>
                         <span className="text-xs font-bold text-stone-600 font-admin">{new Date().toLocaleTimeString()}</span>
                    </div>
                    <button 
                        onClick={handleRefresh} 
                        disabled={isRefreshing}
                        className="bg-white border border-stone-200 p-3 sm:p-4 rounded-none shadow-sm hover:shadow-xl hover:text-stone-950 transition-all active:scale-95 group"
                    >
                        <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                    </button>
                    <button onClick={() => navigate('/admin/orders')} className="flex-1 sm:flex-none bg-stone-950 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-none font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-2xl shadow-stone-200 hover:bg-black transition-all active:scale-95 font-admin">
                        Orders
                    </button>
                </div>
            </div>

            {/* --- MAIN METRICS --- */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <PrimaryStatCard title="Gross Revenue" value={`৳${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="black" trend="+12%" />
                <PrimaryStatCard title="Total Volume" value={stats.totalOrders.toLocaleString()} icon={ListOrdered} color="stone" />
                <PrimaryStatCard title="Online Pay" value={stats.onlineTransactions.toLocaleString()} icon={Wallet} color="black" />
                <PrimaryStatCard title="Inventory" value={stats.totalProducts.toLocaleString()} icon={Package} color="stone" />
            </div>

            {/* --- SECONDARY METRICS (SMART BAR) --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12 px-1">
                <SecondaryStatCard title="Stock Alerts" value={`${stats.outOfStockCount} Items`} icon={AlertCircle} />
                <SecondaryStatCard title="Avg Basket" value={`৳${stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() : 0}`} icon={TrendingUp} />
                <SecondaryStatCard title="Active Orders" value={orders.filter(o => o.status === 'Pending').length} icon={Sparkles} />
                <SecondaryStatCard title="Unique Buyers" value={stats.customerCount || 0} icon={User} />
            </div>

            {/* --- CORE DATA SPLIT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* CATEGORY BREAKDOWN */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center justify-between px-2 font-admin">
                        <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">Performance Split</h3>
                        <span className="text-xs font-bold text-stone-900 uppercase tracking-wider bg-stone-50 px-2 sm:px-3 py-1 rounded-none border border-stone-100 font-admin">Live</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <CategoryPerformanceItem 
                            label="Premium Silk" 
                            revenue={stats.fashionRevenue} 
                            orders={stats.fashionOrders} 
                            icon={Smartphone} 
                            color="bg-stone-50 text-stone-800"
                        />
                        <CategoryPerformanceItem 
                            label="Party Wear" 
                            revenue={stats.cosmeticsRevenue} 
                            orders={stats.cosmeticsOrders} 
                            icon={Sparkles} 
                            color="bg-stone-100 text-stone-800"
                        />
                    </div>
                    
                    <div className="p-6 sm:p-8 bg-black rounded-none text-white relative overflow-hidden group shadow-2xl">
                         <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-none blur-3xl group-hover:bg-stone-500/10 transition-all duration-700"></div>
                         <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-4 sm:mb-6 relative z-10 font-admin">Luxury Brand Insights</h4>
                         <p className="text-base sm:text-lg font-light leading-relaxed text-stone-100 relative z-10 font-admin mb-6 sm:mb-0">
                             {getSystemInsight()}
                         </p>
                         <button onClick={() => navigate('/admin/products')} className="mt-8 flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-white transition-colors relative z-10 font-admin">
                             Optimise Inventory <ChevronRight size={14} />
                         </button>
                    </div>
                </div>

                {/* RECENT ORDERS TABLE */}
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-6 px-2 font-admin">
                        <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">Incoming Pipeline</h3>
                        <button onClick={() => navigate('/admin/orders')} className="text-xs font-black text-stone-500 uppercase tracking-wider hover:text-stone-950 transition-colors">Full History</button>
                    </div>
                    
                    <div className="bg-white rounded-none shadow-[0_30px_80px_rgba(0,0,0,0.02)] border border-stone-100 overflow-hidden font-admin">
                        <div className="overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left min-w-[700px] lg:min-w-0">
                                <thead className="bg-stone-50/50 border-b border-stone-100">
                                    <tr>
                                        <th className="px-8 py-6 text-xs font-black text-stone-500 uppercase tracking-wider font-admin">Identification</th>
                                        <th className="px-8 py-6 text-xs font-black text-stone-500 uppercase tracking-wider font-admin">Merchant Data</th>
                                        <th className="px-8 py-6 text-xs font-black text-stone-500 uppercase tracking-wider font-admin">Product Value</th>
                                        <th className="px-8 py-6 text-xs font-black text-stone-500 uppercase tracking-wider font-admin">Pipeline Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50">
                                    {recentOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-stone-50/30 transition-colors group cursor-pointer" onClick={() => navigate('/admin/orders')}>
                                            <td className="px-8 py-6">
                                                <span className="font-mono text-xs font-black text-stone-700 bg-stone-50 px-3 py-1.5 rounded-none border border-stone-100 font-admin">#{order.orderId || order.id.slice(-6)}</span>
                                                <div className="text-xs text-stone-400 mt-3 font-bold uppercase tracking-tight font-admin">{order.date}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-black text-stone-900 text-sm uppercase tracking-tight font-admin">{order.firstName} {order.lastName}</div>
                                                <div className="flex items-center gap-2 mt-2 text-stone-400">
                                                    <Phone size={12} />
                                                    <span className="text-xs font-bold font-admin">{order.phone}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-black text-stone-900 text-lg tracking-tighter font-admin uppercase">৳{(order.total - (order.shippingCharge || 0)).toLocaleString()}</div>
                                                <div className="flex items-center gap-1.5 mt-2 font-admin">
                                                    {order.paymentMethod === 'Online' ? (
                                                        <span className="text-xs font-black bg-stone-50 text-stone-800 px-2 py-1 rounded-none uppercase tracking-tight border border-stone-200">Paid Advance</span>
                                                    ) : (
                                                        <span className="text-xs font-black bg-stone-100 text-stone-500 px-2 py-1 rounded-none uppercase tracking-tight">COD</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-2 text-xs font-black rounded-none uppercase tracking-wider border shadow-sm font-admin ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {recentOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-24 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-20">
                                                    <Package size={48} />
                                                    <span className="text-xs font-black uppercase tracking-widest">No active orders found</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboardPage;
