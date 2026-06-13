# Next16 MHC9 Elderly Care System

A specialized web application designed for Mental Health Center 9 (MHC9) in Thailand to manage, screen, and track health assistance for the elderly population. This system provides a comprehensive platform for health professionals to conduct screenings (2Q, 9Q, 8Q), manage population data, and generate summary reports.

## Features

- **Role-Based Access Control**: Support for `USER`, `ADMIN`, and `SUPERADMIN` roles.
- **Population Management**: Maintain detailed records of the elderly population, including geographical mapping.
- **Health Screening Tools**: 
  - 2Q (Depression screening)
  - 9Q (Severity of depression)
  - 8Q (Suicide risk assessment)
- **Care & Follow-up Tracking**: Monitor the progress of individuals receiving assistance.
- **Geographical Data Management**: Integrated database of Provinces, Districts, and Subdistricts in Thailand.
- **Hospital/Health Center Integration**: Link users and population data to specific health facilities.
- **Data Visualization**: Interactive dashboards using Recharts to monitor regional performance and screening results.
- **Export Capabilities**: Generate and export reports in PDF format.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database ORM**: [Prisma](https://www.prisma.io/) (MySQL/MariaDB)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (v5)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **PDF Generation**: jsPDF & html2canvas
- **Validation**: Zod

## Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [MariaDB](https://mariadb.org/) or [MySQL](https://www.mysql.com/) database

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd next16-mhc9-elderly
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Prisma Setup**:
   Generate the Prisma client and push the schema to your database.
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Data Import (Optional)**:
   If you have SQL seed files or initial data in the `data/` directory, you can import them into your database.

## Configuration

Create a `.env` file in the root directory and add the following environment variables:

```env
# Database connection
DATABASE_URL="mysql://username:password@localhost:3306/your_database_name"

# NextAuth configuration
NEXTAUTH_SECRET="your-secret-key"
AUTH_URL="http://localhost:3000"
```

## Usage

### Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build for Production
```bash
npm run build
npm start
```

## Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable UI components and layout elements.
- `lib/`: Utility functions, constants, and service layers.
- `prisma/`: Database schema and migration files.
- `data/`: SQL seed files and reference data.
- `public/`: Static assets.

## Coding Standards

- **Indentation**: 4 spaces.
- **Conventions**: Strictly follow the project's established patterns for services and UI components.
- **Authentication**: Routes are protected via `proxy.ts` and NextAuth.js middleware.
