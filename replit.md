# AssetFlow - AI-Powered Inventory Management System

## Overview

AssetFlow is a full-stack inventory management application designed for handmade product businesses. It combines traditional inventory tracking with AI-powered features including computer vision scanning, predictive demand forecasting, and an intelligent chatbot assistant. The system manages raw materials, finished products, sales tracking, and provides real-time analytics through a modern dashboard interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration supporting light/dark modes
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion for page transitions and UI animations
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ES modules
- **API Style**: RESTful JSON API with Zod validation
- **Database ORM**: Drizzle ORM with PostgreSQL
- **AI Integration**: OpenAI API via Replit AI Integrations for chatbot and image generation

### Database Schema
The PostgreSQL database contains these core tables:
- `materials` - Raw materials inventory (SKU, quantity, cost, minimum stock levels)
- `products` - Finished handmade products with vision-detected properties
- `product_recipes` - Links products to required materials with quantities
- `sales` - Sales transaction records
- `inventory_logs` - Audit trail of all inventory changes
- `vision_status_logs` - Computer vision scan results and anomaly detection
- `conversations` / `messages` - AI chatbot conversation history

### AI Services (Python)
Located in `ai_services/`:
- **Vision Engine** (`vision_yolo.py`): YOLOv8-based object detection for product scanning, SKU classification, and damage detection
- **Forecasting Engine** (`forecasting.py`): scikit-learn based demand prediction using historical sales data

### Key Design Patterns
- **Shared Schema**: Database schema and Zod validation schemas defined in `shared/schema.ts`, used by both frontend and backend
- **Route Definitions**: API routes defined in `shared/routes.ts` with type-safe request/response schemas
- **Storage Pattern**: `server/storage.ts` provides a storage interface abstracting database operations
- **Replit Integrations**: Pre-built modules in `server/replit_integrations/` for audio, chat, image generation, and batch processing

### Build System
- Development: Vite dev server with HMR proxied through Express
- Production: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Database migrations: Drizzle Kit with `db:push` command

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connected via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries with automatic migration support

### AI Services
- **OpenAI API**: Powers the inventory chatbot assistant, accessed through Replit AI Integrations
  - Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`
- **YOLOv8**: Computer vision model for product detection (runs in simulation mode by default)
- **scikit-learn**: Machine learning for demand forecasting

### Third-Party Libraries
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, tabs, etc.)
- **TanStack Query**: Async state management and caching
- **Recharts**: React charting library for analytics dashboards
- **date-fns**: Date formatting and manipulation
- **Zod**: Runtime type validation for API requests/responses
- **Framer Motion**: Animation library for smooth UI transitions

### Development Tools
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **Drizzle Kit**: Database migration tooling
- **TypeScript**: Static typing across the entire codebase

## AI Features (Recent Implementation)

### Predictive Demand Forecasting
- **Endpoint**: `/api/analytics/forecast`
- Uses historical sales data to predict 7-day demand per product
- Calculates predicted stock levels and flags products needing reorder
- Implemented inline in Node.js with basic linear trend analysis

### AI Chatbot Assistant
- **Endpoint**: `/api/chat`
- Natural language interface to query inventory data
- Uses OpenAI GPT-5.2 via Replit AI Integrations
- Answers questions about stock levels, sales, and reorder recommendations

### Computer Vision Scanning
- **Endpoints**: `/api/vision/scan`, `/api/vision/status-logs`, `/api/vision/anomalies`
- Simulated YOLOv8 nano object detection (full model requires ultralytics package)
- Detects product SKUs, calculates confidence scores, flags damaged/non-standard items
- Real-time scan feed with bounding box overlays

### One-Click Reorder
- **Endpoint**: `/api/products/:id/reorder`
- Automatically adds 50 units to product inventory
- Logs restock action in inventory logs

## Frontend Pages

- **Dashboard** (`/`): Overview with key metrics
- **Products** (`/products`): Product inventory with prediction highlights and reorder buttons
- **Materials** (`/materials`): Raw materials management
- **Smart Scan** (`/scan`): YOLOv8 vision feed with anomaly detection
- **Sales** (`/sales`): Sales transaction history
- **AI Analytics** (`/analytics`): Predictive charts with 7-day forecasts