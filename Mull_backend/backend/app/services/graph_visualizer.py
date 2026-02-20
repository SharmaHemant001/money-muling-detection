from pyvis.network import Network
from fastapi import APIRouter, File, UploadFile
from fastapi.responses import HTMLResponse

from app.services.csv_parser import parse_csv
from app.services.graph_builder import build_graph
from app.services.cycle_detector import detect_cycles
from app.services.smurfing_detector import detect_smurfing
from app.services.shell_detector import detect_shells
from app.services.scoring_engine import score_accounts
from app.services.json_formatter import format_response
from app.services.ring_table_generator import generate_ring_summary_table


router = APIRouter()


def generate_interactive_graph(G, suspicious_accounts, fraud_rings):

    net = Network(
        height="850px",
        width="100%",
        directed=True,
        notebook=False
    )

    # Physics tuning for large graphs
    net.barnes_hut(
        gravity=-8000,
        central_gravity=0.3,
        spring_length=120,
        spring_strength=0.01,
        damping=0.09
    )

    # Must be valid JSON
    net.set_options("""
    {
      "physics": {
        "stabilization": true
      },
      "edges": {
        "width": 0.5,
        "smooth": false,
        "arrows": {
          "to": {
            "enabled": true,
            "scaleFactor": 0.5
          }
        }
      },
      "nodes": {
        "font": {
          "size": 0
        }
      }
    }
    """)

    suspicious_set = {acc["account_id"] for acc in suspicious_accounts}

    # Add nodes
    for node in G.nodes():

        is_suspicious = node in suspicious_set

        net.add_node(
            node,
            label="",
            shape="star" if is_suspicious else "dot",
            color="red" if is_suspicious else "#A9CCE3",
            size=28 if is_suspicious else 10,
            borderWidth=4 if is_suspicious else 1,
            title=(
                f"<b>{node}</b><br>"
                f"{'Suspicious Account' if is_suspicious else 'Normal Account'}"
            )
        )

    # Add edges
    for source, target, data in G.edges(data=True):
        net.add_edge(
            source,
            target,
            title=(
                f"Amount: {data.get('amount')}<br>"
                f"Txn: {data.get('transaction_id')}"
            )
        )

    # Highlight fraud rings
    ring_colors = [
        "#FF5733", "#33FF57", "#3357FF",
        "#F1C40F", "#9B59B6", "#E67E22"
    ]

    for i, ring in enumerate(fraud_rings):
        color = ring_colors[i % len(ring_colors)]

        for acc in ring["member_accounts"]:
            if acc in net.node_ids:
                node_data = net.get_node(acc)

                if acc in suspicious_set:
                    node_data["borderWidth"] = 5
                    node_data["borderWidthSelected"] = 6
                else:
                    node_data["color"] = color

    return net


@router.post("/visualize", response_class=HTMLResponse)
async def visualize_csv(file: UploadFile = File(...)):

    df = parse_csv(file)
    G = build_graph(df)

    cycles = detect_cycles(G)
    smurfing = detect_smurfing(df)
    shells = detect_shells(G)

    suspicious_data = score_accounts(G, cycles, smurfing, shells)

    response = format_response(
        suspicious_data,
        G,
        0,
        cycles=cycles,
        smurfing=smurfing,
        shells=shells,
    )

    net = generate_interactive_graph(
        G,
        response["suspicious_accounts"],
        response["fraud_rings"]
    )

    net.save_graph("graph.html")

    with open("graph.html", "r", encoding="utf-8") as f:
        graph_html = f.read()

    # Generate Fraud Ring Summary Table
    table_html = generate_ring_summary_table(response["fraud_rings"])

    # SAFELY append table after graph
    full_html = graph_html + "<br><br>" + table_html

    return HTMLResponse(content=full_html)
