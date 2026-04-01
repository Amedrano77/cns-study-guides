# CLAUDE.md — CNS Study Guides

This file provides guidance for AI assistants working on the `cns-study-guides` repository.

## Project Overview

**CNS Study Guides** is a static educational website for Computer & Networking Systems courses at Tarrant County College (TSTC). It hosts 13 IT certification study guides plus interactive learning tools, deployed on **Netlify**.

- No build step, no package manager, no framework dependencies
- Pure HTML5, CSS3, and vanilla JavaScript
- One `index.html` per guide — all CSS and JS are embedded inline
- One Netlify serverless function for AI-powered quiz generation

## Repository Structure

```
cns-study-guides/
├── index.html                    # Main landing page
├── netlify.toml                  # Netlify deployment config (functions directory)
├── netlify/functions/
│   └── quiz.js                   # Serverless function: AI quiz generation via Claude API
└── <subject>/
    └── index.html                # Self-contained study guide (HTML + CSS + JS inline)
```

### Subject Directories

| Directory | Content |
|---|---|
| `a-plus/` | CompTIA A+ study guide |
| `ccna1/`, `ccna2/`, `ccna3/` | Cisco CCNA 1–3 study guides |
| `checklists/` | Exam readiness checklists |
| `cloud-computing/` | AWS & Cloud Computing |
| `computer-virtualization/` | Proxmox VE virtualization |
| `directory-services/` | Active Directory |
| `flashcards/` | Digital flashcard decks |
| `internet-intranet-server/` | CompTIA Server+ |
| `labs/` | Hands-on labs |
| `linux-plus/` | CompTIA Linux+ |
| `network-plus/` | CompTIA Network+ |
| `network-troubleshooting/` | IT support & troubleshooting |
| `packet-visualizer/` | Animated network packet visualization |
| `programming-logic/` | PowerShell & Python scripting |
| `python-runner/` | In-browser Python IDE (Pyodide) |
| `quizzes/` | AI-powered practice quizzes |
| `resources/` | Resource hub |
| `security-plus/` | CompTIA Security+ |
| `subnet-trainer/` | Interactive subnetting trainer |
| `videos/` | Video library |

## Development Workflow

### Deployment

Netlify auto-deploys on every push to `main`. There is no build step — files are served as-is.

- The `netlify.toml` only registers `netlify/functions/` as the serverless functions directory.
- The `ANTHROPIC_API_KEY` environment variable must be set in the Netlify dashboard for quiz generation to work.

### Editing Study Guides

Each guide is a single self-contained `<subject>/index.html`. When editing:

1. Open the relevant file and make changes directly.
2. All CSS lives in a `<style>` block inside `<head>`.
3. All JavaScript lives in `<script>` blocks at the bottom of `<body>`.
4. No compilation, no build commands — just save and push.

### Adding a New Study Guide

1. Create a new directory (e.g., `cloud-plus/`).
2. Create `cloud-plus/index.html` following the conventions below.
3. Add a link card to `index.html` (the landing page) in the appropriate section.

### Netlify Function (`netlify/functions/quiz.js`)

- Accepts `POST` requests with JSON body `{ course, difficulty, num }`.
- Calls the Anthropic API (`claude-sonnet-4-20250514`) to generate multiple-choice questions.
- Returns a JSON array of question objects.
- The `ANTHROPIC_API_KEY` is **never** exposed to the browser — it lives in the Netlify environment.

When updating the model in `quiz.js`, use the latest Claude Sonnet model ID. The current model is `claude-sonnet-4-20250514`.

## Conventions

### HTML Structure (per guide)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subject Name — CNS Study Guide</title>
  <style>/* All page CSS here */</style>
</head>
<body>
  <!-- Page content -->
  <script>/* All page JS here */</script>
</body>
</html>
```

### CSS Conventions

- **Classes**: kebab-case (`.card-header`, `.btn-primary`, `.q-tag`)
- **IDs**: camelCase (e.g., `#codeEditor`, `#outputBox`)
- **No CSS variables** — colors are hard-coded using the palette below
- **No external CSS framework** — all styles are custom

**Established color palette** (use consistently):

| Role | Value |
|---|---|
| Primary accent (red) | `#b91c1c` |
| Dark header/sidebar background | `#0f2b3d` |
| Page body background | `#f5f7fa` |
| Primary text | `#1e293b` |
| Secondary/muted text | `#64748b` |

**Typography**:
- Body: `'Segoe UI', Roboto, 'Helvetica Neue', system-ui, sans-serif`
- Code/monospace: `'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace`

**Responsive breakpoints**:
- Desktop 3-column → `900px` → 2-column → `600px` → 1-column

### Component Patterns

**Cards**:
```html
<div class="card">
  <div class="card-header">Title</div>
  <div class="card-body">Content</div>
</div>
```

**Buttons**:
```html
<button class="btn btn-primary">Click me</button>
<button class="btn btn-disabled" disabled>Disabled</button>
```

**Instructor notes** (shown with a yellow background):
```html
<div class="note">
  <strong>Adrian M. says:</strong> Your note here.
</div>
```

**Sidenotes** (rotated, Comic Sans, playful callouts):
```html
<div class="sidenote">Callout text here</div>
```

### JavaScript Conventions

- Vanilla JS only — no external libraries or frameworks
- Global variables for state tracking (e.g., `let currentQuestion = 0; let score = 0;`)
- Show/hide UI with `element.style.display = 'block'` / `'none'`
- `DOMContentLoaded` listener for initialization when needed

## Important Constraints

- **No npm/Node** — Do not add `package.json`, `node_modules`, or any npm-based tooling to the project.
- **No frameworks** — Do not introduce React, Vue, Angular, Tailwind, Bootstrap, or similar.
- **No external CSS/JS files** — Keep all styling and scripting inline in each guide's `index.html`. Shared utilities should be duplicated, not extracted to a shared file (preserving the self-contained nature of each guide).
- **No build pipeline** — Netlify deploys the raw files. Do not add build configuration.
- **API key security** — The `ANTHROPIC_API_KEY` must only ever be accessed in `netlify/functions/quiz.js`. Never reference it in any frontend HTML or JS.
- **Consistent design** — New pages must follow the established color palette, typography, and component patterns above.

## Branching

- `main` — production branch; Netlify auto-deploys from here
- Feature branches — use descriptive names (e.g., `add-security-plus-labs`)
- Merge to `main` when ready to deploy
