# LLM Master 🧠

**大语言模型学习路径** — An interactive visual guide to understanding Large Language Models, from mathematical foundations to production deployment.

Built with React + TypeScript + Vite, featuring Manim-powered animations that make complex concepts tangible.

## Features

- **9 Chapters / 18 Lessons** — Structured curriculum across 3 phases: Basics → Core Architecture → Engineering Practice
- **Interactive Animations** — 15 animated derivation steps powered by Manim (matrix multiplication, attention mechanism, gradient descent, backpropagation)
- **Video Player** — HTML5 video with playback controls for rendered Manim scenes
- **Dark Mode** — Full dark/light theme support with system preference detection
- **Search** — Fuzzy search across all lessons and chapters via Fuse.js
- **Progress Tracking** — Per-lesson completion tracking with visual progress bars (persisted to localStorage)
- **Sandbox** — Interactive experimentation environment
- **Resource Library** — Curated papers, blog posts, and GitHub repositories for each chapter
- **Tauri Desktop App** — Available as a native desktop application (WIP)
- **Responsive Design** — Works on desktop and tablet viewports

## Curriculum

| Phase | Chapter | Topics |
|-------|---------|--------|
| **Phase 1: 基础** | Ch1: 数学基础 | Linear algebra, calculus, probability |
| | Ch2: 深度学习基础 | Neural networks, backpropagation, optimizers |
| | Ch3: NLP基础 | Word embeddings, RNN/LSTM/GRU |
| **Phase 2: 核心架构** | Ch4: Transformer架构 | Self-attention, QKV, multi-head |
| | Ch5: 预训练技术 | Language modeling objectives, scaling laws |
| | Ch6: 主流LLM架构 | GPT series, LLaMA, Mistral/Mixtral |
| **Phase 3: 工程实践** | Ch7: 模型微调 | LoRA, QLoRA, RLHF, DPO |
| | Ch8: 量化与部署 | GGUF, GPTQ, vLLM, TensorRT-LLM |
| | Ch9: 应用开发 | Prompt engineering, RAG, LangChain, Agents |

## Animated Visualizations

Key concepts are illustrated through Manim-rendered animations:

| Animation | Concept | Scene File |
|-----------|---------|------------|
| Matrix Multiplication | Linear algebra operation visualization | `src/animations/scenes/matrix_scene.py` |
| Scaled Dot-Product Attention | QKV computation flow | `src/animations/scenes/attention_scene.py` |
| Gradient Descent | Optimization trajectory on loss surface | `src/animations/scenes/gradient_scene.py` |
| Backpropagation Chain | Chain rule through computation graph | `src/animations/scenes/gradient_scene.py` |

To re-render animations, see [Animations Pipeline](#animations-pipeline).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + TypeScript (strict) |
| **Build** | Vite 5 + Vitest |
| **Routing** | React Router v6 |
| **Styling** | Tailwind CSS 3.4 |
| **Animation** | Framer Motion (UI) + Manim (math visualizations) |
| **Desktop** | Tauri 2 |
| **Testing** | Vitest + jsdom + Testing Library |
| **State** | Zustand |
| **Math** | KaTeX |
| **Search** | Fuse.js |

## Getting Started

### Prerequisites

- Node.js 18+
- npm / pnpm

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:1420)
npm run dev

# Run tests
npm run test        # watch mode
npm run test:run    # single run
npm run test:coverage  # with coverage report

# Build for production
npm run build
```

### Animations Pipeline

Rendering Manim scenes requires additional dependencies:

```bash
# Set up Python environment
python -m venv .venv-manim
.venv-manim\Scripts\activate   # Windows
source .venv-manim/bin/activate  # macOS/Linux

# Install Manim + LaTeX
pip install -r src/animations/requirements.txt
# Requires MiKTeX (Windows) or TeX Live (macOS/Linux)
# Windows: winget install MiKTeX.MiKTeX

# Render all scenes
python src/animations/render.py
```

Rendered MP4 files are copied to `public/videos/` automatically.

### Desktop Build (Tauri)

```bash
npm run tauri:dev     # Development mode with DevTools
npm run tauri:build   # Production build
```

## Project Structure

```
llm-master/
├── public/
│   └── videos/        # Manim-rendered MP4 animations
├── src/
│   ├── animations/     # Manim Python scene scripts
│   │   ├── render.py           # Batch rendering pipeline
│   │   ├── requirements.txt    # Python dependencies
│   │   └── scenes/
│   │       ├── attention_scene.py    # Scaled dot-product attention
│   │       ├── gradient_scene.py     # Gradient descent & backpropagation
│   │       └── matrix_scene.py       # Matrix multiplication
│   ├── components/
│   │   ├── derivation/    # Animation components (VideoPlayer, MatrixVisualizer, etc.)
│   │   ├── learning/      # ChapterNav, LessonCard
│   │   ├── ui/            # Button, Card, Layout, Sidebar
│   │   └── ...
│   ├── lib/
│   │   ├── content/       # Chapter & lesson data
│   │   └── utils/         # Visualization helpers, cn utility
│   ├── pages/             # Route pages
│   ├── stores/            # Zustand stores (theme, progress)
│   ├── types/             # TypeScript type definitions
│   └── styles/            # Global CSS
├── src-tauri/             # Tauri desktop app configuration
└── ...
```

## Testing

- **49 unit + integration tests** covering components, pages, utils, and content data
- Vitest + jsdom environment with Testing Library
- Coverage threshold: 80%

```bash
npm run test:run         # Run all tests
npm run test:coverage    # With coverage report
```

## License

MIT
