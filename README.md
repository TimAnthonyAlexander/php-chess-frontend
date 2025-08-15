# Chess Frontend

A modern, responsive chess application built with React, TypeScript, and Tailwind CSS.

## Features

- **Authentication System**: User registration and login
- **Home Dashboard**: Display user profile, recent games, and leaderboards
- **Game Mode Selection**: Various time controls (bullet, blitz, rapid)
- **Interactive Chessboard**: Play games with real-time updates
- **Game History**: Review past games
- **Profile Page**: View ratings across different time classes
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- React 18 with TypeScript
- React Router for routing
- Tailwind CSS for styling
- Axios for API communication
- chess.js and react-chessboard for the chess logic and board display

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd chess-frontend
```

2. Install dependencies

```bash
npm install
# or
yarn
```

3. Configure the API endpoint

Edit `src/services/api.ts` and update the baseURL to point to your API server if needed.

4. Start the development server

```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:5173`

## API Integration

The frontend communicates with the backend through RESTful API endpoints:

- Authentication: `/api/register`, `/api/login`
- Game Modes: `/api/modes`
- Matchmaking: `/api/queue/join/{tc}`, `/api/queue/leave/{tc}`
- Gameplay: `/api/games/{id}`, `/api/games/{id}/sync`, `/api/games/{id}/move`
- User Data: `/api/me/active-game`, `/api/me/recent-games`, `/api/me/ratings`
- Leaderboards: `/api/leaderboard`

## Building for Production

```bash
npm run build
# or
yarn build
```

This will generate optimized production files in the `dist` directory, which can be deployed to any static hosting service.

## License

This project is licensed under the MIT License - see the LICENSE file for details.