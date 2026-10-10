# HS Code Finder

A small, fully static web page that helps you find the Harmonized System (HS)
code for a commodity by typing its name. Search runs entirely in your
browser — there is no backend, no API keys, and no data is sent anywhere.

## Usage

Open `index.html` in a browser (or serve the folder with any static file
server) and start typing a product name, e.g. `frozen shrimp`, `cotton
t-shirts`, `laptop computers`. Matching 6-digit international HS codes are
shown with their description, heading, and section. Click **Copy** to copy a
code to the clipboard.

```bash
# run locally with any static server, e.g.:
python3 -m http.server 8000
# then open http://localhost:8000
```

## Data source

HS code data (`data/hs-codes.json`) is derived from the
[`datasets/harmonized-system`](https://github.com/datasets/harmonized-system)
open dataset (WCO Harmonized System, 2022 edition), licensed under
[ODC-PDDL-1.0](https://opendatacommons.org/licenses/pddl/) (public domain).
It covers the international 6-digit HS nomenclature. Country-specific tariff
schedules (e.g. US HTS, India ITC-HS) extend these 6-digit codes with
additional digits and are not included here.

**This tool is for quick reference only.** Always confirm the final HS code
with your customs broker or national customs authority before using it on
any shipping or customs document — misclassification can result in customs
delays, fines, or incorrect duty payments.

## Tech

- Plain HTML/CSS/JavaScript, no build step
- [Fuse.js](https://www.fusejs.io/) (vendored locally in `vendor/`, Apache-2.0) for client-side fuzzy search
- A strict Content-Security-Policy restricts all scripts/styles/connections to same-origin

## License

Code in this repository is licensed under the MIT License (see `LICENSE`).
The bundled HS code data retains its original ODC-PDDL-1.0 license as noted
above.
