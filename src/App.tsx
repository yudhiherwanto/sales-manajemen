import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { Dashboard } from './components/Dashboard';
import { LeadForm } from './components/LeadForm';
import { VisitForm } from './components/VisitForm';
import { Lead, Visit } from './types';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from './lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Plus, Search, MapPin, 
  ChevronRight, LogOut, LayoutDashboard, 
  ListTodo, User, Settings, Filter, Download
} from 'lucide-react';
import { format } from 'date-fns';

function AppContent() {
  const { user, profile, loading, signIn, logout } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pipeline'>('dashboard');
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || !profile) return;

    let leadsQuery = query(collection(db, 'leads'), orderBy('updatedAt', 'desc'));
    // If sales, only show their own leads
    if (profile.role === 'sales') {
      leadsQuery = query(collection(db, 'leads'), where('salespersonId', '==', user.uid), orderBy('updatedAt', 'desc'));
    }

    const unsubscribeLeads = onSnapshot(leadsQuery, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead)));
    }, (error) => {
      console.error("Error fetching leads:", error);
    });

    const visitsQuery = query(collection(db, 'visits'), orderBy('date', 'desc'));
    const unsubscribeVisits = onSnapshot(visitsQuery, (snapshot) => {
      setVisits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visit)));
    });

    return () => {
      unsubscribeLeads();
      unsubscribeVisits();
    };
  }, [user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Memuat SalesFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] w-full max-w-md text-center border border-slate-100"
        >
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-blue-200 shadow-2xl transition-transform hover:rotate-0 cursor-default">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tighter">SalesSync ID</h1>
          <p className="text-slate-500 mb-10 leading-relaxed text-sm font-medium">
            Strategic pipeline management & real-time visit tracking for professional sales teams.
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={signIn}
              className="w-full py-4 px-6 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5 bg-white rounded-full p-0.5" alt="Google" />
              Lanjutkan dengan Google
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise</span>
              <span className="text-xs font-bold text-slate-300">Grade Security</span>
            </div>
            <div className="w-px h-8 bg-slate-100"></div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered By</span>
              <span className="text-xs font-bold text-slate-300">Google Sheets</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Nama Nasabah', 'Perusahaan', 'Status', 'Potensi', 'Realisasi', 'Terakhir Dikunjungi'];
    const rows = leads.map(l => [
      l.name,
      l.company,
      l.status,
      l.potentialAmount,
      l.realizationAmount,
      l.lastVisitDate ? (l.lastVisitDate as any).seconds ? format(new Date((l.lastVisitDate as any).seconds * 1000), 'yyyy-MM-dd HH:mm') : format(new Date(l.lastVisitDate), 'yyyy-MM-dd HH:mm') : '-'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pipeline_sales_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-800">SalesFlow</span>
          </div>

          <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Menu Utama</div>
          <nav className="space-y-1">
            <SidebarLink 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
              icon={<LayoutDashboard className="w-4 h-4" />}
              label="Dashboard Management"
            />
            <SidebarLink 
              active={activeTab === 'pipeline'} 
              onClick={() => setActiveTab('pipeline')}
              icon={<ListTodo className="w-4 h-4" />}
              label="Pipeline & Prospects"
            />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-50">
          <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-slate-900">{profile?.name}</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {profile?.role === 'manager' ? 'Sales Manager' : 'Sales Representative'}
              </p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 w-full justify-center py-2 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors bg-white hover:bg-red-50 border border-slate-100 rounded-lg hover:border-red-100 shadow-sm"
          >
            <LogOut className="w-3 h-3" /> Keluar Aplikasi
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen pb-24 lg:pb-8 flex flex-col bg-slate-50/50">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm shadow-slate-900/5">
          <h2 className="text-base font-bold text-slate-800">
            {activeTab === 'dashboard' ? 'Performance Overview' : 'Lead Management System'}
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-bold text-slate-400 px-3 py-1 bg-slate-100 rounded-md uppercase border border-slate-200">
              G-Sheets Sync: Active
            </div>
            {activeTab === 'pipeline' && (
              <div className="relative hidden md:block">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari data nasabah..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all w-48"
                />
              </div>
            )}
            <button 
              onClick={() => {
                setSelectedLead(null);
                setIsLeadFormOpen(true);
              }}
              className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all active:scale-95 text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Potensi</span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' ? (
            <Dashboard leads={leads} />
          ) : (
            <div className="space-y-6">
              <div className="card overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h3 className="font-bold text-slate-700 text-sm">Target & Prospecting Submissions</h3>
                  <button onClick={exportToCSV} className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">
                    <Download className="w-3 h-3" /> Ekspor Data
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Customer Details</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Pipeline Stage</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Financial Value</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                      {filteredLeads.map(lead => (
                        <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{lead.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{lead.company}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`status-chip ${
                              lead.status === 'Closed Won' ? 'bg-blue-100 text-blue-700' :
                              lead.status === 'Closed Lost' ? 'bg-slate-100 text-slate-600' :
                              lead.status === 'Negotiation' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">
                              Rp {(lead.realizationAmount || 0).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              Target: Rp {lead.potentialAmount.toLocaleString()}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setIsVisitFormOpen(true);
                                }}
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                                title="Log Kunjungan"
                              >
                                <MapPin className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setIsLeadFormOpen(true);
                                }}
                                className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-800 hover:text-white transition-all shadow-sm border border-slate-100"
                                title="Edit Detail"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-white rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-around z-50">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">Insight</span>
        </button>
        <button 
          onClick={() => setActiveTab('pipeline')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'pipeline' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <ListTodo className="w-5 h-5" />
          <span className="text-[10px] font-bold">Pipeline</span>
        </button>
        <button 
          onClick={logout}
          className="flex flex-col items-center gap-1 text-gray-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-bold">Keluar</span>
        </button>
      </nav>

      {/* Modals */}
      <AnimatePresence>
        {isLeadFormOpen && (
          <LeadForm 
            salespersonId={user.uid}
            lead={selectedLead}
            onClose={() => setIsLeadFormOpen(false)}
            onSuccess={() => {}}
          />
        )}
        {isVisitFormOpen && selectedLead && (
          <VisitForm 
            salespersonId={user.uid}
            lead={selectedLead}
            onClose={() => setIsVisitFormOpen(false)}
            onSuccess={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const SidebarLink = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-all border-r-[3px] ${
      active 
        ? 'bg-blue-50 text-blue-600 border-blue-600' 
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-transparent'
    }`}
  >
    {icon}
    <span className="text-xs uppercase tracking-tight">{label}</span>
  </button>
);

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
