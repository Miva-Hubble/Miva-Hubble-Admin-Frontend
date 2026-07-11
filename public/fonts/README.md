# Wapilor Font Assets

To use the custom **Wapilor** display font in this project, place the font files in this directory.

## Required Files

Place the following files in this folder:
- `Wapilor-Regular.woff2` (and/or `Wapilor-Regular.woff`)
- `Wapilor-Bold.woff2` (and/or `Wapilor-Bold.woff`)

The CSS configuration in `src/app/globals.css` is already set up to search for these file names.

## Fallback Behavior

If these files are not present in this folder, the application will automatically fall back to using **Inter** (loaded from Google Fonts), maintaining a high-quality visual hierarchy.
