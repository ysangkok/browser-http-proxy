import sys,json,base64

for i in sys.stdin.readlines():
	print(base64.b64decode(json.loads(i)["Data"]))
