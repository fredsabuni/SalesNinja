# Lead Generation Tool

A mobile-first Progressive Web App (PWA) built with Next.js 14 for collecting lead data and integrating with Notion via n8n automation.

## Features

- 📱 Mobile-first responsive design
- 🔄 Offline-first functionality with automatic sync
- 📊 Real-time dashboard with lead statistics
- 🎯 Multi-step lead collection form
- 🔍 Searchable officer selection from Notion
- 📍 GPS location capture with manual fallback
- 🚀 Progressive Web App capabilities
- 🎨 Modern UI with custom design system

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Database**: IndexedDB (via Dexie.js)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives
- **Date Handling**: date-fns

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── forms/          # Form-specific components
│   └── layout/         # Layout components
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
└── stores/             # Zustand stores
```

## Integration

This tool uses:
- **Supabase**: PostgreSQL database for officers and leads storage
- **Simple Authentication**: Email-based login for dealers (MVP approach)

## Development

The project follows these principles:
- Mobile-first responsive design
- Offline-first architecture
- Progressive enhancement
- Accessibility compliance (WCAG 2.1 AA)
- Type safety with TypeScript
- Modern development practices
