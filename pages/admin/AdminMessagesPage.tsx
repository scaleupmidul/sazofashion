import React, { useState, useMemo, useEffect } from 'react';
import { ContactMessage } from '../../types';
import { Search, X, Trash2, Mail, CheckCircle } from 'lucide-react';
// FIX: Corrected the import path for `useAppStore` from the non-existent 'StoreContext.tsx' to the correct location 'store/index.ts'.
import { useAppStore } from '../../store';


interface MessageDetailsModalProps {
  message: ContactMessage;
  onClose: () => void;
  markMessageAsRead: (messageId: string, isRead: boolean) => Promise<void>;
  deleteContactMessage: (messageId: string) => Promise<void>;
}

const MessageDetailsModal: React.FC<MessageDetailsModalProps> = ({ message, onClose, markMessageAsRead, deleteContactMessage }) => {

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to permanently delete this message?')) {
            await deleteContactMessage(message.id);
            onClose();
        }
    }
    
    const handleToggleRead = async () => {
        await markMessageAsRead(message.id, !message.isRead);
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-none shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-stone-100">
                <div className="p-8 border-b flex justify-between items-center bg-stone-50">
                    <div>
                        <h2 className="text-2xl font-black text-stone-900 tracking-tighter font-admin">Message Intel</h2>
                        <p className="text-xs text-stone-600 font-bold uppercase tracking-wider mt-1 font-admin">From: {message.name}</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-none transition shadow-sm border border-transparent hover:border-stone-200"><X className="w-6 h-6 text-stone-900"/></button>
                </div>
                <div className="p-8 space-y-8 overflow-y-auto text-stone-900 flex-1 font-admin">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-4 bg-stone-50 rounded-none border border-stone-100">
                            <span className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1">Email Address</span>
                            <span className="font-bold text-sm text-stone-900">{message.email}</span>
                        </div>
                        <div className="p-4 bg-stone-50 rounded-none border border-stone-100">
                            <span className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1">Received On</span>
                            <span className="font-bold text-sm text-stone-900">{message.date}</span>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-stone-100">
                        <span className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-4">Message Narrative</span>
                        <div className="p-6 bg-stone-50 rounded-none border border-stone-100 text-stone-700 whitespace-pre-wrap leading-relaxed font-medium text-sm">
                            {message.message}
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-stone-50/50 border-t border-stone-100 flex justify-between items-center flex-wrap gap-4 font-admin">
                    <div className="flex gap-3">
                        <button 
                            onClick={handleToggleRead} 
                            className="bg-stone-950 text-white px-6 py-3 rounded-none hover:bg-black transition-all flex items-center gap-2 font-black text-xs uppercase tracking-wider active:scale-95 shadow-lg shadow-stone-900/10">
                            {message.isRead ? <Mail className="w-4 h-4"/> : <CheckCircle className="w-4 h-4"/>}
                            <span>Mark as {message.isRead ? 'Unread' : 'Read'}</span>
                        </button>
                        <button onClick={handleDelete} className="bg-red-50 text-red-600 px-6 py-3 rounded-none hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 font-black text-xs uppercase tracking-wider active:scale-95 border border-red-100">
                            <Trash2 className="w-4 h-4"/>
                            <span>Delete</span>
                        </button>
                    </div>
                    <button onClick={onClose} className="px-6 py-3 font-black text-xs uppercase tracking-wider text-stone-400 hover:text-stone-900 transition">
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminMessagesPage: React.FC = () => {
  const { contactMessages, markMessageAsRead, deleteContactMessage } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredMessages = useMemo(() => {
    return [...contactMessages].filter(msg => 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [contactMessages, searchTerm]);

  const totalPages = Math.ceil(filteredMessages.length / ITEMS_PER_PAGE);
  const paginatedMessages = filteredMessages.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 font-admin">
            <div>
                <h1 className="text-4xl font-black text-stone-900 tracking-tighter uppercase font-admin flex flex-wrap items-center gap-3">
                    <span>Message <span className="text-stone-500">Intelligence</span></span>
                    <span className="px-2.5 py-1 bg-stone-900 text-white text-xs font-black rounded-none uppercase tracking-widest">
                        {contactMessages.length} Total
                    </span>
                    {filteredMessages.length !== contactMessages.length && (
                        <span className="px-2.5 py-1 bg-stone-200 text-stone-700 text-xs font-black rounded-none uppercase tracking-widest animate-fadeIn">
                            {filteredMessages.length} Filtered
                        </span>
                    )}
                </h1>
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mt-2">Customer inquiries and feedback</p>
            </div>
            <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input 
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-stone-100 rounded-none text-sm bg-white text-stone-900 shadow-sm outline-none focus:ring-4 focus:ring-stone-950/5 focus:border-stone-900 transition-all font-bold"
                />
            </div>
        </div>

        <div className="bg-white rounded-none shadow-[0_30px_80px_rgba(0,0,0,0.02)] border border-stone-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-stone-50/50 border-b border-stone-100">
                        <tr>
                            <th scope="col" className="px-8 py-6 text-xs font-black text-stone-500 uppercase tracking-wider w-12">Status</th>
                            <th scope="col" className="px-8 py-6 text-xs font-black text-stone-500 uppercase tracking-wider">Origin</th>
                            <th scope="col" className="px-8 py-6 text-xs font-black text-stone-500 uppercase tracking-wider">Narrative Snippet</th>
                            <th scope="col" className="px-8 py-6 text-xs font-black text-stone-500 uppercase tracking-wider">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                        {paginatedMessages.map(msg => (
                            <tr key={msg.id} className={`hover:bg-stone-50 transition-all group cursor-pointer ${!msg.isRead ? 'bg-stone-50/50' : 'bg-white'}`} onClick={() => setSelectedMessage(msg)}>
                                <td className="px-8 py-6">
                                    {!msg.isRead && <div className="w-2.5 h-2.5 bg-stone-900 rounded-none"></div>}
                                </td>
                                <td className="px-8 py-6 font-admin">
                                    <div className="font-black text-stone-900 text-sm tracking-tight uppercase">{msg.name}</div>
                                    <div className={`text-xs font-bold mt-1 ${!msg.isRead ? 'text-stone-900' : 'text-stone-500'}`}>{msg.email}</div>
                                </td>
                                <td className="px-8 py-6 max-w-sm truncate text-stone-800 font-bold text-sm font-admin">{msg.message}</td>
                                <td className="px-8 py-6 text-stone-500 font-black text-xs uppercase tracking-tighter font-admin">{msg.date}</td>
                            </tr>
                        ))}
                        {filteredMessages.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-8 py-24 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                        <Mail size={48} />
                                        <span className="text-xs font-black uppercase tracking-widest">No messages found</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 text-sm font-admin">
                <span className="text-stone-500 font-bold uppercase text-[10px] tracking-widest">Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredMessages.length)} of {filteredMessages.length} messages</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-stone-200 rounded-none shadow-sm hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold text-xs uppercase tracking-tight">Previous</button>
                    <span className="font-black text-stone-700 mx-2 text-xs">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border border-stone-200 rounded-none shadow-sm hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold text-xs uppercase tracking-tight">Next</button>
                </div>
            </div>
        )}

        {selectedMessage && <MessageDetailsModal 
            message={selectedMessage} 
            onClose={() => setSelectedMessage(null)}
            markMessageAsRead={markMessageAsRead}
            deleteContactMessage={deleteContactMessage}
        />}
    </div>
  );
};

export default AdminMessagesPage;