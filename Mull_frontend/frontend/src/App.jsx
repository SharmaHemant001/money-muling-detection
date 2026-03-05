import "./App.css";
import React, { useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import axios from "axios";

export default function App() {

  const [elements, setElements] = useState([]);
  const [rings, setRings] = useState([]);
  const [report, setReport] = useState(null);
  const [search, setSearch] = useState("");
  const [cyRef, setCyRef] = useState(null);

  const handleUpload = async (e) => {

    const file = e.target.files[0];

    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {

      const res = await axios.post(
        "https://money-muling-detection-7.onrender.com/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const { suspicious_accounts, fraud_rings, transactions } = res.data;

      buildGraph(transactions, suspicious_accounts);

      setRings(fraud_rings);
      setReport(res.data);

    } catch (error) {

      console.error(error);
      alert("Backend error");

    }

  };

  const buildGraph = (txns, suspicious) => {

    const nodeMap = new Map();
    const edges = [];

    txns.forEach((t) => {

      if (!nodeMap.has(t.sender_id)) {
        nodeMap.set(t.sender_id, { data: { id: t.sender_id } });
      }

      if (!nodeMap.has(t.receiver_id)) {
        nodeMap.set(t.receiver_id, { data: { id: t.receiver_id } });
      }

      edges.push({
        data: {
          id: `${t.sender_id}-${t.receiver_id}-${Math.random()}`,
          source: t.sender_id,
          target: t.receiver_id,
          label: t.amount,
        },
      });

    });

    suspicious.forEach((acc) => {

      if (nodeMap.has(acc.account_id) && acc.suspicion_score > 50) {

        const node = nodeMap.get(acc.account_id);

        node.data.suspicious = true;
        node.data.score = acc.suspicion_score;
        node.data.ring = acc.ring_id;

      }

    });

    setElements([...Array.from(nodeMap.values()), ...edges]);

  };

  const downloadJSON = () => {

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "fraud-analysis-report.json";
    a.click();

  };

  const searchAccount = () => {

    if (!cyRef) return;

    cyRef.nodes().removeClass("highlight");

    const node = cyRef.getElementById(search);

    if (node) {

      node.addClass("highlight");
      cyRef.center(node);
      cyRef.zoom(2);

    } else {
      alert("Account not found");
    }

  };

  const zoomFit = () => {
    if (cyRef) cyRef.fit();
  };

  const stylesheet = [

    {
      selector: "node",
      style: {
        label: "data(id)",
        "background-color": "#3b82f6",
        color: "white",
        width: 40,
        height: 40,
        "font-size": 10,
        "text-valign": "center",
        "text-halign": "center"
      },
    },

    {
      selector: "node[suspicious]",
      style: {
        "background-color": "#ef4444",
        width: "mapData(score, 0, 100, 50, 95)",
        height: "mapData(score, 0, 100, 50, 95)",
        "border-width": 4,
        "border-color": "#7f1d1d"
      },
    },

    {
      selector: "edge",
      style: {
        width: 2,
        "line-color": "#9ca3af",
        "target-arrow-color": "#9ca3af",
        "target-arrow-shape": "triangle",
        label: "data(label)",
        "font-size": 8
      },
    },

    {
      selector: ".highlight",
      style: {
        "background-color": "#facc15",
        "line-color": "#facc15",
        "target-arrow-color": "#facc15"
      }
    }

  ];

  const totalAccounts = report?.transactions
    ? new Set(report.transactions.map(t => t.sender_id)).size
    : 0;

  const totalTransactions = report?.transactions?.length || 0;
  const suspiciousCount = report?.suspicious_accounts?.length || 0;
  const ringCount = rings.length;

  return (

    <div style={{
      background: "#0f172a",
      minHeight: "100vh",
      padding: 30,
      color: "white",
      fontFamily: "Arial"
    }}>

      <h1 style={{ textAlign: "center" }}>
        💰 Money Muling Detection Engine
      </h1>

      <p style={{
        textAlign: "center",
        color: "#94a3b8",
        marginBottom: 30
      }}>
        Graph-based AML investigation dashboard detecting fraud rings.
      </p>


      {/* Statistics */}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 15,
        marginBottom: 25
      }}>

        <div className="card">Accounts<br/><b>{totalAccounts}</b></div>
        <div className="card">Transactions<br/><b>{totalTransactions}</b></div>
        <div className="card">Suspicious<br/><b>{suspiciousCount}</b></div>
        <div className="card">Fraud Rings<br/><b>{ringCount}</b></div>

      </div>


      {/* Upload */}

      <div style={{
        background: "#1e293b",
        padding: 20,
        borderRadius: 10,
        textAlign: "center",
        marginBottom: 20
      }}>

        <h3>Upload Transaction CSV</h3>

        <input type="file" accept=".csv" onChange={handleUpload} />

      </div>


      {/* Search */}

      <div style={{
        marginBottom: 20,
        textAlign: "center"
      }}>

        <input
          placeholder="Search Account ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={searchAccount}>Search</button>
        <button onClick={zoomFit}>Fit Graph</button>

      </div>


      {/* Graph */}

      <div style={{
        height: 550,
        background: "#020617",
        borderRadius: 10,
        padding: 10
      }}>

        <CytoscapeComponent
          elements={elements}
          style={{ width: "100%", height: "100%" }}
          layout={{
            name: "cose",
            animate: true,
            padding: 80,
            nodeRepulsion: 100000,
            idealEdgeLength: 120
          }}
          stylesheet={stylesheet}

          cy={(cy) => {

            setCyRef(cy);

            cy.on("tap", "node", (evt) => {

              const node = evt.target;
              const ring = node.data("ring");

              cy.elements().removeClass("highlight");

              if (ring) {

                cy.nodes().forEach(n => {
                  if (n.data("ring") === ring) {
                    n.addClass("highlight");
                  }
                });

              }

            });

          }}

        />

      </div>


      {/* Legend */}

      <div style={{ marginTop: 20 }}>

        <h4>Legend</h4>

        <p>🔵 Normal Account</p>
        <p>🔴 Suspicious Account</p>
        <p>🟡 Fraud Ring Highlight</p>

      </div>


      {/* Fraud Rings Table */}

      {rings.length > 0 && (

        <div style={{ marginTop: 40 }}>

          <h2>Fraud Rings Detected</h2>

          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 10
          }}>

            <thead style={{ background: "#0284c7" }}>

              <tr>
                <th style={{ padding: 10 }}>Ring ID</th>
                <th>Pattern</th>
                <th>Risk Score</th>
                <th>Members</th>
              </tr>

            </thead>

            <tbody>

              {rings.map((r) => (

                <tr key={r.ring_id}
                  style={{
                    background: "#020617",
                    borderBottom: "1px solid #334155"
                  }}
                >

                  <td style={{ padding: 10 }}>{r.ring_id}</td>
                  <td>{r.pattern_type}</td>
                  <td>{r.risk_score}</td>
                  <td>{r.member_accounts.join(", ")}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}


      {report && (

        <div style={{ textAlign: "center" }}>

          <button
            onClick={downloadJSON}
            style={{
              marginTop: 30,
              padding: "12px 30px",
              background: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: 16,
              cursor: "pointer"
            }}
          >
            Download JSON Report
          </button>

        </div>

      )}

    </div>

  );

}