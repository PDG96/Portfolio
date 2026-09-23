"""Compose the dark TDI screens into one angled hero, like image 8.png.
Reads svg-export-dark/*.svg, drops each one's outer <svg>, and places the
content on a tilted plane (single affine: x axis up-right, y axis down-right).
Each card is placed by where its top-left corner should land on the canvas,
measured off the PNG; the script maps that back to plane coordinates. SVG has
no perspective, so this is the closest a vector file gets."""
import re, math, os
SRC = 'svg-export-dark'
W, H = 2000, 1500
S = 0.8
ax = (math.cos(math.radians(16)), -math.sin(math.radians(16)))   # plane x → up-right
ay = (math.sin(math.radians(21)),  math.cos(math.radians(21)))   # plane y → down-right
a, b, c, d = ax[0]*S, ax[1]*S, ay[0]*S, ay[1]*S
M = f"matrix({a:.4f},{b:.4f},{c:.4f},{d:.4f},0,0)"
det = a*d - b*c
def to_plane(sx, sy):  # inverse of M
    return ((d*sx - c*sy)/det, (-b*sx + a*sy)/det)

def inner(name):
    s = open(os.path.join(SRC, name)).read()
    s = re.sub(r'^<svg[^>]*>', '', s.strip()); s = re.sub(r'</svg>\s*$', '', s)
    s = re.sub(r'<rect id="bg" x="0" y="0" width="\d+" height="\d+" fill="#121215"></rect>', '', s, count=1)
    return s

def card(name, sx, sy, shadow=True, body=None):
    x, y = to_plane(sx, sy)
    fx = ' filter="url(#shadow)"' if shadow else ''
    return f'<g id="screen/{name[:-4]}" transform="translate({x:.1f},{y:.1f})"{fx}>{body or inner(name)}</g>'

page_flow = inner('TDI-dark-page-flow.svg').replace('>Flow Map Overview<', '>Supply Chain Overview<')

# the flow page is anchored by its own sidenav: "Suppliers" (page 114,141) lands where the PNG has it
px, py = to_plane(920, 860); px -= 114; py -= 141
page = f'<g id="screen/TDI-dark-page-flow" transform="translate({px:.1f},{py:.1f})" filter="url(#shadow)">{page_flow}</g>'
# band: a stripe in plane space, the page's rail sits on its right edge
parts = [f'<rect id="band" x="{px-330:.0f}" y="-2500" width="400" height="6000" fill="url(#band)"/>', page]
parts += [
  card('TDI-dark-detail-card.svg', 1150, -180),
  card('TDI-dark-participants-table.svg', 1170, 90),
  card('TDI-dark-flow-overview-short.svg', 400, 215),
  card('TDI-dark-flow-overview-short.svg', 480, 1440),
  card('TDI-dark-detail-card.svg', -420, 130),
  card('TDI-dark-participants-table.svg', -380, 470),
  card('TDI-dark-legend.svg', 10, 120, shadow=False),
  card('TDI-dark-legend.svg', 255, 1395, shadow=False),
]
plane = f'<g id="plane" transform="{M}">{chr(10).join(parts)}</g>'
# globe stays round (as in the PNG), scaled down, bottom-left
gs = 0.56
globe = f'<g id="screen/TDI-dark-globe" transform="translate({300-360*gs:.0f},{1240-360*gs:.0f}) scale({gs})">{inner("TDI-dark-globe.svg")}</g>'

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" fill="none">
<defs>
  <linearGradient id="band" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2E1065"/><stop offset=".55" stop-color="#6D28D9"/><stop offset="1" stop-color="#3B0A8A"/></linearGradient>
  <radialGradient id="vignette" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#1B1B22"/><stop offset="1" stop-color="#0E0E11"/></radialGradient>
  <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity=".55"/></filter>
  <clipPath id="canvas"><rect width="{W}" height="{H}"/></clipPath>
</defs>
<rect id="bg" width="{W}" height="{H}" fill="url(#vignette)"/>
<g clip-path="url(#canvas)">
{plane}
{globe}
</g>
</svg>'''
open(os.path.join(SRC, 'TDI-dark-composition.svg'), 'w').write(svg)
print('written', len(svg))
