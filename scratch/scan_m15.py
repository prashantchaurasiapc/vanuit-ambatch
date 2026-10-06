import os
import re

frontend_src = r'c:\Users\kiaan\OneDrive\Desktop\bhagyashree_kiaan\vanuit-ambatch\frontend\src'

mock_imports = []
localstorage_sets = []
safeset_uses = []
math_random_ids = []

for root, dirs, files in os.walk(frontend_src):
    for f in files:
        if f.endswith(('.js', '.jsx', '.ts', '.tsx')):
            filepath = os.path.join(root, f)
            rel_path = os.path.relpath(filepath, frontend_src).replace('\\', '/')
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as infile:
                lines = infile.readlines()
            for idx, line in enumerate(lines, 1):
                stripped = line.strip()
                # mockData imports
                if re.search(r'from\s+[\'\"].*mockData[\'\"]', line):
                    mock_imports.append((rel_path, idx, stripped))
                # safeSetItem usages
                if 'safeSetItem' in line and 'function safeSetItem' not in line and 'const safeSetItem' not in line:
                    safeset_uses.append((rel_path, idx, stripped))
                # localStorage.setItem usages
                if 'localStorage.setItem' in line:
                    localstorage_sets.append((rel_path, idx, stripped))
                # Math.random business ID generation
                if 'Math.random' in line and any(k in line for k in ['INV-', 'Q-', 'OF-', 'PRJ-', 'CUST-', 'LEAD-']):
                    math_random_ids.append((rel_path, idx, stripped))

print("=== MOCKDATA IMPORTS ===")
for r in mock_imports:
    print(f"  {r[0]}:{r[1]} -> {r[2]}")
print(f"Total mockData imports: {len(mock_imports)}\n")

print("=== SAFESETITEM USAGES ===")
for r in safeset_uses:
    print(f"  {r[0]}:{r[1]} -> {r[2]}")
print(f"Total safeSetItem usages: {len(safeset_uses)}\n")

print("=== LOCALSTORAGE.SETITEM USAGES ===")
for r in localstorage_sets:
    print(f"  {r[0]}:{r[1]} -> {r[2]}")
print(f"Total localStorage.setItem usages: {len(localstorage_sets)}\n")

print("=== MATH.RANDOM BUSINESS ID GENERATION ===")
for r in math_random_ids:
    print(f"  {r[0]}:{r[1]} -> {r[2]}")
print(f"Total Math.random business IDs: {len(math_random_ids)}\n")
