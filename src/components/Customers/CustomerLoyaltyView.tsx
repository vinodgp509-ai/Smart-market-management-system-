import React, { useState } from 'react';
import { Customer, LoyaltyTier } from '../../types/market';
import { Users, Search, Plus, Award, Phone, Mail, Sparkles, X, Check, DollarSign } from 'lucide-react';

interface CustomerLoyaltyViewProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export const CustomerLoyaltyView: React.FC<CustomerLoyaltyViewProps> = ({
  customers,
  setCustomers
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [bonusModalCust, setBonusModalCust] = useState<Customer | null>(null);
  const [bonusPointsInput, setBonusPointsInput] = useState(50);

  // New customer form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTier, setNewTier] = useState<LoyaltyTier>('Bronze');

  const tiers = ['All', 'Bronze', 'Silver', 'Gold', 'VIP Platinum'];

  const filteredCustomers = customers.filter(c => {
    const matchesTier = selectedTier === 'All' || c.loyaltyTier === selectedTier;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const totalPointsInCirculation = customers.reduce((sum, c) => sum + c.points, 0);
  const totalCustomerSpend = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      loyaltyTier: newTier,
      points: 50, // Welcome signup bonus
      totalSpent: 0,
      visitCount: 1,
      joinedDate: '2026-09-27'
    };

    setCustomers(prev => [newCustomer, ...prev]);
    setIsAddOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
  };

  const handleAwardBonusPoints = () => {
    if (!bonusModalCust) return;
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === bonusModalCust.id) {
          return {
            ...c,
            points: c.points + Number(bonusPointsInput)
          };
        }
        return c;
      })
    );
    setBonusModalCust(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Banner */}
      <div className="p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Customer Loyalty & CRM Rewards</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Omnichannel customer profiles, tier progression, and dynamic loyalty points redemption
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll New Member</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Active Loyalty Members</div>
            <div className="font-mono font-bold text-lg text-white mt-1">
              {customers.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              VIP Platinum: {customers.filter(c => c.loyaltyTier === 'VIP Platinum').length}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Points In Circulation</div>
            <div className="font-mono font-bold text-lg text-amber-400 mt-1 tabular-nums">
              {totalPointsInCirculation} pts
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Redemption Value: ${(totalPointsInCirculation / 100 * 5).toFixed(2)}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Total Member Lifetime Spend</div>
            <div className="font-mono font-bold text-lg text-emerald-400 mt-1 tabular-nums">
              ${totalCustomerSpend.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Avg per member: ${(totalCustomerSpend / (customers.length || 1)).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, email..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {tiers.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTier(t)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedTier === t
                  ? 'bg-slate-100 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead className="bg-slate-950 text-[11px] font-mono text-slate-400 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-4 font-medium">Customer Profile</th>
              <th className="py-2.5 px-3 font-medium">Contact Details</th>
              <th className="py-2.5 px-3 font-medium">Loyalty Tier</th>
              <th className="py-2.5 px-3 font-medium">Points Balance</th>
              <th className="py-2.5 px-3 font-medium">Lifetime Spend</th>
              <th className="py-2.5 px-3 font-medium">Visits</th>
              <th className="py-2.5 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredCustomers.map((cust) => {
              const tierColor =
                cust.loyaltyTier === 'VIP Platinum'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : cust.loyaltyTier === 'Gold'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : cust.loyaltyTier === 'Silver'
                  ? 'bg-slate-400/20 text-slate-200 border-slate-400/30'
                  : 'bg-orange-900/30 text-orange-300 border-orange-800/40';

              return (
                <tr key={cust.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{cust.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Member since {cust.joinedDate}</div>
                    {cust.notes && (
                      <div className="text-[10px] text-slate-400 italic mt-0.5 max-w-xs truncate">{cust.notes}</div>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{cust.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>{cust.email}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${tierColor}`}>
                      {cust.loyaltyTier}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-amber-400 text-sm">
                      {cust.points} pts
                    </div>
                    <div className="text-[10px] text-slate-500">
                      = ${((cust.points / 100) * 5).toFixed(2)} redemption
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono font-semibold text-white">
                    ${cust.totalSpent.toFixed(2)}
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-300">
                    {cust.visitCount} visits
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setBonusModalCust(cust);
                        setBonusPointsInput(50);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded text-xs font-medium transition-colors"
                    >
                      + Award Bonus
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Enroll Customer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-slate-100">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <h3 className="font-semibold text-sm text-white">Enroll New Loyalty Member</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Phone Number (Lookup Key)</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. 555-0812"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. jordan.m@example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Initial Tier</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as LoyaltyTier)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Bronze">Bronze (Standard Member)</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold VIP</option>
                  <option value="VIP Platinum">VIP Platinum</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg"
                >
                  Register Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bonus points modal */}
      {bonusModalCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden text-slate-100 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-semibold text-sm text-white">Award Bonus Points</h3>
              <button onClick={() => setBonusModalCust(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Grant promotional loyalty points to <strong className="text-white">{bonusModalCust.name}</strong>.
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1">Points to award:</label>
              <div className="flex gap-2">
                {[25, 50, 100, 200].map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => setBonusPointsInput(pts)}
                    className={`flex-1 py-1.5 rounded text-xs font-mono font-medium border ${
                      bonusPointsInput === pts
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    +{pts}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setBonusModalCust(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAwardBonusPoints}
                className="px-4 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg"
              >
                Award +{bonusPointsInput} Pts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
