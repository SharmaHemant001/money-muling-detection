from app.config import SHELL_MAX_DEGREE
import networkx as nx

def detect_shells(G):

    shell_nodes = set()

    # Identify shell-like nodes
    for node in G.nodes():
        if G.degree(node) <= SHELL_MAX_DEGREE:
            shell_nodes.add(node)

    # Create subgraph of only shell-like nodes
    shell_subgraph = G.subgraph(shell_nodes)

    # Get connected components (undirected for grouping)
    components = list(nx.connected_components(shell_subgraph.to_undirected()))

    suspicious_chains = []

    for component in components:
        if len(component) >= 3:  # minimum size to be meaningful
            suspicious_chains.append(list(component))

    return suspicious_chains
