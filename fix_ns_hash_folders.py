import os
import shutil
import json

base_dir = os.path.join('extension', 'asl_videos')
glossary_path = os.path.join('extension', 'glossary.json')

# 1. Move folders and files
hash_dir = os.path.join(base_dir, '#')
if os.path.exists(hash_dir):
    for gloss in os.listdir(hash_dir):
        if gloss.startswith('ns-#'):
            new_gloss = gloss.replace('ns-#', 'ns-')
            # Extract the main letter (or use full name for subdir)
            main_part = new_gloss[3:].upper()
            main_letter = main_part[0]
            new_parent = os.path.join(base_dir, main_letter)
            os.makedirs(new_parent, exist_ok=True)
            src = os.path.join(hash_dir, gloss)
            dst = os.path.join(new_parent, new_gloss)
            print(f"Moving {src} -> {dst}")
            shutil.move(src, dst)
    # Optionally remove the now-empty '#' directory
    if not os.listdir(hash_dir):
        os.rmdir(hash_dir)

# 2. Update glossary.json
with open(glossary_path, 'r', encoding='utf-8') as f:
    glossary = json.load(f)

if '#' in glossary:
    to_delete = []
    for key in list(glossary['#'].keys()):
        if key.startswith('ns-#'):
            new_key = key.replace('ns-#', 'ns-')
            main_part = new_key[3:].upper()
            main_letter = main_part[0]
            if main_letter not in glossary:
                glossary[main_letter] = {}
            glossary[main_letter][new_key] = glossary['#'][key]
            print(f"Moved glossary entry {key} -> {main_letter}/{new_key}")
            to_delete.append(key)
    for key in to_delete:
        del glossary['#'][key]
    # Remove '#' section if empty
    if not glossary['#']:
        del glossary['#']

with open(glossary_path, 'w', encoding='utf-8') as f:
    json.dump(glossary, f, indent=2, ensure_ascii=False)

print("Done! All ns-#... folders and glossary entries have been moved/renamed.")