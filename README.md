# StudyNest

An AI-powered study assistant desktop application that runs locally with privacy-first design. Built with Electron, React, and TypeScript.

## Features

### 🤖 AI Chat Interface
- ChatGPT-like conversational interface
- Support for local Small Language Models (SLM)
- Offline-first architecture for complete privacy
- Real-time message streaming
- Conversation history management

### 🎨 Modern Design System
- Light and dark theme support with seamless switching
- Material Design Icons integration
- Responsive and accessible UI components
- Custom design tokens for consistent styling

### 🔒 Privacy-Focused
- All data stays on your device
- No external API calls required
- Local LLM integration ready
- Secure document management

### 💬 Chat Features
- Multiple conversation threads
- Message history with timestamps
- Typing indicators
- Prompt suggestions for quick start
- Auto-resizing text input

## Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

## Installation

```bash
pnpm install
```

## Development

### Running in Development Mode

```bash
pnpm run dev
```

This will start both the React development server (port 3000) and Electron app.

### Building for Production

```bash
pnpm run build
```

### Packaging

Build distributable packages for your platform:

```bash
# For macOS
pnpm run package:mac

# For Windows
pnpm run package:win

# For Linux
pnpm run package:linux

# For all platforms
pnpm run package
```

## Project Structure

```
studynest/
├── electron/              # Electron main process
│   ├── main.ts           # Main process entry point
│   └── preload.ts        # Preload script for IPC
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Button/       # Button component with variants
│   │   ├── Card/         # Card container component
│   │   ├── ChatInput/    # Message input with actions
│   │   ├── ChatMessage/  # Message display component
│   │   ├── Input/        # Form input component
│   │   ├── Sidebar/      # Navigation sidebar
│   │   ├── ThemeToggle/  # Light/dark theme switcher
│   │   └── Typography/   # Text components
│   ├── hooks/            # Custom React hooks
│   │   ├── useChat.ts    # Chat state management
│   │   └── useTheme.ts   # Theme management
│   ├── screens/          # Main application screens
│   │   ├── Chat/         # Chat interface screen
│   │   └── Home/         # Home screen
│   ├── styles/           # Global styles and tokens
│   │   ├── tokens.css    # Design system tokens
│   │   └── README.md     # Design system documentation
│   ├── types/            # TypeScript type definitions
│   │   ├── chat.ts       # Chat-related types
│   │   └── task.ts       # Task-related types
│   ├── utils/            # Utility functions
│   │   └── llm.ts        # LLM client for local models
│   ├── App.tsx           # Root component
│   ├── index.tsx         # React entry point
│   └── index.css         # Global styles
├── public/               # Static assets
│   └── index.html        # HTML template
├── dist/                 # Build output
└── release/              # Packaged applications
```

## Technologies

### Core
- **Electron** (v28.3.3) - Desktop application framework
- **React** (v18.3.1) - UI library
- **TypeScript** (v5.9.3) - Type-safe JavaScript

### UI & Styling
- **Material Design Icons** (@mdi/react, @mdi/js) - Icon library
- **CSS Variables** - Design tokens system

### Build Tools
- **Webpack** (v5.104.1) - Module bundler
- **electron-builder** - Application packager
- **pnpm** - Fast, disk space efficient package manager

## Local LLM Integration

StudyNest is designed to work with local LLM servers. To connect your local model:

1. Start your local LLM server (e.g., Ollama, LM Studio, llama.cpp)
2. Update the LLM endpoint in `src/hooks/useChat.ts`
3. Configure the model settings in `src/utils/llm.ts`

Example endpoints:
- **Ollama**: `http://localhost:11434/api/generate`
- **LM Studio**: `http://localhost:1234/v1/chat/completions`

## Design System

StudyNest includes a comprehensive design system with:
- Color scales (white/black with opacity variants)
- Primary colors (blue shades)
- Spacing scale (4px to 64px)
- Typography system
- Reusable components (Button, Input, Card, Typography)

See `src/styles/README.md` for detailed documentation.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
