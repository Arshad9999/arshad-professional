"""Offline checks for Pages subdirectory links and the three existing public forms."""
from html.parser import HTMLParser
from pathlib import Path
import unittest
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, file):
        super().__init__()
        self.ids = []
        self.urls = []
        self.feed(file.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        if "id" in attr:
            self.ids.append(attr["id"])
        self.urls.extend(attr[key] for key in ("href", "src") if key in attr)


class Portfolio(unittest.TestCase):
    def test_local_destinations(self):
        pages = {p.name: Page(p) for p in ROOT.glob("*.html")}
        for name, page in pages.items():
            self.assertEqual(len(page.ids), len(set(page.ids)), name)
            for url in page.urls:
                with self.subTest(page=name, url=url):
                    target = urlsplit(url)
                    if target.scheme or target.netloc:
                        continue
                    self.assertFalse(target.path.startswith("/"))
                    file = target.path or name
                    self.assertTrue((ROOT / file).is_file())
                    if target.fragment:
                        self.assertIn(target.fragment, pages[file].ids)

    def test_original_booking_destinations(self):
        prefix = "https://docs.google.com/forms/d/e/"
        suffix = "/viewform?usp=publish-editor"
        freelance = Page(ROOT / "freelance.html").urls
        for identifier in (
            "1FAIpQLSe_DiUpCImEnojYiLGtkWuIds8uEaWgAtvQnEulRSrrN52GyA",
            "1FAIpQLSfhErw7_Btnx0k1fu-Rmc5-YOOyW2PBNOAW4xqXbjTUKC-3Kw",
        ):
            self.assertIn(prefix + identifier + suffix, freelance)
        self.assertIn("upi://pay?pa=7905613841%40kotakbank&pn=Arshad%20Siddiqui"
                      "&am=10.00&cu=INR&tn=Portfolio%20request", freelance)
        feedback = prefix + "1FAIpQLSdee4cFiQqP_PG-kN9KWzv3sLzrkK9yNofzLFvuTc5yZTrLYQ" + suffix
        for name in ("index.html", "recommendations.html"):
            self.assertIn(feedback, Page(ROOT / name).urls)


if __name__ == "__main__":
    unittest.main()
