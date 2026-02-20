import pandas as pd

REQUIRED_COLUMNS = [
    "transaction_id",
    "sender_id",
    "receiver_id",
    "amount",
    "timestamp"
]

def parse_csv(file):
    try:
        df = pd.read_csv(file.file)
    except (pd.errors.EmptyDataError, pd.errors.ParserError) as exc:
        raise ValueError("Invalid or empty CSV file") from exc

    for col in REQUIRED_COLUMNS:
        if col not in df.columns:
            raise ValueError(f"Missing column: {col}")

    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    if df["timestamp"].isna().any():
        raise ValueError("Invalid timestamp values in CSV")

    return df
