from __future__ import annotations

import json
import re
from pathlib import Path
from functools import lru_cache


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / "aa_property_final_report.md"
T24_ROOT = ROOT.parent / "T24.BP"
OUTPUT = ROOT / "data" / "property-data.json"


FIELD_DEF_RE = re.compile(r'OUT\.F<Z>\s*=\s*"([^"]+)"')
FIELD_LEN_RE = re.compile(r'OUT\.N<Z>\s*=\s*"([^"]*)"')
FIELD_TYPE_RE = re.compile(r'OUT\.T<Z>\s*=\s*"([^"]*)"')
FIELD_ASSOC_RE = re.compile(r'OUT\.ASSOC<Z>\s*=\s*"([^"]*)"')
FIELD_OPT_RE = re.compile(r'OUT\.T<Z,2>\s*=\s*"([^"]*)"')
FIELD_CHECK_RE = re.compile(r'OUT\.CHECKFILE<Z>\s*=\s*"([^"]*)"')
INSERT_RE = re.compile(r"\b([A-Z0-9]+\.[A-Z0-9.]+)\s+TO\s+(\d+)")
LABEL_RE = re.compile(r"^\s*([A-Z0-9][A-Z0-9.\-]*)\s*:\s*$")


def slugify(value: str) -> str:
    return value.lower().replace(".", "-")


def read_text(path: Path) -> str:
    return path.read_text(encoding="cp1252", errors="ignore")


