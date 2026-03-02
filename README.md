# Orchestra Web

Orchestra MCP web application built with Next.js 15, React 19, and Tailwind CSS v4.

## Prerequisites

- Node.js 20+
- npm

## Quick Start

```bash
npm install
npm run dev
```

The development server will start at [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run storybook` | Start Storybook development server |
| `npm run build-storybook` | Build Storybook for static deployment |

## Project Structure

```
src/
├── app/
│   ├── (app)/            # Authenticated app routes
│   ├── (auth)/           # Authentication routes
│   └── (marketing)/      # Public marketing/landing pages
├── components/           # Shared UI components
├── lib/                  # Utilities, helpers, and configuration
└── store/                # Zustand state management
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS v4, Radix UI (shadcn-style)
- **State**: Zustand
- **Icons**: Lucide
- **Charts**: Recharts
- **Component Dev**: Storybook

## Learn More

- [Orchestra MCP Framework](https://github.com/orchestra-mcp)
