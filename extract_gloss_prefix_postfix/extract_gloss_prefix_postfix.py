import pandas as pd
import re
import os

def get_first_letter_folder(gloss):
    gloss = gloss.strip()
    if gloss.lower().startswith('ns-') and len(gloss) > 3:
        return gloss[3].upper()
    if gloss.lower().startswith('fs-') and len(gloss) > 3:
        return gloss[3].upper()
    return gloss[0].upper()

def safe_gloss_folder(gloss):
    # Replace / with _ and remove or replace all invalid Windows filename characters
    gloss = gloss.strip().replace('/', '_')
    # Remove or replace other invalid characters
    return re.sub(r'[\\\\/:*?"<>|]', '_', gloss)

# Load the CSV
df = pd.read_csv('dataset/sheet2.csv', dtype=str, keep_default_na=False)

prefixes = set()
postfixes = set()
unique_glosses = set()

for gloss in df['Main New Gloss']:
    gloss = str(gloss).strip()
    if not gloss or gloss in ['============', '------------']:
        continue
    unique_glosses.add(gloss)

    # Find prefix (before first -, /, or +)
    prefix_match = re.match(r'^([^-/+]+)[-/+]', gloss)
    if prefix_match:
        prefixes.add(prefix_match.group(1))

    # Find postfix (after last -, /, or +)
    postfix_match = re.search(r'[-/+]([^-/+]+)$', gloss)
    if postfix_match:
        postfixes.add(postfix_match.group(1))

output_path = os.path.join(os.path.dirname(__file__), 'prefix_postfix_output.txt')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('Unique prefixes found:\n')
    for p in sorted(prefixes):
        f.write(f'{p}\n')
    f.write('\nUnique postfixes found:\n')
    for p in sorted(postfixes):
        f.write(f'{p}\n')

# Demonstrate folder naming for each unique gloss
demo_output_path = os.path.join(os.path.dirname(__file__), 'gloss_folder_paths.txt')
with open(demo_output_path, 'w', encoding='utf-8') as f:
    f.write('Gloss to Folder Path Mapping (using new rules):\n')
    for gloss in sorted(unique_glosses):
        first_letter = get_first_letter_folder(gloss)
        folder_path = os.path.join(first_letter, safe_gloss_folder(gloss))
        f.write(f'{gloss} -> {folder_path}\n')

print(f'Results written to {output_path} and {demo_output_path}') 