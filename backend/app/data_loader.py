from __future__ import annotations

import json
import os
from functools import lru_cache
from typing import Any, Dict

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "archive_seed.json")


@lru_cache(maxsize=1)
def load_archive_data() -> Dict[str, Any]:
    """Load the indexed mysteries, categories, discoveries, and research sources."""
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)
