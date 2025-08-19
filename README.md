# Chess Frontend

A modern, full-featured web client for playing, spectating, and managing chess games. Built with React, TypeScript, Vite, and Material UI, this project provides a robust, responsive, and visually appealing chess experience.

## Features

- **Play Chess Online:** Real-time chess gameplay with move validation, clocks, and draw/resign controls.
- **Game Modes:** Choose from multiple time controls (e.g., rapid, blitz, bullet) and join matchmaking queues.
- **Spectate Games:** View ongoing games and move history.
- **Game History:** Browse and review your past games, including move lists and results.
- **Player Profiles:** View your rating, stats, and recent activity.
- **Authentication:** Register, login, and manage your account securely.
- **Responsive UI:** Mobile-friendly, accessible, and visually polished using Material UI and custom theming.

## Main Components

- `src/components/Chess/ChessBoard.tsx`: Interactive chessboard with drag-and-drop, move highlighting, and orientation.
- `src/components/Chess/ChessTimer.tsx`: Displays and updates player clocks in real time.
- `src/components/Chess/GameControls.tsx`: Controls for resigning, offering/accepting draws, etc.
- `src/components/Chess/MoveList.tsx`: Shows the move history and allows navigation.
- `src/components/Layout/NavBar.tsx`: Responsive navigation bar with authentication-aware links.
- `src/components/Layout/Layout.tsx`, `Footer.tsx`: Page layout and footer.

## Project Structure

- `src/pages/`: Main app pages (Home, Login, Register, GamePlay, GameHistory, Profile, GameModes)
- `src/components/`: Reusable UI components (Chess, Layout, etc.)
- `src/services/`: API integration (REST endpoints for auth, games, matchmaking, etc.)
- `src/providers/`: React context providers (e.g., authentication)
- `src/types/`: TypeScript types for all major data models
- `src/theme.ts`: Custom Material UI theme

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
3. **Open your browser:**
   Visit [http://localhost:3998](http://localhost:3998)

> **Note:** The frontend expects a backend API running at `http://localhost:4999/api` (see `src/services/api.ts`).

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Lint codebase

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (fast dev/build tool)
- **Material UI** (component library)
- **chess.js** and **react-chessboard** (chess logic/UI)
- **Axios** (API requests)
- **Tailwind CSS** (optional utility classes)

## License

MIT (or your chosen license)

---

*Built by Tim using modern React best practices.*
