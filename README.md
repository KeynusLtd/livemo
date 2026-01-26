# Livemo Farmer Dashboard

A modern React-based farmer dashboard for managing livestock, health records, sensors, alerts, feed schedules, pastures, marketplace listings, and reports. Built with React, TypeScript, TailwindCSS, Material-UI (shadcn/ui), and React Query for data fetching.

## 🚀 Features

- **Dashboard Overview**: Real-time farm statistics, recent alerts, and revenue metrics
- **Livestock Management**: View and manage animals with filters and pagination
- **Health Monitoring**: Track animal health records, vitals, and analytics
- **Sensor Management**: Monitor farm sensors with real-time readings
- **Alert System**: View, acknowledge, and resolve farm alerts
- **Feed Management**: Schedule and track feeding operations
- **Pasture Management**: Manage paddocks and utilization
- **Marketplace**: List livestock/products and track orders
- **Reports**: Generate health, operations, and financial reports
- **Multi-Farm Support**: Switch between farms with persistent selection

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: TailwindCSS + shadcn/ui (Material Design components)
- **State Management**: Zustand for global farm selection
- **Data Fetching**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Backend API**: Laravel-based REST API (separate repository)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to Livemo Backend API running on configured port

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd livemo/livemo-farmer-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables in `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   VITE_APP_NAME=Livemo Farmer Dashboard
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run type-check

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── Layout.tsx      # Main layout with navigation
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── Animals.tsx
│   ├── Health.tsx
│   ├── Sensors.tsx
│   ├── Alerts.tsx
│   ├── Feed.tsx
│   ├── Pasture.tsx
│   ├── Marketplace.tsx
│   └── Reports.tsx
├── lib/                # API modules and utilities
│   ├── api/           # API endpoint functions
│   └── utils.ts       # Utility functions
├── hooks/              # Custom React hooks
│   └── useActiveFarm.ts
├── stores/             # Zustand stores
│   └── farmStore.ts
├── types/              # TypeScript type definitions
└── App.tsx            # Main app component with routing
```

## 🔐 Authentication

The dashboard integrates with the backend authentication system. Use the seeded demo credentials:

- **Admin**: `admin@livemo.com` / `password`
- **Demo Farmer**: `farmer@livemo.com` / `password`
- **Buyer**: `buyer@livemo.com` / `password`

## 🌐 API Integration

The dashboard connects to the Livemo Backend API at `/api/v1/`. All data is dynamically fetched using React Query with proper loading and error states.

### Key API Endpoints Used

- `/farms` - Farm management and dashboard stats
- `/animals` - Livestock management
- `/health-records` - Health monitoring
- `/sensors` - Sensor management
- `/alerts` - Alert system
- `/feed-schedules` - Feed management
- `/pastures` - Pasture management
- `/marketplace` - Marketplace listings and orders
- `/reports` - Farm reports

## 🎨 UI Components

This project uses shadcn/ui components built on Radix UI primitives:

- Cards, Buttons, Badges, Inputs
- Select, Tabs, Dialog components
- Custom gradient colors for earth/pasture theme
- Responsive design with TailwindCSS

## 🔄 State Management

- **Zustand**: Manages active farm selection with localStorage persistence
- **React Query**: Handles server state, caching, and synchronization
- **Local State**: Component-level state with React hooks

## 🚨 Common Issues & Solutions

### Build Warnings

If you encounter build warnings, check these common issues:

1. **Unused imports**: Remove unused imports to clean up warnings
2. **Missing dependencies**: Ensure all required packages are installed
3. **TypeScript errors**: Run `npm run type-check` to identify issues

### API Connection Issues

1. **Backend not running**: Ensure the Livemo backend is running on the configured port
2. **CORS issues**: Configure CORS in the backend to allow your frontend origin
3. **Environment variables**: Verify `VITE_API_BASE_URL` is correctly set

### Performance Optimization

- React Query automatically caches API responses
- Components use React.memo where appropriate
- Images and assets are optimized

## 📱 Responsive Design

The dashboard is fully responsive:
- **Mobile**: Optimized for screens 320px and up
- **Tablet**: Enhanced layout for 768px and up  
- **Desktop**: Full-featured layout for 1024px and up

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests (if configured)
npm run test:e2e
```

## 📦 Build & Deployment

### Production Build

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deployment

The dashboard can be deployed to any static hosting service:
- Vercel
- Netlify  
- GitHub Pages
- AWS S3 + CloudFront

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m "Add feature"`
4. Push to the branch: `git push origin feature-name`
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing component patterns
- Use TailwindCSS for styling
- Write meaningful commit messages
- Add tests for new features

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter issues:

1. Check this README for common solutions
2. Review the console for error messages
3. Ensure the backend API is accessible
4. Verify environment variables are correctly set
5. Check network connectivity to the API

## 🔄 Version History

- **v1.0.0**: Initial release with full dashboard functionality
- Dynamic data integration for all pages
- Multi-farm support
- Responsive design
- Real-time data fetching

---

**Built with ❤️ for modern farm management**
