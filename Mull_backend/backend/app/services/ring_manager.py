def generate_rings(cycles, smurfing_groups, shell_chains):

    rings = []
    ring_counter = 1

    MIN_RING_SIZE = 2  # false positive buffer
    seen_member_sets = set()  # prevent duplicate rings

    # -------------------------
    # Cycles
    # -------------------------
    for cycle in cycles:

        members = list(set(cycle))

        if len(members) < MIN_RING_SIZE:
            continue

        member_key = frozenset(members)
        if member_key in seen_member_sets:
            continue

        seen_member_sets.add(member_key)

        rings.append(
            {
                "ring_id": f"RING_{ring_counter:03d}",
                "member_accounts": members,
                "pattern_type": "cycle",
            }
        )

        ring_counter += 1

    # -------------------------
    # Smurfing (CORRECTED)
    # -------------------------
    if isinstance(smurfing_groups, dict):

        for aggregator, smurfs in smurfing_groups.items():

            members = list(set(smurfs + [aggregator]))

            if len(members) < MIN_RING_SIZE:
                continue

            member_key = frozenset(members)
            if member_key in seen_member_sets:
                continue

            seen_member_sets.add(member_key)

            rings.append(
                {
                    "ring_id": f"RING_{ring_counter:03d}",
                    "member_accounts": members,
                    "pattern_type": "smurfing",
                }
            )

            ring_counter += 1

    # -------------------------
    # Shell chains
    # -------------------------
    for chain in shell_chains:

        members = list(set(chain))

        if len(members) < MIN_RING_SIZE:
            continue

        member_key = frozenset(members)
        if member_key in seen_member_sets:
            continue

        seen_member_sets.add(member_key)

        rings.append(
            {
                "ring_id": f"RING_{ring_counter:03d}",
                "member_accounts": members,
                "pattern_type": "shell",
            }
        )

        ring_counter += 1

    return rings