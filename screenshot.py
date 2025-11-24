from playwright.sync_api import sync_playwright
import os
import sys

port = sys.argv[1] if len(sys.argv) > 1 else '3000'
url = f'http://localhost:{port}/'

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(url)
    page.screenshot(path='screenshot.png')
    browser.close()