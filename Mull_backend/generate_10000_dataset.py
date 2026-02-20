import csv
import random
from datetime import datetime, timedelta

TOTAL_TRANSACTIONS = 10000
START_DATE = datetime(2026, 1, 1, 9, 0, 0)

filename = "test_10000_transactions.csv"

def random_time(base, max_hours=720):
    return base + timedelta(hours=random.randint(0, max_hours))

with open(filename, mode="w", newline="") as file:
    writer = csv.writer(file)

    # Required header (EXACT FORMAT)
    writer.writerow([
        "transaction_id",
        "sender_id",
        "receiver_id",
        "amount",
        "timestamp"
    ])

    txn_counter = 1

    # -------------------------
    # 1️⃣ Create 50 Cycle Rings
    # -------------------------
    for i in range(50):
        accounts = [f"CYCLE_{i}_{j}" for j in range(3)]
        for j in range(3):
            writer.writerow([
                f"TXN{txn_counter:06d}",
                accounts[j],
                accounts[(j + 1) % 3],
                round(random.uniform(3000, 10000), 2),
                random_time(START_DATE).strftime("%Y-%m-%d %H:%M:%S")
            ])
            txn_counter += 1

    # -------------------------
    # 2️⃣ Create 30 Smurfing Patterns
    # -------------------------
    for i in range(30):
        aggregator = f"AGG_{i}"
        base_time = random_time(START_DATE)

        # 10+ fan-in
        for j in range(12):
            writer.writerow([
                f"TXN{txn_counter:06d}",
                f"SMURF_{i}_{j}",
                aggregator,
                round(random.uniform(500, 950), 2),
                (base_time + timedelta(minutes=j*5)).strftime("%Y-%m-%d %H:%M:%S")
            ])
            txn_counter += 1

        # Fan-out
        for j in range(5):
            writer.writerow([
                f"TXN{txn_counter:06d}",
                aggregator,
                f"OUT_{i}_{j}",
                round(random.uniform(4000, 9000), 2),
                (base_time + timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S")
            ])
            txn_counter += 1

    # -------------------------
    # 3️⃣ Create 40 Shell Chains
    # -------------------------
    for i in range(40):
        chain = [f"SHELL_{i}_{j}" for j in range(4)]
        for j in range(3):
            writer.writerow([
                f"TXN{txn_counter:06d}",
                chain[j],
                chain[j + 1],
                round(random.uniform(2000, 8000), 2),
                random_time(START_DATE).strftime("%Y-%m-%d %H:%M:%S")
            ])
            txn_counter += 1

    # -------------------------
    # 4️⃣ Fill Remaining with Normal Traffic
    # -------------------------
    while txn_counter <= TOTAL_TRANSACTIONS:
        sender = f"NORMAL_{random.randint(1, 2000)}"
        receiver = f"NORMAL_{random.randint(2001, 4000)}"

        writer.writerow([
            f"TXN{txn_counter:06d}",
            sender,
            receiver,
            round(random.uniform(1000, 20000), 2),
            random_time(START_DATE).strftime("%Y-%m-%d %H:%M:%S")
        ])

        txn_counter += 1

print("✅ 10,000 transaction dataset created successfully!")
