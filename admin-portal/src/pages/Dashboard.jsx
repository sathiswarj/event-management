import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Activity, Target, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { API_BASE_URL } from '../services/api';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/requests`, { withCredentials: true });
        setLeads(Array.isArray(res.data) ? res.data : (res.data.leads || []));
      } catch (error) {
        console.error('Failed to fetch leads', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // BI Math
  const totalLeads = leads.length;
  const totalManagedPipeline = leads.reduce((sum, lead) => sum + ((lead.guestCount || 10) * 1500), 0);
  const activeLeadInflux = leads.filter(lead => lead.status === 'New').length;
  const approvedLeads = leads.filter(lead => lead.status === 'Approved').length;
  const conversionRatio = totalLeads === 0 ? 0 : ((approvedLeads / totalLeads) * 100);

  // Data for Pie Chart
  const eventTypesCount = leads.reduce((acc, lead) => {
    // If your Request model doesn't have eventType directly, try category.name or similar based on your data structure.
    // Assuming lead.category has a name, or fallback to 'Other'
    const type = lead.category?.name || lead.eventType || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(eventTypesCount).map(key => ({
    name: key,
    value: eventTypesCount[key]
  }));

  const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444']; // Amber as primary

  // Data for Bar Chart
  const volumeByDate = leads.reduce((acc, lead) => {
    if (lead.createdAt) {
      const dateStr = format(parseISO(lead.createdAt), 'MMM dd');
      acc[dateStr] = (acc[dateStr] || 0) + 1;
    }
    return acc;
  }, {});

  const barData = Object.keys(volumeByDate).map(key => ({
    date: key,
    volume: volumeByDate[key]
  })).sort((a, b) => new Date(a.date) - new Date(b.date)); 

  if (leads.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-gray-400 p-8 h-full bg-gray-900 rounded-xl">
        <div className="bg-gray-800 border border-gray-700 p-12 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-gray-700">
            <Inbox className="w-10 h-10 text-gray-500" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">No Active Intelligence</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            The database array is currently empty. Incoming high-value leads will automatically populate your analytical matrix here.
          </p>
          <div className="animate-pulse bg-amber-500/10 text-amber-500 py-2 px-4 rounded-lg inline-block font-mono text-sm border border-amber-500/20">
            Awaiting Data Ingestion...
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="font-sans">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">Analytics & Intelligence</h1>
        <p className="text-gray-400 mt-2 font-mono text-sm uppercase tracking-wider">Aura Events / Data Matrix</p>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Highlighted Pipeline Card */}
        <div className="bg-gray-800 border border-amber-500/30 p-8 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.1)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-50"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                <TrendingUp className="text-amber-500 w-5 h-5" />
              </div>
              <h3 className="text-gray-400 font-medium tracking-wide">Total Managed Pipeline</h3>
            </div>
            <p className="text-5xl lg:text-6xl font-bold text-amber-500 tracking-tighter shadow-amber-500/50 drop-shadow-lg">
              ${totalManagedPipeline.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Activity className="text-blue-400 w-5 h-5" />
            </div>
            <h3 className="text-gray-400 font-medium tracking-wide">Active Lead Influx</h3>
          </div>
          <p className="text-4xl font-bold text-white tracking-tight">
            {activeLeadInflux}
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
              <Target className="text-purple-400 w-5 h-5" />
            </div>
            <h3 className="text-gray-400 font-medium tracking-wide">Conversion Ratio</h3>
          </div>
          <div className="flex items-end space-x-2">
            <p className="text-4xl font-bold text-white tracking-tight">
              {conversionRatio.toFixed(1)}<span className="text-2xl text-gray-500">%</span>
            </p>
          </div>
        </div>

      </div>

      {/* Analytical Graphics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Pie Chart */}
        <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-8 border-b border-gray-700 pb-4">Event Type Distribution</h3>
          <div className="h-80 w-full relative">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '12px', color: '#f3f4f6' }}
                    itemStyle={{ color: '#f3f4f6' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="absolute inset-0 flex items-center justify-center text-gray-500">Insufficient Distribution Data</div>
            )}
            
            {/* Legend Overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="block text-3xl font-bold text-white">{totalLeads}</span>
              <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Total</span>
            </div>
          </div>
        </div>

        {/* Right: Bar Chart */}
        <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-8 border-b border-gray-700 pb-4">Inquiry Volume Trend</h3>
          <div className="h-80 w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{ fill: '#374151', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#f3f4f6' }}
                  />
                  <Bar dataKey="volume" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">Insufficient Chronological Data</div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Dashboard;
