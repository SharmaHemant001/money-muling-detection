import networkx as nx
from app.config import CYCLE_MIN_LENGTH, CYCLE_MAX_LENGTH

def detect_cycles(G):
    cycles = []

    simple_cycles = list(nx.simple_cycles(G))

    for cycle in simple_cycles:
        if CYCLE_MIN_LENGTH <= len(cycle) <= CYCLE_MAX_LENGTH:
            cycles.append(cycle)

    return cycles
