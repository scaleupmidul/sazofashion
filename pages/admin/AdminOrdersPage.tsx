
import React, { useState, useMemo, useEffect } from 'react';
import { Order, CartItem, OrderStatus } from '../../types';
import { Search, X, Trash2, RefreshCw, Shield, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store';
import SafeImage from '../../components/SafeImage';

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-300';
        case 'Confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'Shipped': return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        case 'Cancelled': return 'bg-rose-100 text-rose-800 border-rose-300';
        default: return 'bg-stone-100 text-stone-800 border-stone-200';
    }
}

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, updateOrderStatus, deleteOrder }) => {
    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        await updateOrderStatus(order.id, e.target.value as OrderStatus);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) {
            await deleteOrder(order.id);
            onClose();
        }
    }

    // Display ID: Use orderId if available, otherwise fallback to system id
    const displayId = order.orderId || order.id;
    const shippingCharge = order.shippingCharge || 0;
    
    // FIX: Calculate products total by summing items directly to avoid negative values
    // caused by inconsistent total/shipping charge logic in different payment modes.
    const productsTotal = (order.cartItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = order.discountAmount || 0;
    const fullName = `${order.firstName} ${order.lastName || ''}`.trim();

    return (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-0 sm:p-4">
            <div className="bg-white rounded-none shadow-2xl w-full max-w-2xl flex flex-col h-full sm:h-auto sm:max-h-[90vh] overflow-hidden">
                <div className="p-5 sm:p-8 border-b flex justify-between items-center bg-stone-50/30">
                    <div className="flex flex-col">
                        <h2 className="text-xl sm:text-2xl font-black text-stone-900 uppercase tracking-tighter font-admin">ORDER DATA</h2>
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1 font-admin">Reference: #{displayId.slice(-8)}</span>
                    </div>
                    <button onClick={onClose} className="p-3 bg-stone-100 rounded-none hover:bg-stone-950 hover:text-white transition-all active:scale-95">
                        <X className="w-5 h-5"/>
                    </button>
                </div>
                <div className="p-5 sm:p-8 space-y-8 overflow-y-auto text-black scrollbar-hide">
                    {/* CUSTOMER & BILLING INFO GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-black text-stone-500 mb-4 uppercase text-[9px] tracking-[0.3em] font-admin flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-stone-950 rounded-none"></div> Customer Pipeline
                            </h3>
                            <div className="space-y-3 text-xs sm:text-sm font-admin">
                                <div className="flex justify-between sm:justify-start items-center">
                                    <span className="font-black text-stone-400 uppercase text-[8px] tracking-widest mr-4">Name</span> 
                                    <span className="font-black text-stone-900 uppercase">{fullName}</span>
                                </div>
                                <div className="flex justify-between sm:justify-start items-center">
                                    <span className="font-black text-stone-400 uppercase text-[8px] tracking-widest mr-4">Phone</span> 
                                    <span className="font-bold text-stone-900 underline underline-offset-4 decoration-stone-200">{order.phone}</span>
                                </div>
                                <div className="flex justify-between sm:justify-start items-center">
                                    <span className="font-black text-stone-400 uppercase text-[8px] tracking-widest mr-4">District</span> 
                                    <span className="font-bold text-stone-600 uppercase">{order.city}</span>
                                </div>
                                <div className="pt-2">
                                    <span className="font-black text-stone-400 uppercase text-[8px] tracking-widest block mb-2">Delivery Address</span> 
                                    <div className="p-3 bg-stone-50 rounded-none border border-stone-100 text-[11px] font-bold text-stone-600 uppercase leading-relaxed">{order.address}</div>
                                </div>
                                
                                {order.note && (
                                    <div className="mt-4 p-4 bg-stone-50 border border-stone-100 rounded-none text-stone-700 italic text-[10px] shadow-sm font-admin">
                                        <span className="font-black uppercase text-[8px] block mb-2 text-stone-500 tracking-widest">Customer Directives</span>
                                        "{order.note}"
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-black text-stone-500 mb-4 uppercase text-[9px] tracking-[0.3em] font-admin flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-stone-950 rounded-none"></div> Financial Ledger
                            </h3>
                            <div className="space-y-4 text-xs sm:text-sm font-admin">
                                <div className="flex justify-between items-center bg-stone-50 p-3 rounded-none border border-stone-100">
                                    <span className="font-black text-stone-500 uppercase text-[8px] tracking-widest">Gateway</span> 
                                    <span className="font-black text-stone-900 uppercase text-[10px]">{
                                        order.paymentMethod === 'COD' 
                                            ? 'Cash on Delivery' 
                                            : `Online / ${order.paymentDetails?.method || 'Advance'}`
                                    }</span>
                                </div>

                                {order.paymentMethod === 'Online' && order.paymentDetails && (
                                    <div className="p-4 bg-stone-950 rounded-none border border-stone-800 text-stone-100 shadow-xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Shield className="w-3.5 h-3.5 text-stone-400" />
                                            <p className="font-black text-white text-[9px] uppercase tracking-widest font-admin">Verification Token</p>
                                        </div>
                                        <div className="space-y-2 font-admin">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-stone-500 uppercase tracking-widest">Sender ID</span> 
                                                <span className="font-black text-white">{order.paymentDetails.paymentNumber}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-stone-500 uppercase tracking-widest">Trx Hash</span> 
                                                <span className="font-mono bg-white/10 px-2 py-1 rounded-none text-stone-100 font-bold">{order.paymentDetails.transactionId}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-stone-100">
                        <h3 className="font-black text-stone-500 mb-4 uppercase text-[9px] tracking-[0.3em] font-admin flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-stone-950 rounded-none"></div> Status Management
                        </h3>
                        <div className="relative">
                            <select 
                                value={order.status} 
                                onChange={handleStatusChange} 
                                className={`p-4 border border-stone-200 rounded-none w-full bg-white text-stone-900 focus:ring-4 focus:ring-stone-950/10 focus:border-stone-950 outline-none transition-all font-black font-admin appearance-none uppercase text-xs tracking-widest ${getStatusColor(order.status)}`}
                            >
                                <option value="Pending">Pending Validation</option>
                                <option value="Confirmed">Merchant Confirmed</option>
                                <option value="Shipped">In Logistics Transit</option>
                                <option value="Delivered">Successfully Delivered</option>
                                <option value="Cancelled">Void / Cancelled</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronRight className="w-5 h-5 text-current rotate-90" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-black text-stone-500 mb-4 uppercase text-[9px] tracking-[0.3em] font-admin flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-stone-950 rounded-none"></div> Asset Manifest
                        </h3>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide font-admin">
                        {(order.cartItems || []).map((item: CartItem) => (
                            <div key={`${item.id}-${item.size}`} className="flex items-center gap-4 p-3 bg-white rounded-none border border-stone-50 shadow-sm group">
                                <div className="w-16 h-20 bg-stone-100 rounded-none overflow-hidden flex-shrink-0 shadow-sm">
                                    <SafeImage src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-xs sm:text-sm text-stone-900 uppercase tracking-tight line-clamp-1">{item.name}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[9px] font-black bg-stone-100 text-stone-500 px-2.5 py-1 rounded-none uppercase tracking-widest">SIZE {item.size}</span>
                                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">QTY {item.quantity}</span>
                                    </div>
                                </div>
                                <p className="font-black text-sm text-stone-900">৳{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                        ))}
                        </div>
                        
                        <div className="mt-8 pt-6 border-t-2 border-stone-100">
                            <div className="space-y-2 text-right font-admin">
                                <div className="flex justify-between items-center sm:justify-end gap-10">
                                    <span className="text-stone-400 font-bold uppercase text-[9px] tracking-[0.3em]">Gross Subtotal</span>
                                    <span className="text-sm font-bold text-stone-600 uppercase tracking-tight">৳{productsTotal.toLocaleString()}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between items-center sm:justify-end gap-10">
                                        <span className="text-stone-400 font-bold uppercase text-[9px] tracking-[0.3em]">Coupon Override</span>
                                        <span className="text-sm font-black text-stone-900 uppercase tracking-tight">-৳{discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center sm:justify-end gap-10">
                                    <span className="text-stone-400 font-bold uppercase text-[9px] tracking-[0.3em]">Logistics Surcharge</span>
                                    <span className="text-sm font-bold text-stone-600 uppercase tracking-tight">৳{shippingCharge.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col items-end pt-4 mt-2">
                                    <span className="text-[10px] text-stone-400 font-black uppercase tracking-[0.4em] mb-2">Net Payable</span>
                                    <div className="text-4xl font-black text-stone-950 tracking-tighter uppercase font-admin">
                                        ৳{order.total.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 sm:p-8 bg-stone-50/50 border-t flex flex-col sm:flex-row justify-between items-center gap-4 font-admin">
                    <button onClick={handleDelete} className="w-full sm:w-auto px-6 py-4 rounded-none bg-white border border-stone-200 text-stone-300 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2 active:scale-95 font-black text-[10px] uppercase tracking-widest">
                        <Trash2 className="w-4 h-4"/>
                        <span>Void Entry</span>
                    </button>
                    <button onClick={onClose} className="w-full sm:w-auto bg-stone-950 text-white px-12 py-4 rounded-none hover:bg-black transition-all font-black active:scale-95 shadow-2xl shadow-stone-950/10 text-[11px] uppercase tracking-[0.3em]">
                        DISMISS
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, refreshOrders, markOrdersAsSeen } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    markOrdersAsSeen();
  }, [markOrdersAsSeen]);

  useEffect(() => {
    if (selectedOrder) {
      const updatedOrderInList = orders.find(o => o.id === selectedOrder.id);
      if (updatedOrderInList) {
        if (JSON.stringify(updatedOrderInList) !== JSON.stringify(selectedOrder)) {
            setSelectedOrder(updatedOrderInList);
        }
      } else {
        setSelectedOrder(null);
      }
    }
  }, [orders, selectedOrder]);

  useEffect(() => {
      setCurrentPage(1);
  }, [searchTerm]);

  const handleRefresh = async () => {
      setIsRefreshing(true);
      await refreshOrders();
      markOrdersAsSeen();
      setIsRefreshing(false);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      (order.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.city?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.orderId || order.id || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
        const dateComparison = timeB - timeA;
        if (dateComparison !== 0) return dateComparison;
        return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [orders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const formatOrderDateTime = (order: Order) => {
      const dateSource = order.createdAt || order.date;
      const date = new Date(dateSource);
      if (isNaN(date.getTime())) return { date: order.date, time: '' };
      const dateStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dhaka' });
      const hasTime = !!order.createdAt;
      const timeStr = hasTime ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' }) : '';
      return { date: dateStr, time: timeStr };
  };

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 font-admin px-1">
            <div>
                <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tighter uppercase font-admin flex flex-wrap items-center gap-3">
                    <span>Order <span className="text-stone-500">Intelligence</span></span>
                    <span className="px-2.5 py-1 bg-stone-900 text-white text-xs font-black rounded-none uppercase tracking-widest">
                        {orders.length} Total
                    </span>
                    {filteredOrders.length !== orders.length && (
                        <span className="px-2.5 py-1 bg-stone-200 text-stone-700 text-xs font-black rounded-none uppercase tracking-widest animate-fadeIn">
                            {filteredOrders.length} Filtered
                        </span>
                    )}
                </h1>
                <p className="text-[9px] sm:text-[10px] text-stone-500 font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] mt-2">Monitor and fulfill customer requests</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                    <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 sm:pl-12 pr-4 py-3.5 sm:py-4 border border-stone-100 rounded-none text-xs sm:text-sm bg-white text-stone-900 shadow-sm outline-none focus:ring-2 focus:ring-stone-950/10 focus:border-stone-950 transition-all font-bold" placeholder="ID, name, phone..." />
                </div>
                <button onClick={handleRefresh} disabled={isRefreshing} className="p-3.5 sm:p-4 bg-stone-100 text-stone-600 rounded-none hover:bg-stone-50 hover:text-stone-950 transition-all border border-transparent hover:border-stone-200 active:scale-95 disabled:opacity-50">
                    <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>

        <div className="bg-white rounded-none shadow-[0_30px_80px_rgba(0,0,0,0.02)] border border-stone-100 overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left min-w-[800px] lg:min-w-0">
                    <thead className="bg-stone-50/50 border-b border-stone-100">
                        <tr>
                            <th className="px-8 py-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Order ID</th>
                            <th className="px-8 py-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Customer</th>
                            <th className="px-8 py-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Timestamp</th>
                            <th className="px-8 py-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Financials</th>
                            <th className="px-8 py-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                        {paginatedOrders.map(order => {
                            const { date, time } = formatOrderDateTime(order);
                            const displayPrice = (order.cartItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
                            const fullName = `${order.firstName} ${order.lastName || ''}`.trim();
                            return (
                                <tr key={order.id} className="hover:bg-stone-50 transition-all group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                    <td className="px-8 py-6">
                                        <div className="font-mono text-xs font-bold text-stone-900 font-admin bg-stone-50 px-2 py-1 rounded-none">#{order.orderId || order.id.slice(-6)}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-black text-stone-900 text-sm tracking-tight uppercase font-admin">{fullName}</div>
                                        <div className="text-[10px] text-stone-500 mt-1 font-bold font-admin">{order.phone} • {order.city}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-stone-900 font-bold text-xs uppercase tracking-tighter font-admin">{date}</div>
                                        {time && <div className="text-[10px] text-stone-500 mt-0.5 font-admin">{time}</div>}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-black text-stone-900 text-base tracking-tighter font-admin">৳{order.total.toLocaleString()}</div>
                                        <div className="text-[10px] text-stone-500 font-bold mt-1 uppercase tracking-widest font-admin">{order.paymentMethod}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-none text-[9px] font-black uppercase tracking-widest shadow-sm border border-black/5 ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 text-sm font-admin">
                <span className="text-stone-500 font-bold uppercase text-[10px] tracking-widest">Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-stone-200 rounded-none shadow-sm hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold text-xs uppercase tracking-tight">Previous</button>
                    <span className="font-black text-stone-700 mx-2 text-xs">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border border-stone-200 rounded-none shadow-sm hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold text-xs uppercase tracking-tight">Next</button>
                </div>
            </div>
        )}

        {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} updateOrderStatus={updateOrderStatus} deleteOrder={deleteOrder} />}
    </div>
  );
};

export default AdminOrdersPage;
