from app.config import WEIGHT_CYCLE, WEIGHT_SMURFING, WEIGHT_SHELL, MAX_SCORE

def score_accounts(G, cycles, smurfing, shells):

    scores = {}

    for node in G.nodes():
        scores[node] = {"score": 0, "patterns": set()}

    for cycle in cycles:
        for acc in cycle:
            scores[acc]["score"] += WEIGHT_CYCLE
            scores[acc]["patterns"].add("cycle")

    for acc in smurfing:
        scores[acc]["score"] += WEIGHT_SMURFING
        scores[acc]["patterns"].add("smurfing")

    for chain in shells:
        for acc in chain:
            scores[acc]["score"] += WEIGHT_SHELL
            scores[acc]["patterns"].add("shell")

    for acc in scores:
        scores[acc]["score"] = min(MAX_SCORE, scores[acc]["score"])

    return scores
