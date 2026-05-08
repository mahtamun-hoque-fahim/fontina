# DESIGN_GUIDE.md — fontina

Dark-first. Minimal. Technical.

---

## Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#0a0a0a` | Page background |
| `--surface` | `#111111` | Card / panel background |
| `--border` | `#1e1e1e` | All borders, dividers |
| `--muted` | `#666666` | Secondary text, icons |
| `--accent` | `#00e676` | CTA buttons, active states, highlights |
| `--accent-dim` | `#00e676/10` | Accent tinted backgrounds |
| `--text` | `#ffffff` | Primary text |
| `--error` | `#f44336` (red-500) | Error states |

---

## Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Headings | Syne | 700–800 | 3rem–4.5rem |
| UI labels | Syne | 600 | 0.875rem |
| Body | Onest | 400 | 1rem |
| Code / filenames | JetBrains Mono | 400–500 | 0.75–0.875rem |
| Tags / badges | JetBrains Mono | 700 | 0.625rem |

---

## Spacing Scale

`4px` base. Use multiples: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`

---

## Border Radius

| Context | Value |
|---|---|
| Cards / panels | `rounded-2xl` (16px) |
| Buttons | `rounded-lg` (8px) |
| Badges / tags | `rounded-full` |
| Icon boxes | `rounded-xl` (12px) |

---

## Component Patterns

### Button — Primary
```jsx
<button className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#00e676] text-[#0a0a0a] font-semibold hover:bg-[#00c853] transition-colors">
  Convert all
</button>
```

### Button — Ghost
```jsx
<button className="text-xs font-mono px-3 py-1.5 rounded-lg border border-[#1e1e1e] text-[#666] hover:text-white hover:border-[#666] transition-colors">
  Clear
</button>
```

### Card
```jsx
<div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5 hover:border-[#00e676]/30 transition-colors">
```

### Badge — accent
```jsx
<span className="text-[10px] font-mono text-[#00e676] bg-[#00e676]/10 border border-[#00e676]/20 px-2 py-0.5 rounded-full">
```

### Badge — error
```jsx
<span className="text-[10px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
```

### Tag pill (top of hero)
```jsx
<div className="inline-flex items-center gap-2 bg-[#111] border border-[#1e1e1e] rounded-full px-4 py-1.5 text-xs font-mono text-[#00e676]">
  <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
  TTF · OTF · EOT · WOFF → WOFF2
</div>
```

### Drop zone (idle)
```
border-2 border-dashed border-[#1e1e1e] bg-[#111] rounded-2xl
hover: border-[#00e676]/40
```

### Drop zone (active / dragging)
```
border-[#00e676] bg-[#00e676]/5 scale-[1.01]
```

---

## Animation Defaults

| Name | CSS | Usage |
|---|---|---|
| fadeUp | `opacity 0 → 1, translateY 16px → 0, 0.5s ease` | Hero entrance |
| pulse | Tailwind `animate-pulse` | Live indicator dot, loading states |
| spin | Tailwind `animate-spin` | Conversion spinner |

---

## Dark Mode

Dark-only. No light mode. All components assume `#0a0a0a` background.
