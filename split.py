import json
import os
from datetime import datetime

with open("file.json", "r") as f:
    data = json.load(f)

for entry in data:
    date = datetime.strptime(entry["date"], "%m/%d/%Y")
    year = str(date.year)
    filename = date.strftime("%Y-%m-%d") + ".json"
    out_path = os.path.join(year, filename)

    os.makedirs(year, exist_ok=True)

    if not os.path.exists(out_path):
        with open(out_path, "w") as f:
            json.dump(entry, f, indent=2)
        print(f"Wrote {out_path}")
    else:
        print(f"{out_path} exists. Skipping")

print(f"Split {len(data)} entries into year folders.")
