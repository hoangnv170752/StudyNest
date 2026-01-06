# StudyNest

A modern study management application built with Electron, React, and TypeScript.

## Features

- Task management with due dates
- Clean and modern UI
- Cross-platform desktop application
- Built with Electron for native desktop experience

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Running in Development Mode

```bash
npm run dev
```

This will start both the React development server and Electron app.

### Building for Production

```bash
npm run build
```

### Packaging

Build distributable packages for your platform:

```bash
# For macOS
npm run package:mac

# For Windows
npm run package:win

# For Linux
npm run package:linux

# For all platforms
npm run package
```

## Project Structure

```
studynest/
├── electron/          # Electron main process files
│   ├── main.ts       # Main process entry point
│   └── preload.ts    # Preload script
├── src/              # React application source
│   ├── App.tsx       # Main React component
│   ├── App.css       # App styles
│   ├── index.tsx     # React entry point
│   └── index.css     # Global styles
├── public/           # Static assets
│   └── index.html    # HTML template
├── dist/             # Build output
└── release/          # Packaged applications
```

## Technologies

- **Electron**: Desktop application framework
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Webpack**: Module bundler
- **electron-builder**: Application packager

## License

MIT
