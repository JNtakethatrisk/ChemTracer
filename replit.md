# MicroPlastic Tracker

## Overview

MicroPlastic Tracker is a full-stack web application designed to help users monitor and track their exposure to microplastics from various daily sources. The application provides a comprehensive dashboard for logging weekly exposure data, visualizing trends through charts, and receiving insights about microplastic intake levels. Users can track exposure from sources like bottled water, seafood, plastic-packaged foods, tea bags, and household dust, with the system calculating total particle counts and risk levels based on scientific conversion factors.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints for CRUD operations
- **Development**: Hot reload via Vite middleware integration
- **Error Handling**: Centralized error middleware with status code management

### Data Storage Solutions
- **Database**: PostgreSQL configured via Drizzle ORM
- **Connection**: Neon Database serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations and schema definition
- **Development Storage**: In-memory storage implementation with fallback to database
- **Data Modeling**: Typed schema definitions shared between client and server

### Core Data Model
The application centers around microplastic exposure tracking with the following key entities:
- **MicroplasticEntry**: Records weekly exposure data from 10 different sources
- **Risk Assessment**: Automatic calculation of risk levels (Low/Medium/High) based on particle counts
- **Conversion Factors**: Scientific multipliers to convert consumption units to blood particle concentration

### Calculation Engine
- **Particle Calculation**: Converts user inputs (bottles, servings, etc.) to standardized particle counts per mL of blood
- **Risk Level Assessment**: Categorizes total exposure into three risk tiers with defined thresholds
- **Trend Analysis**: Processes historical data for insights and recommendations

### Authentication and Authorization
Currently implements a simple session-based approach without complex user management, suitable for single-user or demo environments.

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations and schema management

### UI and Component Libraries
- **Radix UI**: Accessible, unstyled UI primitives
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: React charting library for data visualization

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the full stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production builds

### Validation and Forms
- **Zod**: Runtime type validation and schema definition
- **React Hook Form**: Performant form library with minimal re-renders
- **Hookform/Resolvers**: Integration between React Hook Form and Zod

### State Management
- **TanStack Query**: Server state management with caching, background updates, and optimistic updates

### Runtime Environment
- **Replit**: Development and hosting platform with integrated database provisioning
- **Node.js**: JavaScript runtime for server-side execution