from app.services.ring_manager import generate_rings


def format_response(scores, G, processing_time, cycles=None, smurfing=None, shells=None):

    cycles = cycles or []
    smurfing = smurfing or []
    shells = shells or []

    rings = generate_rings(cycles, smurfing, shells)

    suspicious_accounts = []
    fraud_rings = []

    # -------------------------
    # Map account -> ring
    # -------------------------
    account_ring_map = {}
    for ring in rings:
        for acc in ring["member_accounts"]:
            account_ring_map[acc] = ring["ring_id"]

    # -------------------------
    # Build suspicious accounts
    # -------------------------
    for acc, data in scores.items():

        if data["score"] > 0 and acc in account_ring_map:

            explanation = "Flagged due to: " + ", ".join(sorted(data["patterns"]))

            suspicious_accounts.append(
                {
                    "account_id": acc,
                    "suspicion_score": float(round(data["score"], 2)),
                    "detected_patterns": list(data["patterns"]),
                    "ring_id": account_ring_map[acc],
                    "explanation": explanation
                }
            )

    # Sort descending (MANDATORY)
    suspicious_accounts.sort(
        key=lambda x: x["suspicion_score"],
        reverse=True
    )

    # -------------------------
    # Build fraud ring objects (Dynamic Risk Score)
    # -------------------------
    for ring in rings:

        member_scores = [
            scores[acc]["score"]
            for acc in ring["member_accounts"]
            if acc in scores
        ]

        if member_scores:
            risk_score = round(sum(member_scores) / len(member_scores), 2)
        else:
            risk_score = 0.0

        fraud_rings.append(
            {
                "ring_id": ring["ring_id"],
                "member_accounts": ring["member_accounts"],
                "pattern_type": ring["pattern_type"],
                "risk_score": float(risk_score),
            }
        )

    # -------------------------
    # Summary
    # -------------------------
    summary = {
        "total_accounts_analyzed": G.number_of_nodes(),
        "suspicious_accounts_flagged": len(suspicious_accounts),
        "fraud_rings_detected": len(fraud_rings),
        "processing_time_seconds": round(processing_time, 2),
    }

    return {
        "suspicious_accounts": suspicious_accounts,
        "fraud_rings": fraud_rings,
        "summary": summary,
    }
