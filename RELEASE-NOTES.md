# Release Notes

## v0.0.2 - Enhanced AI Features

**Release Date:** January 7, 2026

### New Features

#### Deep Thinking Mode

- Toggle between Normal and Deep Thinking modes for AI responses
- Deep Thinking mode uses higher temperature (0.9) and increased token limit (4096) for more thorough reasoning
- Perfect for complex problems requiring detailed analysis and creative solutions
- Easy-to-use toggle switch with brain icon next to model selector

#### RAG (Retrieval-Augmented Generation) Support

- Chatbot now maintains full conversation context across messages
- AI can reference previous questions and answers in the conversation
- Improved follow-up question handling with contextual awareness
- Seamless conversation flow with memory of entire chat history

#### Copy Message Functionality

- One-click copy button for all AI responses
- Material-UI icons with visual feedback (checkmark confirmation)
- Hover tooltips for better UX
- Automatically copies full message content to clipboard

#### Material-UI Icon Integration

- Upgraded from emoji to professional Material-UI icons
- Detailed prompt suggestions with clear placeholders
- Enhanced visual consistency across the application
- Icons: Lightbulb, Code, Summarize, Tips & Updates, School, Create

### Improvements

- **Prompt Suggestions**: More detailed and actionable prompt templates with bracketed placeholders
- **UI Polish**: Better icon styling and hover effects
- **Type Safety**: Enhanced TypeScript definitions for Electron API
- **Code Quality**: Improved component structure and separation of concerns

### Technical Updates

- Added `@mui/material`, `@emotion/react`, `@emotion/styled` dependencies
- Added `@mui/icons-material` for professional icon set
- Implemented Ollama chat API for conversation context support
- Enhanced LLM client with message history support

### Bug Fixes

- Fixed TypeScript type definitions for Ollama chat method
- Improved error handling for LLM API calls
- Better conversation history management

### Breaking Changes

None - fully backward compatible with v0.0.1

---

## v0.0.1 - Initial Release

**Release Date:** January 6, 2026

### First Release

StudyNest is an AI-powered study assistant desktop application that runs locally with privacy-first design.

### Features

- **AI Chat Interface** - ChatGPT-like conversational UI with local LLM support (Ollama)
- **Conversation Management** - Create, rename, delete, and organize multiple study sessions
- **Theme Support** - Seamless light/dark mode switching
- **Prompt Suggestions** - Quick-start templates for studying and research
- **Privacy-First** - All data stored locally with SQLite database
- **Cross-Platform** - Available for macOS and Windows

### Technical Stack

- Electron 28.3.3
- React 18.3.1
- TypeScript 5.9.3
- SQLite for local storage
- Material Design Icons

### Downloads

- **macOS (ARM64):** `StudyNest-1.0.0-arm64.dmg`
- **Windows (x64):** `StudyNest Setup 1.0.0.exe`

### Requirements

- Ollama installed and running locally
- macOS 10.12+ or Windows 10+

### Known Issues

None reported yet. Please create an issue if you encounter any problems.

### Acknowledgments

Built with ❤️ for everyone who values privacy and local-first applications.
