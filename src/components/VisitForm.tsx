import React, { useState } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lead } from '../types';
import { X, Calendar, ClipboardList, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface VisitFormProps {
  salespersonId: string;
  lead: Lead;
  onClose: () => void;
  onSuccess: () => void;
}

export const VisitForm: React.FC<VisitFormProps> = ({ salespersonId, lead, onClose, onSuccess }) => {
  const [notes, setNotes] = useState('');
  const [amountReported, setAmountReported] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Add Visit Record
      await addDoc(collection(db, 'visits'), {
        leadId: lead.id,
        salespersonId,
        date: serverTimestamp(),
        notes,
        amountReported: amountReported || 0,
      });

      // Update Lead's last visit date and potentially realization if reported
      const leadUpdate: any = {
        lastVisitDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      if (amountReported > 0) {
        leadUpdate.realizationAmount = (lead.realizationAmount || 0) + amountReported;
      }

      await updateDoc(doc(db, 'leads', lead.id), leadUpdate);

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving visit:", error);
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
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white text-left">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-emerald-600">✏️</span>
              Submit New Visit
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Target: {lead.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Visit Notes / Summary</label>
            <textarea
              required
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-50 transition-all outline-none text-sm font-medium placeholder:text-slate-300 resize-none"
              placeholder="Brief summary of interaction..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Potential Realization Value</label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold group-focus-within:text-emerald-600 transition-colors">Rp</span>
              <input
                type="number"
                value={amountReported}
                onChange={e => setAmountReported(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-50 transition-all outline-none text-sm font-medium"
                placeholder="0"
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-lg transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 mt-4 text-sm"
          >
            {loading ? 'Processing...' : 'Submit to Sheet'}
          </button>
          
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex gap-2">
              <span className="text-blue-600 text-sm">💡</span>
              <p className="text-[10px] text-blue-800 leading-tight font-medium">Data will be instantly processed and visible to the supervisor dashboard.</p>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
