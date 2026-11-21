# Arshad Siddiqui — Professional portfolio

[Live portfolio](https://arshad9999.github.io/arshad-professional/)

This static site presents public engineering projects, field-level research, experience, credentials and freelance services. The preview branch is `preview/portfolio-redesign`.

## Local preview

From the root of the cloned repository, run the following command and open [the preview](http://127.0.0.1:8421/arshad-professional/). The checkout directory should be named `arshad-professional`.

```sh
python3 -m http.server 8421 --bind 127.0.0.1 --directory ..
```

You can also open `index.html` directly. All site assets use relative paths. No build or API keys are required.

## Updating the site

- `index.html` contains the portfolio.
- `freelance.html` contains the service prices, booking terms and request links.
- `recommendations.html` contains the dated recommendations and original source links.
- `styles.css`, `site.js` and `art.js` control the layout, navigation, gallery and decorative artwork. Static images and the self-hosted font are in `assets/`.

Run `python3 -m unittest discover -s tests` to check local links, fragment targets and booking destinations.
