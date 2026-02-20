import "./App.css";
import React, { useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import Papa from "papaparse";
import axios from "axios";

export default function App() {
  const [elements, setElements] = useState([]);
  const [rings, setRings] = useState([]);
  const [report, setReport] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await axios.post(
            "https://YOUR_BACKEND_URL/analyze",
            results.data
          );

          const { suspicious_accounts, fraud_rings } = res.data;

          buildGraph(results.data, suspicious_accounts);
          setRings(fraud_rings);
          setReport(res.data);
        } catch {
          alert("Backend error");
        }
      },
    });
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
      if (nodeMap.has(acc.account_id)) {
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
    a.download = "analysis.json";
    a.click();
  };

  const stylesheet = [
    {
      selector: "node",
      style: {
        label: "data(id)",
        "background-color": "#3b82f6",
        color: "white",
        "text-valign": "center",
        "text-halign": "center",
        width: 35,
        height: 35,
        "font-size": 10,
        transition: "all 0.3s ease",
      },
    },
    {
      selector: "node[suspicious]",
      style: {
        "background-color": "#ef4444",
        width: "mapData(score, 0, 100, 45, 95)",
        height: "mapData(score, 0, 100, 45, 95)",
        "border-width": 3,
        "border-color": "#7f1d1d",
      },
    },
    {
      selector: "node.hovered",
      style: {
        "border-width": 4,
        "border-color": "#facc15",
        "shadow-blur": 25,
        "shadow-color": "#facc15",
        "shadow-opacity": 0.9,
        "shadow-offset-x": 0,
        "shadow-offset-y": 0,
        width: 110,
        height: 110,
        "font-size": 14,
        "z-index": 999,
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
        "font-size": 8,
        opacity: 0.6,
        transition: "all 0.2s ease",
      },
    },
    {
      selector: "edge.highlighted",
      style: {
        width: 5,
        opacity: 1,
        "line-color": "#f59e0b",
        "target-arrow-color": "#f59e0b",
        "shadow-blur": 10,
      },
    },
    {
      selector: ".faded",
      style: {
        opacity: 0.1,
      },
    },
  ];

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>Financial Forensics Engine</h2>

      <input type="file" accept=".csv" onChange={handleUpload} />

      <div
        style={{
          height: 520,
          border: "1px solid #ddd",
          marginTop: 20,
          borderRadius: 10,
        }}
      >
        <CytoscapeComponent
          elements={elements}
          style={{ width: "100%", height: "100%" }}
          layout={{
            name: "cose",
            animate: true,
            animationDuration: 1000,
          }}
          stylesheet={stylesheet}
          cy={(cy) => {
            cy.on("mouseover", "node", (evt) => {
              const node = evt.target;

              cy.elements().addClass("faded");
              node.removeClass("faded");
              node.addClass("hovered");

              const connected = node.connectedEdges();
              connected.removeClass("faded");
              connected.addClass("highlighted");

              connected.connectedNodes().removeClass("faded");
            });

            cy.on("mouseout", "node", () => {
              cy.elements().removeClass("faded");
              cy.elements().removeClass("hovered");
              cy.elements().removeClass("highlighted");
            });

            cy.on("tap", "node", (evt) => {
              const n = evt.target;
              alert(
                `Account: ${n.id()}
Score: ${n.data("score") || "Normal"}
Ring: ${n.data("ring") || "None"}`
              );
            });
          }}
        />
      </div>

      {rings.length > 0 && (
        <>
          <h3>Fraud Rings</h3>
          <table border="1" cellPadding="6">
            <thead>
              <tr>
                <th>Ring ID</th>
                <th>Pattern</th>
                <th>Risk Score</th>
                <th>Members</th>
              </tr>
            </thead>
            <tbody>
              {rings.map((r) => (
                <tr key={r.ring_id}>
                  <td>{r.ring_id}</td>
                  <td>{r.pattern_type}</td>
                  <td>{r.risk_score}</td>
                  <td>{r.member_accounts.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {report && (
        <button onClick={downloadJSON} style={{ marginTop: 20 }}>
          Download JSON Report
        </button>
      )}
    </div>
  );
}
