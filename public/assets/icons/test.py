import json
import os
import re

MILITARY_FILE = "military.json"
EXAMPLE_FILE = "example.json"
OUTPUT_FILE = "military_with_title.json"


def normalize_name(s: str) -> str:
    """
    Chuẩn hoá tên để so sánh:
    - bỏ .svg
    - bỏ _1, _2
    - lowercase
    """
    s = os.path.basename(s)
    s = s.replace(".svg", "")
    s = re.sub(r"_\d+$", "", s)
    return s.lower()


# ===== LOAD example.json → map =====
with open(EXAMPLE_FILE, "r", encoding="utf-8") as f:
    examples = json.load(f)

example_map = {}
for item in examples:
    key = normalize_name(item["path"])
    example_map[key] = item["description"]

# ===== LOAD military.json =====
with open(MILITARY_FILE, "r", encoding="utf-8") as f:
    military = json.load(f)

# ===== MATCH & ASSIGN =====
for block in military.values():
    if not isinstance(block, dict):
        continue

    svgs = block.get("svgs", [])
    for svg in svgs:
        svg_key = normalize_name(svg["name"])

        # tìm description phù hợp nhất
        for ex_key, desc in example_map.items():
            if svg_key.startswith(ex_key) or ex_key.startswith(svg_key):
                svg["title"] = desc
                break

# ===== SAVE =====
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(military, f, ensure_ascii=False, indent=2)

print("DONE ->", OUTPUT_FILE)
