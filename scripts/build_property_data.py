from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / "aa_property_final_report.md"
OUTPUT = ROOT / "data" / "property-data.json"


def slugify(value: str) -> str:
    return value.lower().replace(".", "-")


def parse_report() -> list[dict]:
    lines = SOURCE.read_text(encoding="utf-8").splitlines()

    classes: list[dict] = []
    current_class: dict | None = None
    current_action: dict | None = None
    mode = None

    for line in lines:
        if line.startswith("# Tên property class: "):
            current_class = {
                "name": line.split(": ", 1)[1],
                "slug": slugify(line.split(": ", 1)[1]),
                "fields": [],
                "actions": [],
            }
            classes.append(current_class)
            current_action = None
            mode = None
            continue

        if current_class is None:
            continue

        if line == "## Danh sách các trường":
            mode = "fields"
            current_action = None
            continue

        if line == "## Danh sách các action trên property class":
            mode = "actions"
            current_action = None
            continue

        if mode == "fields" and line.startswith("- `"):
            match = re.match(r"- `([^`]+)`: (.+)", line)
            if match:
                current_class["fields"].append(
                    {
                        "name": match.group(1),
                        "meaning": match.group(2).strip(),
                    }
                )
            continue

        if mode == "actions" and line.startswith("### "):
            current_action = {
                "name": line[4:].strip(),
                "summary": "",
                "steps": "",
                "flow": "",
            }
            current_class["actions"].append(current_action)
            continue

        if mode == "actions" and current_action:
            if line.startswith("- Ý nghĩa: "):
                current_action["summary"] = line[len("- Ý nghĩa: ") :].strip()
            elif line.startswith("- Các bước thực hiện: "):
                current_action["steps"] = line[len("- Các bước thực hiện: ") :].strip()
            elif line.startswith("- Luồng xử lý: "):
                current_action["flow"] = line[len("- Luồng xử lý: ") :].strip()

    return classes


def main() -> None:
    classes = parse_report()
    payload = {
        "summary": {
            "propertyClassCount": len(classes),
            "actionCount": sum(
                1
                for item in classes
                for action in item["actions"]
                if not action["name"].startswith("NO DIRECT ACTION ")
            ),
            "totalActionEntries": sum(len(item["actions"]) for item in classes),
        },
        "items": classes,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
