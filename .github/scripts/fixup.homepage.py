import json
import os

with open("package.json") as f:
  package = json.load(f)

destination = "/".join(p for p in os.environ["GITHUB_REF_NAME"].split('/') if p not in ('merge', 'ref'))
if not destination.endswith("/"):
  destination += "/"

package["homepage"] += destination

with open("package.json", "w") as f:
  json.dump(package, f, indent=2)

print(destination)
