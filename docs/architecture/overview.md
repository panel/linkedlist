# LinkedList System Architecture Overview

This document provides a high-level overview of the LinkedList application architecture.

## System Components

```mermaid
flowchart TD
    subgraph Client["Client (Svelte5/SvelteKit2)"]
        UI[UI Components]
        State[Client State]
        Routes[SvelteKit Routes]
    end

    subgraph Server["Server (SvelteKit)"]
        API[API Endpoints]
        Auth[Auth Handlers]
        Hooks[SvelteKit Hooks]
    end

    subgraph Data["Data Layer"]
        Supabase[Supabase]
        FileStorage[File Storage]
    end

    Client <--> Server
    Server <--> Data
```

## Key Technologies

- **Frontend**: Svelte 5, SvelteKit 2, TypeScript, TailwindCSS
- **Backend**: SvelteKit API routes, Lucia Auth
- **Data Storage**: Supabase (PostgreSQL)
- **Authentication**: Lucia with Bluesky, GitHub, and Google providers
- **Deployment**: Vercel
- **Testing**: Vitest

## Architecture Principles

1. **Component-based architecture** for frontend with clear separation of concerns
2. **Data isolation** through user-scoped queries and row-level security
3. **Progressive enhancement** with server-side rendering where appropriate
4. **API-first design** for all data operations
5. **Multi-tenancy** support from the beginning