"""Build and verify a runtime-only Chrome Web Store ZIP and a submission kit."""
import hashlib
import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parent.parent
manifest = json.loads((ROOT / 'manifest.json').read_text())
version = manifest['version']
runtime = ['manifest.json', '128.png', 'background.js', 'content.js',
           'sidepanel.html', 'sidepanel.css', 'sidepanel.js',
           'lib/core.js', 'lib/store.js', 'lib/i18n.js', 'icons/icon.svg',
           'prompts/categories.json', 'prompts/zh.json', 'prompts/en.json',
           'LICENSE', 'THIRD_PARTY_NOTICES.md']
dist = ROOT / 'dist'
dist.mkdir(exist_ok=True)
package = dist / f'chatgpt-edu-tw-{version}.zip'
def add(z, file, name):
    info = zipfile.ZipInfo(name, (2026, 10, 22, 0, 0, 0))
    info.compress_type = zipfile.ZIP_DEFLATED
    info.external_attr = 0o100644 << 16
    z.writestr(info, file.read_bytes())
with zipfile.ZipFile(package, 'w') as z:
    for name in runtime:
        add(z, ROOT / name, name)
with zipfile.ZipFile(package) as z:
    assert set(z.namelist()) == set(runtime)
    assert z.testzip() is None
    assert json.loads(z.read('manifest.json')) == manifest
    for lang in ['zh', 'en']:
        assert len(json.loads(z.read(f'prompts/{lang}.json'))) == 196
    for ref in [manifest['side_panel']['default_path'], manifest['background']['service_worker'], *manifest['icons'].values()]:
        assert ref in z.namelist()
kit = dist / f'chatgpt-edu-tw-{version}-submission-kit.zip'
documents = ['README.md', 'docs/chrome-web-store.md', 'docs/store-listing-zh.md',
             'docs/store-listing-en.md', 'docs/privacy.md', 'docs/final-review.md',
             'docs/prompt-quality.json', 'docs/feature-specs.md', 'docs/release-checks.json']
with zipfile.ZipFile(kit, 'w') as z:
    add(z, package, package.name)
    for name in documents:
        add(z, ROOT / name, name)
    for file in sorted((ROOT / 'docs/store-assets').glob('*.png')):
        add(z, file, 'store-assets/' + file.name)
    add(z, ROOT / '128.png', 'store-assets/icon-128.png')
with zipfile.ZipFile(kit) as z:
    assert z.testzip() is None
checksums = {file.name: hashlib.sha256(file.read_bytes()).hexdigest() for file in [package, kit]}
(dist / 'SHA256SUMS.txt').write_text(''.join(f'{digest}  {name}\n' for name, digest in checksums.items()))
print(json.dumps({'version':version, 'runtimeFiles':len(runtime), 'artifacts':checksums}, indent=2))
