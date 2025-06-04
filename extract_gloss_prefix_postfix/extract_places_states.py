import os
import json

asl_videos_dir = os.path.join('extension', 'asl_videos')
synonyms_path = os.path.join('extension', 'synonyms.json')

# Load existing synonyms
if os.path.exists(synonyms_path):
    with open(synonyms_path, 'r') as f:
        synonyms = json.load(f)
else:
    synonyms = {}

# Scan for place glosses
for root, dirs, files in os.walk(asl_videos_dir):
    for d in dirs:
        if d.startswith('ns-'):
            if d.startswith('ns-#'):
                key = d[4:].upper()
            else:
                key = d[3:].upper()
            # Add or update the synonym entry
            if key in synonyms:
                if d not in synonyms[key]:
                    synonyms[key].append(d)
            else:
                synonyms[key] = [d]

# Save the merged synonyms
with open(synonyms_path, 'w') as f:
    json.dump(synonyms, f, indent=4)

print(f"Merged place glosses into {synonyms_path}")