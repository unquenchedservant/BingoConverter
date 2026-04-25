import json

with open("2026/2026-02-14.json", "r") as f:
    data = json.load(f)

terms = list(data["terms"].keys())
output = '["' + '", "'.join(terms) + '"]'

with open("terms.txt", "w") as f:
    f.write(output + "\n")
