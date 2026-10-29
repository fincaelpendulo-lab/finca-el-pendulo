# Rebuilds the GHL workflow emails and uploads the ones that changed.
# Workflow email actions must have "Sync Edits to Template" on, so the live
# workflows pick up each upload without touching the GHL UI.
# Run: python3 worker/emails/sync.py          (check only: what changed, broken images or links)
#      python3 worker/emails/sync.py --push   (upload the changed templates)
# Config lives in ghl-templates.json:
#   { "_config": { "domain": "example.com", "mcp_server": "ghl", "user_id": "<GHL user id>" },
#     "01-request-info": { "id": "<template id>", "ghl_name": "Web 01 - Request info", "sha256": "", "subject": "" } }
# The token is read from that MCP server's entry in ~/.claude.json (user scope) or the
# project entry, and is never printed.
import hashlib, json, os, re, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
STATE = os.path.join(HERE, 'ghl-templates.json')
state = json.load(open(STATE))
cfg = state.pop('_config')

def ghl_headers():
    data = json.load(open(os.path.expanduser('~/.claude.json')))
    servers = dict(data.get('mcpServers', {}))  # user scope
    here = os.path.realpath(HERE)
    for path, proj in data.get('projects', {}).items():  # local/project scope wins
        if here.startswith(os.path.realpath(path)):
            servers.update(proj.get('mcpServers', {}))
    return servers[cfg['mcp_server']]['headers']

def ghl(method, path, body=None):
    h = ghl_headers()
    req = urllib.request.Request('https://services.leadconnectorhq.com' + path, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={'Authorization': h['Authorization'], 'Version': '2021-07-28', 'Content-Type': 'application/json',
                 'Accept': 'application/json', 'User-Agent': 'email-sync'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read() or b'{}')

def reachable(url):
    try:
        req = urllib.request.Request(url, method='HEAD', headers={'User-Agent': 'email-sync'})
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status < 400
    except Exception:
        return False

build = os.path.join(HERE, 'build.py')
if os.path.exists(build):
    subprocess.run([sys.executable, build], check=True, stdout=subprocess.DEVNULL)
subjects_file = os.path.join(HERE, 'subjects.json')
subjects = json.load(open(subjects_file)) if os.path.exists(subjects_file) else {}
push = '--push' in sys.argv
problems, changed = [], []
own = re.escape(cfg['domain'])

for name, t in state.items():
    html = open(os.path.join(HERE, name + '.html')).read()
    for url in sorted(set(re.findall(r'(?:src|href)="(https://' + own + r'[^"]*)"', html))):
        if not reachable(url):
            problems.append(f'{name}: {url} does not load')
    if t.get('subject') and name in subjects and t['subject'] != subjects[name]:
        problems.append(f'{name}: subject is now "{subjects[name]}". Change it by hand in the workflow email action (GHL keeps the subject there)')
    digest = hashlib.sha256(html.encode()).hexdigest()
    if digest != t.get('sha256'):
        changed.append((name, html, digest))

print('Changed:', ', '.join(n for n, _, _ in changed) or 'nothing')
for p in problems:
    print('PROBLEM:', p)
if push and changed:
    if any('does not load' in p for p in problems):
        sys.exit('Not pushed: fix the broken images or links first.')
    location = ghl_headers()['locationId']
    for name, html, digest in changed:
        ghl('POST', '/emails/builder/data', {'locationId': location, 'templateId': state[name]['id'], 'updatedBy': cfg['user_id'],
            'html': html, 'editorType': 'html', 'dnd': {'elements': [], 'attrs': {}, 'templateSettings': {}}})
        state[name]['sha256'] = digest
        if name in subjects:
            state[name]['subject'] = subjects[name]
        print('Pushed', name, '->', state[name].get('ghl_name', name))
    open(STATE, 'w').write(json.dumps({'_config': cfg, **state}, indent=1, ensure_ascii=False) + '\n')
elif changed and not push:
    print('Run with --push to upload.')
