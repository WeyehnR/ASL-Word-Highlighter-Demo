import os
import shutil
import json

base_dir = os.path.join('extension', 'asl_videos')
glossary_path = os.path.join('extension', 'glossary.json')

# 1. Move folders and files
hash_dir = os.path.join(base_dir, '#')
if os.path.exists(hash_dir):
    for folder in os.listdir(hash_dir):
        if folder.startswith('#'):
            sign_name = folder[1:]  # Remove leading '#'
            if not sign_name:
                continue
            # Determine the target letter (first character, uppercased)
            target_letter = sign_name[0].upper()
            target_letter_dir = os.path.join(base_dir, target_letter)
            # Create the target letter directory if it doesn't exist
            os.makedirs(target_letter_dir, exist_ok=True)
            # Source and destination
            src = os.path.join(hash_dir, folder)
            dst = os.path.join(target_letter_dir, sign_name)
            print(f"Moving {src} -> {dst}")
            # Move the folder
            shutil.move(src, dst)
    # Optionally, remove the now-empty hash_dir
    if not os.listdir(hash_dir):
        print(f"Removing empty directory: {hash_dir}")
        os.rmdir(hash_dir)
else:
    print(f"Hash directory does not exist: {hash_dir}")

# Move any sign folders directly under asl_videos/ to their correct letter folders
for folder in os.listdir(base_dir):
    folder_path = os.path.join(base_dir, folder)
    if os.path.isdir(folder_path) and len(folder) > 1 and folder.isupper():
        # This is a sign folder like DOG, BUS, etc. (not a single letter)
        target_letter = folder[0].upper()
        target_letter_dir = os.path.join(base_dir, target_letter)
        os.makedirs(target_letter_dir, exist_ok=True)
        dst = os.path.join(target_letter_dir, folder)
        # Avoid moving if already in the right place
        if os.path.abspath(folder_path) != os.path.abspath(dst):
            print(f"Moving {folder_path} -> {dst}")
            shutil.move(folder_path, dst)

# 2. Update glossary.json
with open(glossary_path, 'r', encoding='utf-8') as f:
    glossary = json.load(f)

if '#' in glossary:
    hash_entries = glossary['#']
    for entry in list(hash_entries.keys()):
        if entry.startswith('#'):
            new_entry = entry[1:]
            if not new_entry:
                continue
            target_letter = new_entry[0].upper()
            if target_letter not in glossary:
                glossary[target_letter] = {}
            print(f"Moving glossary entry {entry} -> {target_letter}/{new_entry}")
            glossary[target_letter][new_entry] = hash_entries[entry]
            del hash_entries[entry]
    # Remove '#' key if empty
    if not hash_entries:
        del glossary['#']

with open(glossary_path, 'w', encoding='utf-8') as f:
    json.dump(glossary, f, indent=2, ensure_ascii=False)

print("Done! All ns-#... folders and glossary entries have been moved/renamed.")

# Additional logic to move files from #ALL subdirectories
for letter in os.listdir(base_dir):
    letter_dir = os.path.join(base_dir, letter)
    if not os.path.isdir(letter_dir):
        continue
    for sign in os.listdir(letter_dir):
        sign_dir = os.path.join(letter_dir, sign)
        if not os.path.isdir(sign_dir):
            continue
        # Look for a subfolder with a # prefix (e.g., #ALL inside ALL)
        hash_subdir = os.path.join(sign_dir, f'#{sign}')
        if os.path.isdir(hash_subdir):
            # Move all files up one level
            for fname in os.listdir(hash_subdir):
                src = os.path.join(hash_subdir, fname)
                dst = os.path.join(sign_dir, fname)
                print(f"Moving {src} -> {dst}")
                shutil.move(src, dst)
            # Remove the now-empty #subdir
            print(f"Removing empty directory: {hash_subdir}")
            os.rmdir(hash_subdir)