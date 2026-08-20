# RenderMarkdown

A browser-based Markdown editor with live WYSIWYG rendering. Paste or import Markdown, see it as a clean formatted document immediately, edit directly in the rendered view, and style it with presets or your own CSS — all client-side, no backend.

## Features

- **Import or paste Markdown** — load a `.md`/`.markdown`/`.txt` file, or paste raw Markdown text and watch it parse into rich formatting
- **Live rendered editing** — edit directly in the formatted document (bold, italic, headings, links, lists, tables, task lists) via an inline formatting toolbar
- **Style presets** — Clean, Academic, Report, GitHub, and Minimal, each with its own fonts, spacing, and colors
- **Fine-grained customization** — adjust typography, layout, heading sizes, and colors with sliders and color pickers, or drop into a raw CSS editor for full control; save named custom styles locally
- **Export** — download as `.md`, copy Markdown to the clipboard, or print/save as PDF
- **Live word count**

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build, output in dist/
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the app and publishes `dist/` to GitHub Pages via `actions/deploy-pages`. This needs one manual, one-time setup step: in the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.

## Tech stack

React, [Tiptap](https://tiptap.dev)/[ProseMirror](https://prosemirror.net) (MIT) for the rendered editing surface and Markdown serialization, Tailwind CSS v4, and Vite.

## License

[MIT](LICENSE)
