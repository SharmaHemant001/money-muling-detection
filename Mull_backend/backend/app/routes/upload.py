from fastapi import APIRouter, UploadFile, File, HTTPException
import time
import json

from app.services.csv_parser import parse_csv
from app.services.graph_builder import build_graph
from app.services.cycle_detector import detect_cycles
from app.services.smurfing_detector import detect_smurfing
from app.services.shell_detector import detect_shells
from app.services.scoring_engine import score_accounts
from app.services.json_formatter import format_response

router = APIRouter()

@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):

    start_time = time.time()

    try:
        df = parse_csv(file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    # Build graph
    G = build_graph(df)

    # Detection modules
    cycles = detect_cycles(G)
    smurfing = detect_smurfing(df)
    shells = detect_shells(G)

    # Scoring
    suspicious_data = score_accounts(G, cycles, smurfing, shells)

    # Format response
    response = format_response(
        suspicious_data,
        G,
        time.time() - start_time,
        cycles=cycles,
        smurfing=smurfing,
        shells=shells,
    )

    # 🔴 FIX TIMESTAMP ISSUE
    df_copy = df.copy()

    if "timestamp" in df_copy.columns:
        df_copy["timestamp"] = df_copy["timestamp"].astype(str)

    response["transactions"] = df_copy.to_dict(orient="records")

    return response