import React, { useState } from "react";
import GraphVisualization from "./components/GraphVisualization";

function App() {
  const [file, setFile] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [backendData, setBackendData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const response = await fetch(
        "https://money-muling-detection-6.onrender.com/upload",
        {
          method: "POST",
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error("Server error: " + response.status);
      }

      const data = await response.json();
      console.log("Backend Response:", data);

      setBackendData(data);

      const nodeMap = new Map();
      const links = [];

      const suspiciousAccounts = data.suspicious_accounts || [];
      const fraudRings = data.fraud_rings || [];
      const transactions = data.transactions || [];

      const suspiciousSet = new Set(
        suspiciousAccounts.map(function (acc) {
          return acc.account_id;
        })
      );

      const ringMap = {};
      fraudRings.forEach(function (ring) {
        if (ring.member_accounts) {
          ring.member_accounts.forEach(function (acc) {
            ringMap[acc] = ring.ring_id;
          });
        }
      });

      transactions.forEach(function (tx) {
        if (!nodeMap.has(tx.sender_id)) {
          nodeMap.set(tx.sender_id, {
            id: tx.sender_id,
            suspicious: suspiciousSet.has(tx.sender_id),
            ring: ringMap[tx.sender_id] || null
          });
        }

        if (!nodeMap.has(tx.receiver_id)) {
          nodeMap.set(tx.receiver_id, {
            id: tx.receiver_id,
            suspicious: suspiciousSet.has(tx.receiver_id),
            ring: ringMap[tx.receiver_id] || null
          });
        }

        links.push({
          source: tx.sender_id,
          target: tx.receiver_id,
          amount: tx.amount
        });
      });

      setGraphData({
        nodes: Array.from(nodeMap.values()),
        links: links
      });

      setLoading(false);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check console.");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Money Muling Detection Engine</h2>

      <input
        type="file"
        accept=".csv"
        onChange={function (e) {
          setFile(e.target.files[0]);
        }}
      />

      <button onClick={handleUpload} disabled={!file || loading}>
        {loading ? "Processing..." : "Upload CSV"}
      </button>

      {graphData && (
        <GraphVisualization
          graphData={graphData}
          rings={backendData ? backendData.fraud_rings : []}
        />
      )}
    </div>
  );
}

export default App;