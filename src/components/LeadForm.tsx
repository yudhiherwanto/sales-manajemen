import React, { useState } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lead } from '../types';
import { Plus, X, Building2, UserCircle, Briefcase, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeadFormProps {
  salespersonId: string;
  lead?: Lead | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({ salespersonId, lead, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    company: lead?.company || '',
    status: lead?.status || 'Prospecting',
    potentialAmount: lead?.potentialAmount || 0,
    realizationAmount: lead?.realizationAmount || 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (lead) {
        await updateDoc(doc(db, 'leads', lead.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'leads'), {
          ...formData,
          salespersonId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastVisitDate: null,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving lead:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="text-blue-600">✏️</span>
            {lead ? 'Update Portfolio' : 'Submit New Visit'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Customer Name</label>
            <div className="relative group">
              <UserCircle className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-50 transition-all outline-none text-sm font-medium placeholder:text-slate-300"
                placeholder="e.g. PT. Global Tech"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Company / Instansi</label>
            <div className="relative group">
              <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-50 transition-all outline-none text-sm font-medium placeholder:text-slate-300"
                placeholder="Perusahaan terkait..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Potential Value</label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold group-focus-within:text-emerald-500">Rp</span>
                <input
                  required
                  type="number"
                  value={formData.potentialAmount}
                  onChange={e => setFormData({ ...formData, potentialAmount: Number(e.target.value) })}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-50 transition-all outline-none text-sm font-medium"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Realisasi</label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold group-focus-within:text-blue-500">Rp</span>
                <input
                  type="number"
                  value={formData.realizationAmount}
                  onChange={e => setFormData({ ...formData, realizationAmount: Number(e.target.value) })}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-50 transition-all outline-none text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Pipeline Stage</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-50 transition-all outline-none text-sm font-medium bg-white"
            >
              <option value="Prospecting">Prospecting</option>
              <option value="Qualification">Qualification</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-lg transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 mt-4 text-sm"
          >
            {loading ? 'Processing...' : (lead ? 'Update Portfolio' : 'Submit to System')}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};
