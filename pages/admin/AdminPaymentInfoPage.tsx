
import React, { useState, useMemo } from 'react';
// FIX: Corrected the import path for `useAppStore` from the non-existent 'StoreContext.tsx' to the correct location 'store/index.ts'.
import { useAppStore } from '../../store';
import { Order } from '../../types';
import { Search, Trash2 } from 'lucide-react';

const AdminPaymentInfoPage: React.FC = () => {
    const { orders, deleteOrder } = useAppStore();
    const [searchTerm, setSearchTerm] = useState('');

    const paymentRecords = useMemo(() => {
        return orders
            .filter(order => order.paymentMethod === 'Online' && order.paymentDetails)
            .sort((a, b) => {
                // Sort by Date Descending (Newest first)
                // Use createdAt for better precision if available
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
                return timeB - timeA;
            });
    }, [orders]);

    const filteredRecords = useMemo(() => {
        if (!searchTerm) return paymentRecords;
        return paymentRecords.filter(order =>
            (order.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.orderId || order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.paymentDetails?.transactionId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.paymentDetails?.paymentNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [paymentRecords, searchTerm]);

    const handleDelete = (orderId: string) => {
        if (window.confirm('Are you sure you want to delete this payment record and its associated order? This action cannot be undone.')) {
            deleteOrder(orderId);
        }
    };

    const formatOrderDateTime = (order: Order) => {
        const dateSource = order.createdAt || order.date;
        const date = new Date(dateSource);
        
        // If date is invalid (e.g. parsing issue), return original string
        if (isNaN(date.getTime())) {
            return { date: order.date, time: '' };
        }
  
        const dateStr = date.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            timeZone: 'Asia/Dhaka'
        });
        
        const timeStr = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true,
            timeZone: 'Asia/Dhaka'
        });
  
        return { date: dateStr, time: timeStr };
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 font-admin">
                <div>
                    <h1 className="text-4xl font-black text-stone-900 tracking-tighter uppercase font-admin">Financial <span className="text-stone-500">Ledger</span></h1>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-[0.4em] mt-2">Verified online transaction records</p>
                </div>
                <div className="relative w-full md:w-80 font-admin">
                    <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                    <input 
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border border-stone-100 rounded-none text-sm bg-white text-stone-900 shadow-sm outline-none focus:ring-4 focus:ring-stone-950/5 focus:border-stone-900 transition-all font-medium font-admin"
                    />
                </div>
            </div>

            <div className="bg-white rounded-none shadow-[0_30px_80px_rgba(0,0,0,0.02)] border border-stone-100 overflow-hidden font-admin">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-stone-50/50 border-b border-stone-100">
                            <tr>
                                <th scope="col" className="px-8 py-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] font-admin">Order ID</th>
                                <th scope="col" className="px-8 py-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] font-admin">Timestamp</th>
                                <th scope="col" className="px-8 py-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] font-admin">Customer</th>
                                <th scope="col" className="px-8 py-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] font-admin">Method</th>
                                <th scope="col" className="px-8 py-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] font-admin">Sender No.</th>
                                <th scope="col" className="px-8 py-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] font-admin">TxID</th>
                                <th scope="col" className="px-8 py-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] font-admin">Settlement</th>
                                <th scope="col" className="px-8 py-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] text-right font-admin">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {filteredRecords.length > 0 ? filteredRecords.map(order => {
                                const cartSubtotal = order.cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                                const deliveryCharge = order.shippingCharge !== undefined 
                                    ? order.shippingCharge 
                                    : (order.total - cartSubtotal);

                                const { date, time } = formatOrderDateTime(order);
                                const fullName = `${order.firstName} ${order.lastName || ''}`.trim();

                                return (
                                    <tr key={order.id} className="hover:bg-stone-50 transition-all group">
                                        <td className="px-8 py-6">
                                            <span className="font-mono text-xs font-black text-stone-900 bg-stone-50 px-3 py-1.5 rounded-none border border-stone-100">#{order.orderId || order.id.slice(-6)}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-stone-900 font-bold text-xs uppercase tracking-tighter font-admin">{date}</div>
                                            {time && <div className="text-[10px] text-stone-500 mt-0.5 font-admin">{time}</div>}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-stone-900 text-sm tracking-tight uppercase font-admin">{fullName}</div>
                                            <div className="text-[10px] text-stone-500 mt-1 font-bold font-admin">{order.phone}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[9px] font-black bg-stone-950 text-white px-2 py-1 rounded-none uppercase tracking-tighter border border-stone-900 font-admin">{order.paymentDetails?.method}</span>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-stone-700 text-sm font-admin">{order.paymentDetails?.paymentNumber}</td>
                                        <td className="px-8 py-6">
                                            <span className="font-mono bg-stone-50 px-2 py-1 border border-stone-100 rounded-none text-stone-800 font-bold text-[11px] font-admin">{order.paymentDetails?.transactionId}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-stone-900 text-base tracking-tighter font-admin uppercase">৳{deliveryCharge.toLocaleString()}</div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => handleDelete(order.id)}
                                                className="p-3 text-red-600 hover:bg-red-50 rounded-none transition-all border border-transparent hover:border-red-100 shadow-sm opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                               <tr>
                                    <td colSpan={8} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20 font-admin">
                                            <Search size={48} />
                                            <span className="text-xs font-black uppercase tracking-widest font-admin">No transaction records found</span>
                                        </div>
                                    </td>
                               </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPaymentInfoPage;
