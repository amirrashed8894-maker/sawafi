# يبني index.html (القرار) و safi.html (الصوافي) و costs.html (التكاليف): الـ CSS جوه كل صفحة. الخطوط ملفات محلية يتخزّنها الـ service worker (مش data URI) عشان سفاري على الآيفون، والـ PDF يشتغل أوفلاين بعد أول فتح.
import pathlib,re
d=pathlib.Path(__file__).parent
def build(src,out,css):
    c=(d/css).read_text()
    if css=='costs.css':
        c=re.sub(r"url\(data:font[^)]*\)","url(fonts/cairo-arabic.woff2)",c)
    html=(d/src).read_text().replace('<link rel="stylesheet" href="%s">'%css,'<style>'+c+'</style>')
    assert '<style>' in html and 'data:font' not in html,out
    (d/out).write_text(html);print(out,len(html))
build('index.src.html','index.html','style.css')
build('safi.src.html','safi.html','style.css')
build('costs.src.html','costs.html','costs.css')
