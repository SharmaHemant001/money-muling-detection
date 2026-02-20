import React from "react";
import {
  Shield,
  Search,
  Download,
  AlertTriangle,
  Filter
} from "lucide-react";

const Dashboard = ({ backendData }) => {
  if (!backendData) {
    return (
      <div className="text-center text-white mt-20">
        Upload a CSV file to view results.
      </div>
    );
  }

  const fraudRings = backendData.fraud_rings || [];
  const suspiciousAccounts = backendData.suspicious_accounts || [];
  const summary = backendData.summary || {};

  /* -------- Download JSON -------- */
  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0c1b] text-slate-200 font-sans p-8">

      {/* HEADER */}
      <div className="flex flex-col items-center mb-12">
        <div className="bg-orange-600 p-3 rounded-2xl mb-4">
          <Shield className="text-white w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Fraud Detection Dashboard
        </h1>
        <p className="text-slate-400">
          Real-time monitoring of suspicious activities
        </p>
      </div>

      {/* ---------------- FRAUD RINGS ---------------- */}
      <div className="max-w-7xl mx-auto bg-white/5 rounded-xl border border-white/10 mb-10">

        <div className="p-6 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" />
            <h2 className="text-xl font-bold text-white">
              Fraud Rings ({fraudRings.length})
            </h2>
          </div>

          <button
            onClick={() => downloadJSON(fraudRings, "fraud_rings.json")}
            className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-sm"
          >
            <Download size={16} /> Download JSON
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-black/20 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-4">Ring ID</th>
              <th className="px-6 py-4">Pattern</th>
              <th className="px-6 py-4">Members</th>
            </tr>
          </thead>
          <tbody>
            {fraudRings.map((ring) => (
              <tr key={ring.ring_id} className="border-b border-white/5">
                <td className="px-6 py-4 text-red-400 font-mono">
                  {ring.ring_id}
                </td>
                <td className="px-6 py-4 text-white">
                  {ring.pattern_type}
                </td>
                <td className="px-6 py-4">
                  {ring.member_accounts?.length || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- SUSPICIOUS ACCOUNTS ---------------- */}
      <div className="max-w-7xl mx-auto bg-white/5 rounded-xl border border-white/10 mb-10">

        <div className="p-6 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-3">
            <Filter className="text-purple-400" />
            <h2 className="text-xl font-bold text-white">
              Suspicious Accounts ({suspiciousAccounts.length})
            </h2>
          </div>

          <button
            onClick={() =>
              downloadJSON(suspiciousAccounts, "suspicious_accounts.json")
            }
            className="flex items-center gap-2 bg-purple-600 px-4 py-2 rounded-lg text-sm"
          >
            <Download size={16} /> Download JSON
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-black/20 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-4">Account ID</th>
              <th className="px-6 py-4">Risk Score</th>
              <th className="px-6 py-4">Ring</th>
            </tr>
          </thead>
          <tbody>
            {suspiciousAccounts.map((acc) => (
              <tr key={acc.account_id} className="border-b border-white/5">
                <td className="px-6 py-4 text-purple-400 font-mono">
                  {acc.account_id}
                </td>
                <td className="px-6 py-4 text-white font-bold">
                  {acc.risk_score}
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {acc.ring_id || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- SUMMARY STATS ---------------- */}
      <div className="max-w-7xl mx-auto grid grid-cols-4 gap-6">
        <StatCard
          label="Total Accounts"
          value={summary.total_accounts_analyzed || 0}
          color="text-blue-400"
        />
        <StatCard
          label="Suspicious Accounts"
          value={summary.suspicious_accounts_flagged || 0}
          color="text-purple-500"
        />
        <StatCard
          label="Fraud Rings"
          value={summary.fraud_rings_detected || 0}
          color="text-red-500"
        />
        <StatCard
          label="Processing Time (s)"
          value={summary.processing_time_seconds || 0}
          color="text-emerald-500"
        />
      </div>
    </div>
  );
};

/* -------- Small Component -------- */
const StatCard = ({ label, value, color }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
    <p className="text-slate-500 text-xs uppercase mb-2">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

export default Dashboard;