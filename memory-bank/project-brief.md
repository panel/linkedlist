This is a svelte5 and sveltekit 2 project leveraging vitest and typescript.
It will use supabase for it's persistence tier and be deployed on vercel.
It will use lucia to support auth flows through bluesky, github and google.
It will use tailwindcss for styling.

This application will allow a user to save links along with chronological
notes associated with them. The links can be permanent or temporal. Think
about the difference between pages and posts in wordpress. The links can be
labeled with one or more terms and the user can decide whether links are
public or private. Notes are private by default but can be made public
via publishing.

## Additional Details

### Target Audience
The application is primarily designed for personal use, with multi-tenancy and user isolation built in from the beginning to support potential public-facing service expansion.

### Key Features
- **Link Management**: Save, categorize, and organize web links
- **Note Keeping**: Attach chronological notes to links for context and reference
- **Labeling System**: Organize links with user-defined labels for easy categorization
- **Privacy Controls**: Granular visibility settings for links and notes
- **Search & Discovery**: Robust search capabilities across links and notes
- **Publishing Workflow**: Process for making private notes publicly accessible

### Technical Architecture
- **Frontend**: Component-based UI with Svelte 5 and SvelteKit 2
- **Data Storage**: Normalized relational model in Supabase (PostgreSQL)
- **Authentication**: Lucia auth with multiple provider support
- **Security**: Row-level security for data isolation and privacy
- **Styling**: TailwindCSS for consistent, responsive design
- **Testing**: Comprehensive test coverage with Vitest
- **Deployment**: Streamlined deployment via Vercel

### Data Model
The core entities include Users, Links, Notes, and Labels with appropriate relationships to support the application's functionality. Links serve as the primary organizational unit, with Notes providing chronological context and Labels enabling categorization and discovery.

### User Experience Goals
- Simple, intuitive interface for saving and organizing links
- Effective exploration and discovery through search and labels
- Clear distinction between private and public content
- Seamless authentication experience with multiple provider options

Comprehensive architectural documentation can be found in the `/docs/architecture` directory.