def read_utf8(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def load_seed() -> list[dict]:
    if OUTPUT.exists():
        payload = json.loads(read_utf8(OUTPUT))
        if payload.get("items"):
            return payload["items"]

    if SOURCE.exists():
        lines = read_utf8(SOURCE).splitlines()
        classes: list[dict] = []
        current: dict | None = None
        in_actions = False

        for line in lines:
            if line.startswith("# Tên property class: "):
                current = {
                    "name": line.split(": ", 1)[1],
                    "actions": [],
                }
                classes.append(current)
                in_actions = False
                continue
            if line == "## Danh sách các action trên property class":
                in_actions = True
                continue
            if in_actions and current and line.startswith("### "):
                current["actions"].append({"name": line[4:].strip()})

        return classes

    raise FileNotFoundError("Không tìm thấy dữ liệu seed để sinh property-data.json")


def existing_payload_is_usable() -> bool:
    if not OUTPUT.exists():
        return False

    try:
        payload = json.loads(OUTPUT.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return False

    return bool(payload.get("summary")) and bool(payload.get("items"))


def class_prefix(field_name: str) -> str:
    parts = field_name.split(".")
    return ".".join(parts[:2])


def field_tail(field_name: str) -> str:
    parts = field_name.split(".")
    return ".".join(parts[2:]) if len(parts) > 2 else field_name


def camel_tail(field_name: str) -> str:
    tail = field_tail(field_name).split(".")
    return "".join(part.capitalize() for part in tail)


def parse_insert_fields(class_name: str) -> list[dict]:
    path = T24_ROOT / f"I_F.AA.{class_name}"
    if not path.exists():
        return []

    results: list[dict] = []
    seen: set[str] = set()

    for line in read_text(path).splitlines():
        match = INSERT_RE.search(line)
        if not match:
            continue
        field_name = match.group(1)
        if field_name in seen:
            continue
        seen.add(field_name)
        results.append({"name": field_name, "slot": int(match.group(2))})

    return sorted(results, key=lambda item: item["slot"])


def parse_field_defs(class_name: str) -> dict[str, dict]:
    path = T24_ROOT / f"AA.{class_name}.FIELDS.b"
    if not path.exists():
        return {}

    defs: dict[str, dict] = {}
    current_name = ""

    for line in read_text(path).splitlines():
        field_match = FIELD_DEF_RE.search(line)
        if field_match:
            current_name = field_match.group(1)
            defs[current_name] = {
                "assoc": FIELD_ASSOC_RE.search(line).group(1)
                if FIELD_ASSOC_RE.search(line)
                else "",
                "length": FIELD_LEN_RE.search(line).group(1)
                if FIELD_LEN_RE.search(line)
                else "",
                "type": FIELD_TYPE_RE.search(line).group(1)
                if FIELD_TYPE_RE.search(line)
                else "",
                "options": "",
                "checkfile": "",
            }
            opt_match = FIELD_OPT_RE.search(line)
            if opt_match:
                defs[current_name]["options"] = opt_match.group(1)
            continue

        if not current_name:
            continue

        check_match = FIELD_CHECK_RE.search(line)
        if check_match and current_name in defs:
            defs[current_name]["checkfile"] = check_match.group(1)

        opt_match = FIELD_OPT_RE.search(line)
        if opt_match and current_name in defs:
            defs[current_name]["options"] = opt_match.group(1)

    return defs


@lru_cache(maxsize=None)
def class_files(class_name: str) -> tuple[Path, ...]:
    patterns = [
        f"AA.{class_name}.b",
        f"AA.{class_name}.*.b",
        f"I_F.AA.{class_name}",
    ]
    results: list[Path] = []
    seen: set[Path] = set()
    for pattern in patterns:
        for path in sorted(T24_ROOT.glob(pattern)):
            if path not in seen and path.is_file():
                seen.add(path)
                results.append(path)
    return tuple(results)


@lru_cache(maxsize=None)
def class_file_lines(path_str: str) -> tuple[str, ...]:
    return tuple(read_text(Path(path_str)).splitlines())


def build_dictionary_sentence(field_name: str, field_def: dict | None, slot: int) -> list[str]:
    notes = [f"Trường nằm ở vị trí `{slot}` trong record của property class."]
    if not field_def:
        notes.append(
            "Trong repo hiện có chỉ thấy vị trí trường trong insert file, chưa thấy routine `FIELDS` của class này để mô tả thêm."
        )
        return notes

    pieces = []
    if field_def.get("assoc"):
        pieces.append(f"cấu trúc nhóm giá trị `{field_def['assoc']}`")
    if field_def.get("length"):
        pieces.append(f"định dạng `{field_def['length']}`")
    if field_def.get("type"):
        pieces.append(f"kiểu kiểm tra `{field_def['type']}`")
    if field_def.get("options"):
        opts = ", ".join(item for item in field_def["options"].split("_") if item)
        pieces.append(f"chỉ nhận các giá trị `{opts}`")
    if field_def.get("checkfile"):
        pieces.append(f"đối chiếu dữ liệu với bảng `{field_def['checkfile']}`")

    if pieces:
        notes.append("Khai báo trong routine `FIELDS`: " + ", ".join(pieces) + ".")

    return notes


def field_usage_notes(class_name: str, field_name: str) -> list[str]:
    tail = field_tail(field_name)
    camel = camel_tail(field_name)
    matches: list[str] = []

    for path in class_files(class_name):
        if path.name.startswith("I_F.") or path.name.endswith(".FIELDS.b"):
            continue

        lines = class_file_lines(str(path))
        for idx, line in enumerate(lines):
            if tail not in line and camel not in line and field_name not in line:
                continue

            stripped = " ".join(line.strip().split())
            if not stripped:
                continue
            if "LOG.INFO<" in stripped or "<region name=" in stripped:
                continue

            if "getRNew" in line:
                target = line.split("=", 1)[0].strip()
                if target.startswith("CASE ") or target.startswith("IF "):
                    continue
                matches.append(
                    f"Trong `{path.name}`, routine đang đọc giá trị trường này từ record nhập mới vào biến `{target}`."
                )
            elif "setAf(" in line:
                error_code = ""
                for look_ahead in lines[idx + 1 : idx + 7]:
                    error_match = re.search(r'"([^"]+)"', look_ahead)
                    if error_match:
                        error_code = error_match.group(1)
                        break
                if error_code:
                    matches.append(
                        f"Trong `{path.name}`, hệ thống gắn lỗi trực tiếp vào trường này; mã lỗi gần nhất là `{error_code}`."
                    )
            elif "IF " in line or line.strip().startswith("CASE "):
                matches.append(
                    f"Trong `{path.name}`, trường này tham gia điều kiện xử lý: `{stripped[:220]}`."
                )
            elif "=" in line:
                matches.append(
                    f"Trong `{path.name}`, có câu lệnh thao tác trực tiếp với trường này: `{stripped[:220]}`."
                )

            if len(matches) >= 3:
                return matches

    if not matches:
        matches.append(
            "Trong các file cùng property class của repo hiện có, chưa thấy routine riêng đọc hoặc kiểm tra trực tiếp trường này ngoài phần khai báo dictionary."
        )

    return matches


def resolve_action_file(class_name: str, action_heading: str) -> Path | None:
    if action_heading.startswith("NO DIRECT ACTION "):
        return None

    suffix = f" {class_name}"
    action_name = action_heading[: -len(suffix)] if action_heading.endswith(suffix) else action_heading

    direct = T24_ROOT / f"AA.{class_name}.{action_name}.b"
    if direct.exists():
        return direct

    fallback = T24_ROOT / f"{class_name}.{action_name}.b"
    if fallback.exists():
        return fallback

    candidates = sorted(T24_ROOT.glob(f"AA.{class_name}.*.b"))
    for path in candidates:
        if action_name in path.stem:
            return path

    return None


def parse_labels(lines: list[str]) -> dict[str, tuple[int, int]]:
    order: list[tuple[str, int]] = []
    for idx, line in enumerate(lines):
        match = LABEL_RE.match(line)
        if match:
            order.append((match.group(1), idx))

    regions: dict[str, tuple[int, int]] = {}
    for pos, (label, start) in enumerate(order):
        end = order[pos + 1][1] if pos + 1 < len(order) else len(lines)
        regions[label] = (start + 1, end)
    return regions


def region_lines(lines: list[str], regions: dict[str, tuple[int, int]], label: str) -> list[str]:
    if label not in regions:
        return []
    start, end = regions[label]
    return lines[start:end]


def summarize_assignments(raw_lines: list[str]) -> list[str]:
    notes: list[str] = []
    captured_vars: list[str] = []
    for line in raw_lines:
        stripped = " ".join(line.strip().split())
        if " = " in stripped and ("get" in stripped or "Framework" in stripped):
            captured_vars.append(stripped.split("=", 1)[0].strip())
    if captured_vars:
        notes.append(
            "Đọc ngữ cảnh và dữ liệu đầu vào vào các biến: "
            + ", ".join(f"`{item}`" for item in captured_vars[:8])
            + "."
        )
    return notes


def summarize_region(label: str, raw_lines: list[str]) -> list[str]:
    items: list[str] = []
    compact = [" ".join(line.strip().split()) for line in raw_lines if line.strip()]

    if label == "SET.ACTIVITY.DETAILS":
        items.extend(summarize_assignments(raw_lines))
    elif label == "INITIALISE":
        if any("RET.ERROR" in line for line in compact):
            items.append("Xóa các cờ lỗi xử lý để bắt đầu nhánh action mới.")
        items.extend(summarize_assignments(raw_lines))
    elif label == "PROCESS.ACTION":
        branches = []
        for line in compact:
            if line.startswith("CASE ") and "=" in line:
                branches.append(line.replace("CASE ", "", 1))
        if branches:
            items.append("Rẽ nhánh theo trạng thái hoạt động: " + "; ".join(f"`{item}`" for item in branches[:6]) + ".")
    elif label in {"PROCESS.INPUT.ACTION", "PROCESS.DELETE.ACTION", "PROCESS.AUTHORISE.ACTION", "PROCESS.REVERSE.ACTION"}:
        for line in compact:
            if "GOSUB " in line:
                items.append("Gọi tiếp nhánh xử lý `" + line.split("GOSUB ", 1)[1].split()[0] + "`.")
            elif "CALL " in line:
                items.append("Gọi routine `" + line.split("CALL ", 1)[1].split("(")[0].strip() + "`.")
            elif "UpdateChangeCondition()" in line:
                items.append("Gọi `AA.Framework.UpdateChangeCondition()` để ghi nhận thay đổi condition kế tiếp.")
            elif "FWRITE" in line or "WRITE" in line or "DELETE" in line:
                items.append("Có thao tác ghi/xóa dữ liệu: `" + line[:220] + "`.")
        if not items and compact:
            items.append("Không có thao tác chi tiết hơn ngoài khung xử lý của nhánh này.")
    elif label == "HANDLE.ERROR":
        if any("PROCESS.ERROR<-1>" in line for line in compact):
            items.append("Đẩy lỗi hiện tại vào mảng `PROCESS.ERROR`.")
        if any("setEtext" in line for line in compact):
            items.append("Ghi lỗi vào `EB.SystemTables.setEtext(...)` để đưa về màn hình/luồng gọi.")
        if any("StoreEndError" in line for line in compact):
            items.append("Lưu lỗi cuối bằng `EB.ErrorProcessing.StoreEndError()`.")
    elif label == "UPDATE.LOG":
        if any("LogManager" in line for line in compact):
            items.append("Ghi log debug qua `AA.Framework.LogManager(...)`.")
        for line in compact:
            if "LOG.INFO<" in line:
                items.append("Nạp thông tin vào `LOG.INFO`: `" + line[:220] + "`.")
                if len(items) >= 3:
                    break
    else:
        for line in compact:
            if "GOSUB " in line:
                items.append("Gọi tiếp `" + line.split("GOSUB ", 1)[1].split()[0] + "`.")
            elif "CALL " in line:
                items.append("Gọi routine `" + line.split("CALL ", 1)[1].split("(")[0].strip() + "`.")
            elif "FWRITE" in line or "WRITE" in line:
                items.append("Ghi dữ liệu: `" + line[:220] + "`.")
            elif "DELETE" in line:
                items.append("Xóa dữ liệu: `" + line[:220] + "`.")
            elif "IF " in line or line.startswith("CASE "):
                items.append("Điều kiện xử lý: `" + line[:220] + "`.")
            if len(items) >= 4:
                break

    return items


def top_description(lines: list[str]) -> str:
    desc: list[str] = []
    for line in lines[:80]:
        stripped = line.strip().lstrip("*").strip()
        if not stripped:
            continue
        if stripped.startswith("Program Description"):
            continue
        if stripped.startswith("@"):
            continue
        if stripped.startswith("The action routine is part of"):
            desc.append("Routine nguồn thuộc property class này và được gọi như action xử lý riêng.")
        elif stripped.startswith("Action to "):
            desc.append("Routine nguồn xử lý trực tiếp action này trên arrangement/account liên quan.")
        elif stripped.startswith("Purpose of the sub-routine"):
            continue
        if len(desc) >= 2:
            break
    return " ".join(desc) if desc else "Routine nguồn được đọc trực tiếp từ source của property class."


def build_action_entry(class_name: str, action_heading: str) -> dict:
    if action_heading.startswith("NO DIRECT ACTION "):
        files = [path.name for path in class_files(class_name) if path.name.endswith(".b")]
        return {
            "name": action_heading,
            "routine": "",
            "summary": "Repo hiện có không chứa routine action riêng cho property class này; chỉ thấy các file khai báo hoặc kiểm tra dữ liệu.",
            "steps": [
                "Không tìm thấy file action riêng để lần theo các bước xử lý.",
                "Các file tìm thấy chủ yếu là: " + ", ".join(f"`{name}`" for name in files[:8]) + ".",
            ],
            "flow": [
                "Vì không có routine action riêng trong repo nên chưa có bằng chứng source để mô tả luồng cập nhật bảng hoặc trường cụ thể hơn."
            ],
        }

    path = resolve_action_file(class_name, action_heading)
    if path is None:
        return {
            "name": action_heading,
            "routine": "",
            "summary": "Không resolve được file routine tương ứng trong repo hiện có.",
            "steps": ["Cần bổ sung source routine để truy vết action này chính xác hơn."],
            "flow": [],
        }

    lines = read_text(path).splitlines()
    labels = parse_labels(lines)
    ordered_labels = [
        "SET.ACTIVITY.DETAILS",
        "PROCESS.ACTION",
        "INITIALISE",
        "PROCESS.INPUT.ACTION",
        "PROCESS.DELETE.ACTION",
        "PROCESS.AUTHORISE.ACTION",
        "PROCESS.REVERSE.ACTION",
        "HANDLE.ERROR",
        "UPDATE.LOG",
    ]

    steps: list[str] = []
    for label in ordered_labels:
        region = region_lines(lines, labels, label)
        if not region:
            continue
        region_notes = summarize_region(label, region)
        if region_notes:
            steps.append(f"`{label}`: " + " ".join(region_notes))

    flow: list[str] = []
    for label in ordered_labels:
        region = region_lines(lines, labels, label)
        if not region:
            continue
        compact = [" ".join(line.strip().split()) for line in region if line.strip()]
        for line in compact:
            if any(token in line for token in ["getArrId()", "getCurrAction()", "UpdateChangeCondition()", "setEtext(", "StoreEndError()", "LogManager("]):
                flow.append(f"`{label}`: `{line[:240]}`.")
            if len(flow) >= 8:
                break
        if len(flow) >= 8:
            break

    if not flow:
        flow.append("Routine không có thêm câu lệnh nổi bật ngoài các nhánh xử lý đã liệt kê ở phần bước thực hiện.")

    return {
        "name": action_heading,
        "routine": path.name,
        "summary": top_description(lines),
        "steps": steps or ["Chưa tách được bước cụ thể hơn từ routine nguồn."],
        "flow": flow,
    }


def build_class_entry(seed_item: dict) -> dict:
    class_name = seed_item["name"]
    field_defs = parse_field_defs(class_name)
    fields = []

    for field in parse_insert_fields(class_name):
        tail = field_tail(field["name"])
        field_notes = build_dictionary_sentence(field["name"], field_defs.get(tail), field["slot"])
        field_notes.extend(field_usage_notes(class_name, field["name"]))
        fields.append(
            {
                "name": field["name"],
                "slot": field["slot"],
                "details": field_notes,
            }
        )

    actions = [
        build_action_entry(class_name, action["name"])
        for action in seed_item.get("actions", [])
    ]

    return {
        "name": class_name,
        "slug": slugify(class_name),
        "fields": fields,
        "actions": actions,
    }


def main() -> None:
    if not T24_ROOT.exists():
        if existing_payload_is_usable():
            print("Không có source T24 cục bộ. Giữ nguyên data/property-data.json đã commit.")
            return
        raise FileNotFoundError(
            f"Thiếu thư mục source: {T24_ROOT}. Không thể sinh lại dữ liệu."
        )

    seed_items = load_seed()
    items = [build_class_entry(item) for item in seed_items]
    payload = {
        "summary": {
            "propertyClassCount": len(items),
            "actionCount": sum(
                1
                for item in items
                for action in item["actions"]
                if not action["name"].startswith("NO DIRECT ACTION ")
            ),
            "totalActionEntries": sum(len(item["actions"]) for item in items),
        },
        "items": items,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
