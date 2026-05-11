import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, Users, Target, CheckCircle, Clock } from 'lucide-react';
import { Lead } from '../types';

interface DashboardProps {
  leads: Lead[];
}

export const Dashboard: React.FC<DashboardProps> = ({ leads }) => {
  const totalPotential = leads.reduce((sum, l) => sum + l.potentialAmount, 0);
  const totalRealized = leads.reduce((sum, l) => sum + (l.realizationAmount || 0), 0);
  const realizationRate = totalPotential > 0 ? (totalRealized / totalPotential) * 100 : 0;

  const statusData = [
    { name: 'Prospect', value: leads.filter(l => l.status === 'Prospecting' || l.status === 'Qualification').length },
    { name: 'Proposal', value: leads.filter(l => l.status === 'Proposal' || l.status === 'Negotiation').length },
    { name: 'Won', value: leads.filter(l => l.status === 'Closed Won').length },
    { name: 'Lost', value: leads.filter(l => l.status === 'Closed Lost').length },
  ];

  const realizationByStatus = statusData.map(d => ({
    name: d.name,
    amount: leads.filter(l => {
      if (d.name === 'Prospect') return l.status === 'Prospecting' || l.status === 'Qualification';
      if (d.name === 'Proposal') return l.status === 'Proposal' || l.status === 'Negotiation';
      if (d.name === 'Won') return l.status === 'Closed Won';
      return l.status === 'Closed Lost';
    }).reduce((sum, l) => sum + (l.realizationAmount || 0), 0)
  }));

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Pipeline" 
          value={`Rp ${(totalPotential / 1e6).toFixed(1)}M`} 
          icon={<Target className="w-5 h-5 text-blue-600" />} 
          subtitle="↑ 12% from last month"
          color="blue"
        />
        <StatsCard 
          title="Realisasi (Won)" 
          value={`Rp ${(totalRealized / 1e6).toFixed(1)}M`} 
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} 
          subtitle={`Target: Rp ${(totalPotential / 1e6).toFixed(1)}M`}
          color="emerald"
        />
        <StatsCard 
          title="Total Lead Aktif" 
          value={leads.filter(l => !l.status.startsWith('Closed')).length.toString()} 
          icon={<Clock className="w-5 h-5 text-slate-600" />} 
          subtitle="Across active regions"
          color="slate"
        />
        <StatsCard 
          title="Win Rate" 
          value={`${realizationRate.toFixed(1)}%`} 
          icon={<CheckCircle className="w-5 h-5 text-amber-600" />} 
          subtitle="Avg cycle: 14 days"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 card overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Pipeline Stage Distribution</h3>
            <span className="text-[10px] font-bold text-slate-400">Monthly Growth</span>
          </div>
          <div className="p-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 card p-6 flex flex-col">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">Realization Mix</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={realizationByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="amount"
                >
                  {realizationByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => `Rp ${(value / 1e6).toFixed(2)}M`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {statusData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-slate-500">{d.name}</span>
                </div>
                <span className="text-slate-700 font-bold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon, subtitle, color }: any) => {
  const bgColors: any = {
    blue: 'bg-blue-50/50 text-blue-600',
    emerald: 'bg-emerald-50/50 text-emerald-600',
    slate: 'bg-slate-50 text-slate-600',
    amber: 'bg-amber-50/50 text-amber-600'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
        <div className={`p-1.5 rounded-lg ${bgColors[color]}`}>{icon}</div>
      </div>
      <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
      <p className={`text-[10px] font-bold mt-2 ${
        color === 'emerald' ? 'text-emerald-600' : 
        color === 'blue' ? 'text-blue-600' : 
        color === 'amber' ? 'text-amber-600' : 
        'text-slate-400'
      }`}>
        {subtitle}
      </p>
    </motion.div>
  );
};
