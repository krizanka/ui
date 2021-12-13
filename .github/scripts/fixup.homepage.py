import json
import os

with open("package.json") as f:
  package = json.load(f)

package["homepage"] += os.environ["GITHUB_SHA"] + "/"

with open("package.json", "w") as f:
  json.dump(package, f, indent=2)
