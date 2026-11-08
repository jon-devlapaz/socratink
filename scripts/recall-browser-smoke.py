import json
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'runs/recall-widget-slice/03-build/output'
SOURCE = '**Submission identifier**: A stable identifier used to recheck admitted work.\n\n**Rechecking**: Reading the existing submission rather than sending the work again.'


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

    def do_GET(self):
        path = urlparse(self.path).path
        if not path.startswith('/api/'):
            return super().do_GET()
        if path == '/api/session':
            body = {'userId': 'recall-preview', 'aliases': [], 'kind': 'guest'}
        elif path == '/api/auth/providers':
            body = {'google': False, 'github': False}
        elif path == '/api/chat-route':
            body = {'kind': 'operator', 'openai': False, 'openrouter': False}
        elif path.startswith('/api/agents/chat/') and urlparse(self.path).query == 'view=history':
            body = {'messages': [{'role': 'assistant', 'display': 'visible', 'parts': [{'type': 'text', 'text': SOURCE}]}], 'settlements': []}
        else:
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())


def verify(page, origin, label):
    errors = []
    requests = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('request', lambda request: requests.append((request.method, request.url)))
    page.goto(origin)
    page.get_by_role('button', name='Recall terms', exact=True).wait_for()
    page.wait_for_function("document.querySelector('.living-ink-poster') !== null")
    page.wait_for_timeout(700)
    before = page.locator('.alive-cluster').bounding_box()
    expression = page.locator('.alive-core').get_attribute('data-ink-expression')
    storage = page.evaluate('JSON.stringify(localStorage)')
    page.get_by_role('button', name='Recall terms', exact=True).focus()
    page.keyboard.press('Enter')
    attempt = page.locator('.recall-attempt')
    assert attempt.evaluate('(node) => node === document.activeElement')
    assert page.locator('.recall-reference').count() == 0
    attempt.fill('The identity of work already sent')
    baseline_requests = list(requests)
    for state in ['term', 'reveal', 'next']:
        if state == 'reveal':
            page.get_by_role('button', name='Reveal reference', exact=True).focus()
            page.keyboard.press('Enter')
            assert page.locator('.recall-reference').inner_text() == 'A stable identifier used to recheck admitted work.'
            assert attempt.input_value() == 'The identity of work already sent'
            assert attempt.evaluate('(node) => node.readOnly')
        elif state == 'next':
            page.keyboard.press('Enter')
            assert page.locator('.recall-term').inner_text() == 'Rechecking'
            assert attempt.input_value() == ''
            assert page.locator('.recall-reference').count() == 0
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        ink = page.locator('.alive-cluster').bounding_box()
        recall = page.locator('.recall-session').bounding_box()
        assert abs(ink['width'] - before['width']) < 1
        assert recall['y'] >= ink['y'] + ink['height'], 'Recall overlaps ink space'
        assert page.locator('.alive-core').get_attribute('data-ink-expression') == expression
        assert page.locator('.questionnaire').count() == 0
        assert page.locator('.active-node').evaluate('(node) => getComputedStyle(node).boxShadow') == 'none'
        if label == 'phone':
            page.screenshot(path=str(OUT / f'recall-phone-{state}.png'))
    page.get_by_role('button', name='Reveal reference', exact=True).click()
    page.get_by_role('button', name='Finish recall', exact=True).click()
    assert requests == baseline_requests, 'Recall made a network request'
    assert page.evaluate('JSON.stringify(localStorage)') == storage
    assert errors == [], errors
    print(f'{label}: keyboard recall/reveal/next/finish, private attempt, no network/storage change, ink clearance passed')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(ROOT / 'dist/client')))
    thread = threading.Thread(target=server.serve_forever)
    thread.start()
    origin = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless=True, args=['--use-gl=angle', '--use-angle=metal'])
            try:
                for label, viewport, reduced, fallback in [
                    ('desktop', {'width': 1280, 'height': 900}, 'no-preference', False),
                    ('phone', {'width': 390, 'height': 844}, 'no-preference', False),
                    ('reduced-fallback', {'width': 390, 'height': 844}, 'reduce', True),
                ]:
                    context = browser.new_context(viewport=viewport, reduced_motion=reduced)
                    try:
                        context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(origin + '/') else route.abort())
                        if fallback:
                            context.add_init_script("HTMLCanvasElement.prototype.getContext = () => null")
                        page = context.new_page()
                        verify(page, origin, label)
                        if fallback:
                            assert page.locator('.living-ink-poster').is_visible()
                        else:
                            assert page.locator('[data-ink-ready=true]').count() == 1
                    finally:
                        context.close()
            finally:
                browser.close()
    finally:
        server.shutdown()
        server.server_close()
        thread.join()


if __name__ == '__main__':
    main()
