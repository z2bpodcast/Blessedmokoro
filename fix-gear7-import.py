import re

path = "app/api/gear/[gear]/route.ts"
with open(path) as f:
    c = f.read()

if "import { runGear7" in c:
    print("Already imported — checking if it compiled correctly")
    print(c[c.find("import { runGear7"):c.find("import { runGear7")+80])
else:
    c = c.replace(
        "import { runGear6,",
        "import { runGear7, PLATFORMS } from '@/lib/v3/gear7-engine'\nimport { runGear6,"
    )
    with open(path, 'w', newline='\n') as f:
        f.write(c)
    print("Fixed: runGear7 import added")
    print(c[c.find("import { runGear7"):c.find("import { runGear7")+80])
