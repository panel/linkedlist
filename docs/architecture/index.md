# LinkedList Architecture Documentation

This directory contains the architectural documentation for the LinkedList application.

## Overview

LinkedList is a Svelte5/SvelteKit2 application that allows users to save links along with chronological notes. It supports both permanent and temporal links, similar to pages and posts in WordPress. Links can be labeled with terms and set as public or private, while notes can be published to make them publicly accessible.

The application uses Supabase for data persistence, Lucia for authentication with multiple providers (Bluesky, GitHub, and Google), and TailwindCSS for styling. It is designed to be deployed on Vercel.

## Documentation Structure

This architecture documentation covers the following areas:

1. [**System Overview**](overview.md) - High-level architecture and component relationships
2. [**Data Model**](data-model.md) - Core entities, relationships, and database design
3. [**Architectural Decisions**](decisions.md) - Key decisions across various aspects of the system
4. [**Implementation Phases**](implementation-phases.md) - Planned development stages and milestones
5. [**Trade-offs**](tradeoffs.md) - Analysis of architectural trade-offs and rationales

## Key Considerations

The architecture addresses several key requirements:

- **Multi-tenancy**: User isolation with the possibility of a public-facing service
- **Exploration and Discovery**: Effective search and label-based organization
- **Content Privacy**: Granular control over public/private visibility
- **Publishing Workflow**: Process for making notes publicly available
- **Performance**: Effective data access patterns and query optimization

## Getting Started

Developers should start by reviewing the [System Overview](overview.md) and [Data Model](data-model.md) to understand the fundamental structure of the application. The [Architectural Decisions](decisions.md) document provides detailed reasoning for specific architectural choices.

For implementation planning, refer to the [Implementation Phases](implementation-phases.md) document, which outlines the staged approach to building the system.