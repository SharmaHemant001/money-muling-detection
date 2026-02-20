import React, { useRef, useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import * as d3 from "d3-force";

const GraphVisualization = ({ graphData }) => {
  const graphRef = useRef(null);
  const [hoverNode, setHoverNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState("graph");

  const data = graphData || { nodes: [], links: [] };

  /* ================= FORCE CONFIG (SAFE + STABLE) ================= */
  useEffect(() => {
    if (!graphRef.current) return;

    const fg = graphRef.current;

    fg.d3Force("charge", d3.forceManyBody().strength(-180));
    fg.d3Force("link", d3.forceLink().distance(60).strength(0.4));
    fg.d3Force("center", d3.forceCenter(0, 0));
    fg.d3Force("collision", d3.forceCollide().radius(8));

  }, [data]);

  /* ================= RING COLOR ================= */
  const getRingColor = (ringId) => {
    if (!ringId) return "#3b82f6";

    const palette = [
      "#8b5cf6",
      "#f59e0b",
      "#10b981",
      "#ec4899",
      "#06b6d4",
      "#eab308",
      "#22c55e",
      "#f97316"
    ];

    const hash = ringId
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0);

    return palette[hash % palette.length];
  };

  return (
    <div className="min-h-screen bg-[#0b061a] text-white p-6">

      {/* HEADER */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">
          Money Muling Detection Network
        </h1>
        <p className="text-slate-400 text-sm">
          Directed edges represent sender → receiver money flow
        </p>
      </div>

      {/* VIEW TOGGLE */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setViewMode("graph")}
          className={`px-4 py-2 rounded-l ${
            viewMode === "graph" ? "bg-purple-600" : "bg-gray-700"
          }`}
        >
          Graph
        </button>

        <button
          onClick={() => setViewMode("table")}
          className={`px-4 py-2 rounded-r ${
            viewMode === "table" ? "bg-purple-600" : "bg-gray-700"
          }`}
        >
          Table
        </button>
      </div>

      {/* ================= GRAPH VIEW ================= */}
      {viewMode === "graph" && (
        <div className="relative w-full h-[700px] bg-[#120a2f] rounded-2xl border border-white/10 shadow-2xl">

          <ForceGraph2D
            ref={graphRef}
            graphData={data}
            backgroundColor="transparent"

            /* Zoom & Pan */
            minZoom={0.1}
            maxZoom={8}
            enableZoomInteraction={true}
            enablePanInteraction={true}
            enableNodeDrag={true}
            cooldownTicks={100}

            /* Directed Arrows */
            linkDirectionalArrowLength={3}
            linkDirectionalArrowRelPos={1}
            linkDirectionalArrowColor={() => "#ffffff"}

            linkWidth={(link) =>
              link.amount > 100000 ? 1 : 0.4
            }

            linkColor={(link) =>
              link.amount > 100000
                ? "rgba(255,0,0,0.5)"
                : "rgba(255,255,255,0.1)"
            }

            /* Interaction */
            onNodeHover={(node) => setHoverNode(node || null)}
            onNodeClick={(node) => setSelectedNode(node || null)}
            onBackgroundClick={() => setSelectedNode(null)}

            /* ================= NODE RENDER ================= */
            nodeCanvasObject={(node, ctx, globalScale) => {
              const isActive =
                selectedNode?.id === node.id ||
                hoverNode?.id === node.id;

              const baseSize = node.suspicious
                ? 8
                : node.ring
                ? 5
                : 3;

              const size = isActive ? baseSize + 3 : baseSize;

              const color = node.suspicious
                ? "#ff2d2d"
                : node.ring
                ? getRingColor(node.ring)
                : "#3b82f6";

              ctx.beginPath();
              ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();

              /* Suspicious white border */
              if (node.suspicious) {
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();
              }

              /* Show labels only when zoomed in */
              if (globalScale > 2.5) {
                const fontSize = 10 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = "center";
                ctx.fillStyle = "white";
                ctx.fillText(node.id, node.x, node.y + size + 6);
              }
            }}
          />

          {/* ================= INFO PANEL ================= */}
          {(hoverNode || selectedNode) && (
            <div className="absolute bottom-6 left-6 bg-black/80 p-4 rounded-xl border border-white/10 text-xs w-64 shadow-lg">
              {(() => {
                const node = selectedNode || hoverNode;
                return (
                  <>
                    <p className="text-white font-semibold mb-2">
                      {node.id}
                    </p>
                    <p>Suspicious: {node.suspicious ? "YES" : "NO"}</p>
                    <p>Ring: {node.ring || "None"}</p>
                    <p>Risk Score: {node.riskScore || 0}</p>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ================= TABLE VIEW ================= */}
      {viewMode === "table" && (
        <div className="bg-[#120a2f] p-6 rounded-2xl border border-white/10 max-h-[700px] overflow-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-400 border-b border-white/10">
              <tr>
                <th className="p-2">Account ID</th>
                <th className="p-2">Suspicious</th>
                <th className="p-2">Ring</th>
                <th className="p-2">Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {data.nodes.map((node, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="p-2">{node.id}</td>
                  <td className="p-2">
                    {node.suspicious ? "YES" : "NO"}
                  </td>
                  <td className="p-2">{node.ring || "-"}</td>
                  <td className="p-2">{node.riskScore || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GraphVisualization;