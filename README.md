# Gharkhoj Frontend

A React-based rental property platform frontend with role-based dashboards for Admin, Landlord, and Tenant users.

## Features

- User authentication (login, register, OTP verification)
- Role-based access control
- Admin dashboard for managing users and listings
- Landlord dashboard for creating and managing properties
- Tenant dashboard for browsing and favoriting properties
- Real-time messaging system
- Advanced search and filters
- Responsive design with Tailwind CSS

## Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Create `.env` file:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Update environment variables with your backend URL

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Project Structure

\`\`\`
src/
├── api/              # API configuration and axios
├── components/       # Reusable components
├── hooks/           # Custom React hooks
├── pages/           # Page components
│   ├── admin/       # Admin pages
│   ├── landlord/    # Landlord pages
│   ├── tenant/      # Tenant pages
│   └── auth/        # Authentication pages
├── stores/          # Zustand stores
├── utils/           # Utility functions
├── App.jsx          # Main app component
└── index.css        # Global styles
\`\`\`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests

## Color Scheme

- Primary: #4F46E5 (Indigo 600)
- Secondary: #6366F1 (Indigo 500)
- Accent: #FBBF24 (Amber 400)
- Background: #F9FAFB (Gray 50)
- Text: #111827 (Gray 900)

## Technologies

- React 18
- React Router DOM 6
- Tailwind CSS 3
- Zustand for state management
- Axios for HTTP requests
- Socket.IO for real-time messaging
- Lucide React for icons

## License

MIT
