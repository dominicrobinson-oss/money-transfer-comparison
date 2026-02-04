# Money Transfer Comparison Project

## Project Overview
Mobile-first web application for comparing GBP → NGN money transfer services.

## Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Node.js API Routes
- SQLite/PostgreSQL

## Setup Status
- [x] Verify that the copilot-instructions.md file in the .github directory is created
- [x] Clarify Project Requirements
- [x] Scaffold the Project
- [x] Customize the Project
- [x] Install Required Extensions
- [x] Compile the Project
- [x] Create and Run Task
- [ ] Launch the Project
- [x] Ensure Documentation is Complete

## Development Guidelines
- Mobile-first design approach
- No user authentication required
- No payment processing
- Focus on comparison and redirection to providers
- Use TypeScript for all code
- Follow Next.js App Router conventions

## API Endpoints
- `/api/providers` - Get all providers
- `/api/compare?amount={amount}` - Compare rates for specific amount

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
