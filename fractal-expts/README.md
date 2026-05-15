# Fractal Experiments for fractalfuzion.com

Generated Python scripts (matplotlib) and interactive HTML/JS canvas for Mandelbrot, Julia, Sierpinski.

## Python Scripts
- `mandelbrot.py`: Static Mandelbrot PNG.
- `julia.py`: Static Julia PNG.
- `sierpinski.py`: Static Sierpinski triangle PNG.

Run with `python mandelbrot.py` (requires numpy, matplotlib).

## Interactive Web
- `mandelbrot-interactive.html`: Zoom/pan, export PNG/SVG, adjustable iterations.

Open in browser.

## Real Estate Tie-in Ideas
- Fractal property subdivisions: Use Sierpinski-like recursion for infinite subdivision of land plots.
- Urban fractals: Mandelbrot-inspired city growth models.
- Interactive property visualizer: JS canvas for fractal boundaries in real estate listings.

## For New Skill Dir
Copy to `~/.npm-global/lib/node_modules/openclaw/skills/fractal-viz/`:
```
fractal-viz/
├── SKILL.md  # Describe triggers: "generate mandelbrot", etc.
├── scripts/
│   ├── mandelbrot.py
│   ├── julia.py
│   └── sierpinski.py
├── examples/
│   └── mandelbrot-interactive.html
└── README.md
```

**SKILL.md template:**
```
# Fractal Visualization Skill

## Triggers
- User asks for fractals, Mandelbrot, Julia, Sierpinski.
- "show me a fractal", "generate sierpinsk"

## Usage
Use scripts/ to exec Python, canvas for interactive, write examples/.

## Examples
exec scripts/mandelbrot.py
```
