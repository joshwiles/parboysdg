# Vue.js Frontend Template

A clean, minimal Vue.js 3 template for building modern websites.

## Features

- **Vue 3** with Composition API
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **PostCSS** for CSS processing
- **Modern tooling** with hot module replacement

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── App.vue          # Main application component
├── main.js          # Application entry point
├── assets/          # Static assets
│   └── main.css     # Global styles
└── components/      # Vue components (empty - add your own!)
```

## Customization

This template provides a minimal starting point. You can:

- Add your own components in the `src/components/` directory
- Customize the styling in `src/assets/main.css`
- Modify the layout in `src/App.vue`
- Add routing with `vue-router` if needed
- Add state management with `pinia` if needed

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## License

MIT
