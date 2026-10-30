#!/usr/bin/env python3
# =====================================================================
# EN: The city maps of Kilise Bul (kiliseler.html): clicking a city on the
#     map of Turkey zooms into a drawn map of that city, with its churches
#     where they stand and the well-known places around them. This script
#     draws those maps from OpenStreetMap data (the OpenMapTiles vector
#     tiles served by OpenFreeMap) and writes one file per area to
#     assets/sehir/<area>.json: the sea, parks and roads as SVG paths, and
#     the landmark names. The churches themselves come from data/kiliseler.js
#     ("lat"/"lon") when the page is built, so a church can be moved there
#     without running this again.
#     Run it after adding a city or a church far from the others:
#         pip install mapbox-vector-tile
#         python3 tools/kilise-sehir-haritalari.py
#     Map data (c) OpenStreetMap contributors, ODbL; tiles: OpenFreeMap.
# TR: Kilise Bul'un sehir haritalari. Kilise eklendikten sonra calistirin.
# =====================================================================
import gzip, json, math, os, re, sys, urllib.request
import concurrent.futures as cf
import mapbox_vector_tile as mvt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.environ.get('KD_TILE_CACHE', os.path.join(os.path.expanduser('~'), '.cache', 'kd-tiles'))
OUT = os.path.join(ROOT, 'assets', 'sehir')
UA = {'User-Agent': 'katolikdunyasi.com city maps (build tool)'}
NEAR = 800                  # metres round a church drawn street by street
Z = 16                      # the maps' units: Web Mercator pixels at zoom 16 (about 2 m in Turkey)
ASPECT = 594 / 1000         # the map frame on the page

# The areas: a city, or a church's own "map" (data/kiliseler.js) when it stands far from the rest
# (Selçuk for İzmir, Antakya and İskenderun for Hatay). "pad" is the margin round the churches in metres.
AREAS = {'istanbul': 900, 'izmir': 900, 'selcuk': 1100, 'ankara': 1200, 'mardin': 1000, 'diyarbakir': 1100}
PAD = 1300

# The places named round the churches, so a visitor knows where they are (see that file)
PLACES = json.load(open(os.path.join(ROOT, 'tools', 'kilise-sehir-yerleri.json'), encoding='utf-8'))


def read_js(path):
    s = open(path, encoding='utf-8').read()
    return json.loads(s.split('/*JSON-START*/')[1].split('/*JSON-END*/')[0])


# ---------- tiles
_tj = None
def tile_url():
    global _tj
    if not _tj:
        _tj = json.load(urllib.request.urlopen(urllib.request.Request('https://tiles.openfreemap.org/planet', headers=UA), timeout=30))['tiles'][0]
    return _tj

def fetch(z, x, y):
    p = os.path.join(CACHE, f'{z}-{x}-{y}.pbf')
    if not os.path.exists(p):
        b = urllib.request.urlopen(urllib.request.Request(tile_url().format(z=z, x=x, y=y), headers=UA), timeout=60).read()
        os.makedirs(CACHE, exist_ok=True)
        open(p, 'wb').write(b)
    b = open(p, 'rb').read()
    return gzip.decompress(b) if b[:2] == b'\x1f\x8b' else b

def merc(lat, lon, z=Z):
    n = 256 * 2 ** z
    return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n

