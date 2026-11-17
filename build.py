# يبني index.html من index.src.html: الـ CSS جوه الصفحة. الخطوط ملفات محلية يتخزّنها الـ service worker (مش data URI) عشان سفاري على الآيفون، والـ PDF يشتغل أوفلاين بعد أول فتح.
import pathlib
d=pathlib.Path(__file__).parent
css=(d/'style.css').read_text()
html=(d/'index.src.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
assert '<style>' in html
assert 'data:font' not in html
(d/'index.html').write_text(html)
print('index.html',len(html))
