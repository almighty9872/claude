"""Draws the 1200x630 share card of every church page (assets/og/<id>.jpg), in the look of
assets/og-image.jpg: church name, city and rite. Run from the repo root after the church data
changes (python3 tools/og-cards.py); the JPEGs are committed, the build only points to them."""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

SERIF_B = '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'
SERIF_I = '/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf'
SANS_B = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
src = open('data/kiliseler.js', encoding='utf-8').read()
data = json.loads(src[src.index('/*JSON-START*/') + 14:src.index('/*JSON-END*/')])
rites = {r['id']: r['tr'] for r in data['rites']}
cross = Image.open('assets/og-image.jpg').convert('RGB').crop((528, 102, 672, 248))
GOLD, CREAM, MUTE = (214, 178, 108), (240, 230, 210), (150, 158, 185)

def fit(draw, text, font_path, size, width):
    while size > 28:
        f = ImageFont.truetype(font_path, size)
        if draw.textlength(text, font=f) <= width: return f
        size -= 2
    return ImageFont.truetype(font_path, size)

def wrap(draw, text, font_path, size, width):
    words, lines, cur = text.split(), [], ''
    f = ImageFont.truetype(font_path, size)
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=f) <= width: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur)
    return lines, f

os.makedirs('assets/og', exist_ok=True)
for city in data['cities']:
    cname = city['name'].split(' (')[0]
    for ch in city['churches']:
        name = ch['name'].replace('’', "'")
        im = Image.new('RGB', (1200, 630))
        px = ImageDraw.Draw(im)
        for y in range(630):
            t = y / 629
            px.line([(0, y), (1200, y)], fill=(int(22 - 8 * t), int(33 - 12 * t), int(58 - 18 * t)))
        px.rectangle([30, 30, 1169, 599], outline=(138, 116, 72), width=1)
        im.paste(cross.resize((96, 96)), (552, 70))
        d = ImageDraw.Draw(im)
        size = 64
        while True:
            lines, f = wrap(d, name, SERIF_B, size, 960)
            if len(lines) <= 2 or size <= 40: break
            size -= 4
        lh = int(size * 1.2)
        y = 215 + (2 - len(lines)) * lh // 2
        for ln in lines:
            d.text((600, y), ln, font=f, fill=CREAM, anchor='ma'); y += lh
        sub = ImageFont.truetype(SERIF_I, 38)
        d.text((600, 215 + 2 * lh + 18), f"{ch['district']}, {cname}", font=sub, fill=MUTE, anchor='ma')
        d.line([(520, 466), (680, 466)], fill=(138, 116, 72), width=1)
        lab = ImageFont.truetype(SANS_B, 26)
        d.text((600, 492), f"{rites[ch['rite']].upper()}  ·  AYİN SAATLERİ  ·  ADRES  ·  TARİHÇE", font=lab, fill=GOLD, anchor='ma')
        d.text((600, 548), 'katolikdunyasi.com', font=ImageFont.truetype(SANS_B, 22), fill=MUTE, anchor='ma')
        im.save(f"assets/og/{ch['id']}.jpg", quality=84, optimize=True, progressive=True)
print('cards:', len(os.listdir('assets/og')))