def tiles_for(box, z):
    """box in z16 pixels (x0, y0, x1, y1) -> the tiles of zoom z that cover it"""
    k = 256 * 2 ** (Z - z)
    return [(z, x, y) for x in range(int(box[0] // k), int(box[2] // k) + 1) for y in range(int(box[1] // k), int(box[3] // k) + 1)]


# ---------- geometry
def dp(pts, tol):
    """Douglas-Peucker"""
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = pts[a]; bx, by = pts[b]; dx, dy = bx - ax, by - ay; L = math.hypot(dx, dy)
        best, bi = -1, -1
        for i in range(a + 1, b):
            # a closed ring starts and ends on the same point: the distance from that point
            d = abs(dy * (pts[i][0] - ax) - dx * (pts[i][1] - ay)) / L if L > 1e-6 else math.hypot(pts[i][0] - ax, pts[i][1] - ay)
            if d > best: best, bi = d, i
        if best > tol:
            keep[bi] = True; stack += [(a, bi), (bi, b)]
    return [p for p, k in zip(pts, keep) if k]

def path(rings, closed):
    out = []
    for r in rings:
        if len(r) < 2: continue
        x0, y0 = r[0]; seg = [f'M{x0} {y0}']; px, py = x0, y0; rel = []
        for x, y in r[1:]:
            if x == px and y == py: continue
            rel.append(f'{x - px} {y - py}'); px, py = x, y
        if not rel: continue
        seg.append('l' + ' '.join(rel).replace(' -', '-'))
        if closed: seg.append('z')
        out.append(''.join(seg))
    return ''.join(out)


class Area:
    def __init__(self, cfg, churches):
        self.cfg = cfg; self.churches = churches
        xs, ys = zip(*[merc(c['lat'], c['lon']) for c in churches])
        lat = sum(c['lat'] for c in churches) / len(churches)
        m = 1 / (156543.03 / 2 ** Z * math.cos(math.radians(lat)))          # z16 px per metre
        pad = cfg['pad'] * m
        x0, x1, y0, y1 = min(xs) - pad, max(xs) + pad, min(ys) - pad, max(ys) + pad
        # the frame's shape, then a margin all round so panning never shows the edge at once
        w, h = x1 - x0, y1 - y0
        if h < w * ASPECT: c = (y0 + y1) / 2; h = w * ASPECT; y0, y1 = c - h / 2, c + h / 2
        else: c = (x0 + x1) / 2; w = h / ASPECT; x0, x1 = c - w / 2, c + w / 2
        self.view = (x0, y0, w, h)
        f = .45 if w < 12000 else .15           # a metropolis gets less margin: its roads alone weigh a lot
        mx, my = w * f, h * f
        self.box = (x0 - mx, y0 - my, x1 + mx, y1 + my)
        self.o = (math.floor(self.box[0]), math.floor(self.box[1]))
        # the zoom of the tiles: as close as a few dozen tiles allow (12 at the least); the small
        # streets within NEAR metres of a church come from zoom 14 when the whole is drawn coarser
        self.zb = next((z for z, n in ((14, 40), (13, 70)) if len(tiles_for(self.box, z)) <= n), 12)
        self.m = m
        self.cover = []
        self.pins = [tuple(v - o for v, o in zip(merc(c['lat'], c['lon']), self.o)) for c in churches]

    def local(self, z, tx, ty, ext, p):
        k = 2 ** (Z - z) * 256 / ext
        return (round(tx * 256 * 2 ** (Z - z) + p[0] * k - self.o[0]), round(ty * 256 * 2 ** (Z - z) + p[1] * k - self.o[1]))

    def collect(self):
        L = {k: [] for k in ('water', 'dwater', 'river', 'green', 'r1', 'r2', 'r3', 'r4', 'rail', 'ferry', 'bld')}
        jobs = [(t, False) for t in tiles_for(self.box, self.zb)]
        if self.zb < 14:
            near = set()
            for c in self.churches:
                x, y = merc(c['lat'], c['lon'])
                r = NEAR * self.m
                near |= set(tiles_for((x - r, y - r, x + r, y + r), 14))
            jobs += [(t, True) for t in sorted(near)]
            # where the zoom 14 tiles cover the map, their roads replace the coarser ones
            k = 256 * 2 ** (Z - 14)
            self.cover = [(x * k - self.o[0], y * k - self.o[1], (x + 1) * k - self.o[0], (y + 1) * k - self.o[1]) for _, x, y in near]
        with cf.ThreadPoolExecutor(6) as ex:
            list(ex.map(lambda j: fetch(*j[0]), jobs))
        for (z, tx, ty), det in jobs:
            d = mvt.decode(fetch(z, tx, ty), default_options={'y_coord_down': True})
            tol = 1.2 if (det or self.zb == 14) else 2 ** (Z - self.zb) * .9
            self.layer(d, z, tx, ty, det, tol, L)
        return L

    def layer(self, d, z, tx, ty, det, tol, L):
        def geo(f, ext):
            g = f['geometry']; t = g['type']; c = g['coordinates']
            if t == 'Polygon': c = [c]; t = 'MultiPolygon'
            if t == 'LineString': c = [c]; t = 'MultiLineString'
            if t == 'MultiPolygon':
                return 'poly', [dp([self.local(z, tx, ty, ext, p) for p in ring], tol) for poly in c for ring in poly]
            if t == 'MultiLineString':
                return 'line', [dp([self.local(z, tx, ty, ext, p) for p in ln], tol) for ln in c]
            return None, []
        # how far from a church each kind of road is drawn (a metropolis keeps its motorways and the
        # sea everywhere, and the rest round the churches)
        big = self.view[2] >= 12000
        reach = {'r4': NEAR, 'r3': 1500 if big else None, 'r2': 3500 if big else None, 'bld': 300 if big else 400, 'green': 2500 if big else None}
        # shapes smaller than this (z16 pixels across) are left out
        least = {'bld': 5, 'green': 14 if big else 8, 'water': 10, 'dwater': 4}
        def near(rings, metres):
            r2 = (metres * self.m) ** 2
            return [r for r in rings if any(min((x - px) ** 2 + (y - py) ** 2 for px, py in self.pins) < r2 for x, y in r[::4] + r[-1:])]
        def put(key, f, ext, want):
            kind, rings = geo(f, ext)
            if reach.get(key): rings = near(rings, reach[key])
            if not det and self.cover and key in ('r1', 'r2', 'r3'):
                inside = lambda x, y: any(c[0] <= x < c[2] and c[1] <= y < c[3] for c in self.cover)
                rings = [r for r in rings if not all(inside(x, y) for x, y in r[::3] + r[-1:])]
            if key in least:
                rings = [r for r in rings if max(x for x, _ in r) - min(x for x, _ in r) + max(y for _, y in r) - min(y for _, y in r) >= least[key]]
            if kind == want: L[key].append(path(rings, kind == 'poly'))
        # the detail tiles add the roads and buildings round the churches; the sea and parks come from the coarse ones
        for name, v in d.items():
            ext = v.get('extent', 4096)
            for f in v['features']:
                p = f['properties']; cl = p.get('class'); sub = p.get('subclass')
                if name == 'water' and cl != 'swimming_pool': put('dwater' if det else 'water', f, ext, 'poly')
                elif name == 'waterway' and not det and cl in ('river', 'canal'): put('river', f, ext, 'line')
                elif name in ('park',) and not det: put('green', f, ext, 'poly')
                elif name == 'landcover' and not det and cl in ('wood', 'grass', 'forest'): put('green', f, ext, 'poly')
                elif name == 'landuse' and not det and cl in ('cemetery', 'stadium', 'pitch'): put('green', f, ext, 'poly')
                elif name == 'building' and (det or self.zb == 14): put('bld', f, ext, 'poly')
                elif name == 'transportation':
                    if p.get('brunnel') == 'tunnel': continue
                    if cl in ('motorway', 'trunk'): key = 'r1'
                    elif cl in ('primary', 'secondary'): key = 'r2'
                    elif cl == 'tertiary' or (cl == 'path' and sub == 'pedestrian'): key = 'r3'
                    elif cl == 'minor': key = 'r4'
                    elif cl in ('rail', 'transit') and p.get('brunnel') != 'tunnel': key = 'rail'
                    elif cl == 'ferry': key = 'ferry'
                    else: continue
                    if det and key in ('rail', 'ferry'): continue
                    put(key, f, ext, 'line')

    def places(self, wanted):
        """the landmark names, at their positions in the area's units"""
        out = []
        for tr, en, kind, rank, lat, lon in wanted:
            x, y = merc(lat, lon)
            out.append({'t': tr, 'e': en, 'k': kind, 'r': rank, 'x': round(x - self.o[0]), 'y': round(y - self.o[1])})
        return out


def main():
    data = read_js(os.path.join(ROOT, 'data', 'kiliseler.js'))
    os.makedirs(OUT, exist_ok=True)
    only = sys.argv[1:]
    areas = {}
    for city in data['cities']:
        for c in city['churches']:
            areas.setdefault(c.get('map') or city['id'], []).append(c)
    for aid, chs in areas.items():
        if only and aid not in only: continue
        cfg = {'id': aid, 'pad': AREAS.get(aid, PAD)}
        a = Area(cfg, chs)
        L = a.collect()
        v = a.view
        res = {
            'id': cfg['id'], 'o': list(a.o), 'z': Z,
            'w': round(a.box[2] - a.box[0]), 'h': round(a.box[3] - a.box[1]),
            'view': [round(v[0] - a.o[0]), round(v[1] - a.o[1]), round(v[2]), round(v[3])],
            'm': round(a.m, 4),
            'layers': {k: ''.join(sorted(set(p for p in L[k] if p))) for k in L},
            'places': a.places(PLACES.get(cfg['id'], [])),
            # where the zoom 14 tiles cover the map (their sea replaces the coarser one there)
            'cover': [[round(v) for v in c] for c in a.cover],
        }
        p = os.path.join(OUT, cfg['id'] + '.json')
        json.dump(res, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        print(f'{cfg["id"]}: zoom {a.zb}, {os.path.getsize(p) // 1024} KB', file=sys.stderr)


if __name__ == '__main__':
    main()
