# Money Transfer Comparison

A mobile-first web application for comparing money transfer services from GBP to NGN.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** SQLite (development) / PostgreSQL (production ready)

## Features

- Compare real-time transfer rates for GBP → NGN
- View fees, exchange rates, and transfer speeds
- Redirect to provider websites
- Mobile-first responsive design
- No authentication or payment processing

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## API Endpoints

### GET `/api/providers`
Returns all available transfer providers.

**Response:**
```json
{
  "providers": [...],
  "count": 5
}
```

### GET `/api/compare?amount=100`
Compare providers for a specific transfer amount.

**Parameters:**
- `amount` (required): Amount in GBP to transfer

**Response:**
```json
{
  "comparisons": [...],
  "bestRate": {...},
  "fastestTransfer": {...},
  "lowestFee": {...},
  "timestamp": "2026-02-03T..."
}
```

## Project Structure

```
money-transfer-comparison/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── compare/
│   │   │   │   └── route.ts
│   │   │   └── providers/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── lib/
│   │   ├── data/
│   │   │   └── providers.ts
│   │   └── comparison.ts
│   └── types/
│       └── index.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## Development Roadmap

- [x] Project setup and configuration
- [x] Type definitions
- [x] Mock provider data
- [x] Comparison logic
- [x] API routes
- [ ] Database integration (SQLite/PostgreSQL)
- [ ] UI components
- [ ] Mobile-responsive design
- [ ] Testing
- [ ] Deployment

## License

MIT
