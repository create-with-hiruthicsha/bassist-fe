# Bassist Client UI

Bassist is an AI-powered project management tool that helps you generate tasks and documentation for your projects.

## Features

- **Task Generation**: Convert project descriptions into structured task breakdowns
- **Direct Task Creation**: Create tasks directly for various project management platforms
- **Documentation Generation**: Create comprehensive documentation from project files or descriptions

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bassist-client-ui
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Set up Supabase:
   - Create a Supabase account and project at [supabase.com](https://supabase.com)
   - Run the migration in the `supabase/migrations` folder
   - Create a `.env` file in the root directory with your Supabase credentials:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Usage

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

This will start the application at `http://localhost:5173` (or another port if 5173 is in use).

### Building for Production

Build the application for production:

```bash
npm run build
# or
yarn build
```

Preview the production build:

```bash
npm run preview
# or
yarn preview
```

## Project Structure

- `src/components/`: React components
- `src/hooks/`: Custom React hooks
- `src/lib/`: Utility libraries and API clients
- `src/types/`: TypeScript type definitions
- `supabase/migrations/`: Database migration scripts

## Integration

For information on integrating with other services, see [INTEGRATION.md](./INTEGRATION.md).