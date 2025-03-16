# LinkedList

A personal link management system built with Svelte 5, SvelteKit 2, and TailwindCSS. LinkedList allows users to save links with chronological notes, organize them with labels, and control their visibility.

## Features

- Save links with titles, descriptions, and categorize them as permanent or temporal
- Add chronological notes to each link
- Organize links with custom labels
- Control visibility with public/private settings
- Search and filter your link collection

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/linkedlist.git
   cd linkedlist
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   ```
   
   Note: For local development, you don't need to change the default DATABASE_URL as the application will use mock data.

4. Start the development server
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
linkedlist/
├── docs/                 # Documentation
│   ├── architecture/     # Architecture documentation
│   └── in_progress.md    # Current development status
├── src/
│   ├── lib/
│   │   ├── components/   # UI components
│   │   ├── mock/         # Mock data and services
│   │   ├── server/       # Server-side code
│   │   ├── stores/       # Svelte stores
│   │   └── types/        # TypeScript interfaces
│   └── routes/           # SvelteKit routes
└── static/               # Static assets
```

## Development Approach

This application follows a phased approach to development:

1. **Foundation Phase (Current)** - Setting up the project structure, UI components, and basic functionality with mock data
2. **Integration Phase** - Connecting to Supabase and implementing real data persistence
3. **Authentication Phase** - Implementing Lucia auth with multiple providers
4. **Enhancement Phase** - Adding advanced features and optimizations

## Technology Stack

- **Frontend**: Svelte 5, SvelteKit 2, TailwindCSS
- **Database**: Postgres via Supabase (Mock data for now)
- **Authentication**: Lucia (Mock auth for now)
- **Deployment**: Vercel

## Future Integration Plans

- **Database**: Supabase Postgres
- **Authentication**: Lucia with Bluesky, GitHub, and Google providers
- **Search**: Full-text search capabilities
- **Analytics**: Usage tracking and insights
