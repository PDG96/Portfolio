#!/usr/bin/env python3
"""Compara os tokens e o segmented entre a landing e as paginas de case.

O modelo do site e' um so' — mesmo edge, mesmo measure, mesmo controle de
navegacao — mas ele vive em cinco arquivos separados sem build. Mudar a landing
e esquecer os cases nao quebra nada visivelmente: os cases so' ficam com um
tamanho antigo ou com uma aba que aponta pra uma view que nao existe mais.

Roda antes de commitar qualquer mudanca em token compartilhado.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
LANDING = ROOT / 'index.html'
CASES = sorted((ROOT / 'projects').glob('*.html'))
CASES = [c for c in CASES if c.name not in ('case-study-template.html',)]

SHARED = ['--edge', '--header-h', '--seg-h', '--nav-h', '--grid-gap',
          '--page-gutter', '--page-max', '--view-pad-top', '--seg-band']

def first(text, token):
    m = re.search(rf'{re.escape(token)}:\s*([^;]+);', text)
    return m.group(1).strip() if m else None

def tabs(text):
    out = re.findall(r'class="seg-btn[^"]*"[^>]*?(?:data-view="([^"]*)"|href="([^"]*)")', text)
    return [(a or b).replace('../index.html#', '').lstrip('#') for a, b in out]

land = LANDING.read_text()
problems = []

for case in CASES:
    text = case.read_text()
    for tok in SHARED:
        a, b = first(land, tok), first(text, tok)
        if a != b:
            problems.append(f'{case.name}: {tok} e {b!r}, na landing e {a!r}')
    if tabs(text) != tabs(land):
        problems.append(f'{case.name}: abas {tabs(text)} != landing {tabs(land)}')

views = set(re.findall(r'<section class="[^"]*view[^"]*" id="([^"]*)"', land))
for case in CASES:
    for t in tabs(case.read_text()):
        if t not in views:
            problems.append(f'{case.name}: aba "{t}" aponta pra uma view que nao existe')

if problems:
    print('DERIVA ENTRE LANDING E CASES:')
    for p in problems:
        print('  -', p)
    sys.exit(1)
print(f'ok — {len(CASES)} paginas de case em sincronia com a landing')
