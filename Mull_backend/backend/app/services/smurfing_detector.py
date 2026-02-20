from datetime import timedelta
from app.config import SMURFING_THRESHOLD

WINDOW_HOURS = 72
DOMINANT_SENDER_RATIO = 0.7  # 70% from same sender = likely normal


def detect_smurfing(df):

    smurfing_groups = {}

    df = df.sort_values("timestamp")

    for receiver, group in df.groupby("receiver_id"):

        timestamps = group["timestamp"].values
        senders = group["sender_id"].values

        # ------------------------------------------------
        # 🚀 FALSE POSITIVE PROTECTION (Salary Check)
        # ------------------------------------------------
        sender_counts = group["sender_id"].value_counts()

        if len(sender_counts) > 0:
            dominant_ratio = sender_counts.max() / sender_counts.sum()

            if dominant_ratio >= DOMINANT_SENDER_RATIO:
                # Likely consistent salary / normal inflow
                continue  # Skip smurfing detection for this account

        # ------------------------------------------------
        # Sliding Window Smurfing Detection
        # ------------------------------------------------
        left = 0
        sender_count = {}

        for right in range(len(group)):

            # Add right sender
            sender = senders[right]
            sender_count[sender] = sender_count.get(sender, 0) + 1

            # Shrink window if outside time range
            while (timestamps[right] - timestamps[left]) > timedelta(hours=WINDOW_HOURS):
                left_sender = senders[left]
                sender_count[left_sender] -= 1
                if sender_count[left_sender] == 0:
                    del sender_count[left_sender]
                left += 1

            # Check threshold
            if len(sender_count) >= SMURFING_THRESHOLD:
                if receiver not in smurfing_groups:
                    smurfing_groups[receiver] = set()

                smurfing_groups[receiver].update(sender_count.keys())

    # Convert sets to lists
    return {
        agg: list(senders)
        for agg, senders in smurfing_groups.items()
    }
