import os
from pathlib import Path
from typing import Dict, List


DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "emergency_protocols"


def load_protocol_files() -> Dict[str, str]:
    """
    Load all protocol text files into memory.
    Key: protocol name (without extension), Value: full text content.
    """
    protocols: Dict[str, str] = {}
    if not DATA_DIR.exists():
        return protocols

    for file in DATA_DIR.glob("*.txt"):
        name = file.stem
        try:
            text = file.read_text(encoding="utf-8")
        except Exception:
            continue
        protocols[name] = text
    return protocols


def list_protocols() -> List[str]:
    return sorted(load_protocol_files().keys())

