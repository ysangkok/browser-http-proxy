import json, sys

for i in sys.stdin.readlines():
	print(json.dumps({"Done": False, "Data": i.strip() + "\r\n"}))
print(json.dumps({"Done": True, "Data": "\r\n"}))
