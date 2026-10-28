import json
from pathlib import Path

path = Path('data/vocabulary.json')
data = json.loads(path.read_text(encoding='utf-8'))
original = next(item for item in data['lists'] if item['id'] == 'mr-trumble-weeks-1-2')
week_one = {
    'id': 'mr-trumble-week-1',
    'name': 'Mr.Trumble week 1',
    'description': '12 vocabulary words from week 1',
    'words': original['words'][:12],
}
week_two = {
    'id': 'mr-trumble-week-2',
    'name': 'Mr.Trumble week 2',
    'description': '12 vocabulary words from week 2',
    'words': original['words'][12:],
}
replacement = []
for item in data['lists']:
    if item['id'] == 'mr-trumble-weeks-1-2':
        replacement.extend([week_one, week_two])
    else:
        replacement.append(item)
data['lists'] = replacement
path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
