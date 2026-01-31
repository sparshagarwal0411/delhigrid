# **CleanWard - Ward-Wise Pollution Awareness & Action Dashboard**

A comprehensive web application for monitoring and managing pollution data across Delhi's 250 wards. Built as a Government of NCT of Delhi initiative, CleanWard empowers citizens and authorities with real-time pollution data, educational resources, and actionable steps for cleaner communities.

## 🌟 Features

- **User Authentication**: Secure registration and login system with Supabase Auth
- **User Profiles**: Store user information including ward number, demographics, and preferences
- **Ward Mapping**: Interactive map showing all 250 wards of Delhi with color-coded pollution levels
- **Real-time Data**: Integration with pollution monitoring APIs (WAQI/OpenAQ) via Supabase Edge Functions
- **AI Assistant**: Smart conversational AI powered by ElevenLabs to guide users and answer queries
- **Traffic Analysis**: Real-time traffic congestion monitoring and visualization via Google Maps
- **Community Engagement**: Tools for volunteering, NGO registration, and social sharing
- **Ward Profiles**: Detailed information for each ward including:
  - Pollution breakdown (Air, Water, Waste, Noise)
  - Pollution sources identification
  - Educational content
  - Actionable recommendations
- **Personalized Dashboards**: 
  - Citizen Dashboard displays user's specific ward information
  - Authority Dashboard for government officials
- **Search & Filter**: Search wards by name or number, filter by zones
- **Theme Support**: Light and dark theme options
- **Responsive Design**: Mobile-first design that works on all devices

## 🛠️ Tech Stack

### Frontend
- **Framework & Language**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Routing**: [React Router 6](https://reactrouter.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/)
- **Components & UI**:
  - [Radix UI](https://www.radix-ui.com/) (Accordion, Dialog, Tabs, etc.)
  - [Lucide React](https://lucide.dev/) (Icons)
  - [Embla Carousel](https://www.embla-carousel.com/)
  - [Vaul](https://vaul.emilkowal.ski/) (Drawers)
  - [Sonner](https://sonner.emilkowal.ski/) (Toasts)
- **State Management & Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Interactive Maps**: [Google Maps Platform](https://developers.google.com/maps) (Maps JavaScript API & Traffic Layer)
- **AI Integration**: [ElevenLabs ConvAI](https://elevenlabs.io/docs/conversational-ai/overview) (Smart Assistant)
- **Visual Effects**: [React Snowfall](https://github.com/cahilfoley/react-snowfall)

### Backend & Infrastructure
- **BaaS**: [Supabase](https://supabase.com/)
  - **Authentication**: Secure user management and login
  - **PostgreSQL Database**: Persistent storage with Row Level Security (RLS)
  - **Edge Functions**: Serverless logic for external API integration (WAQI/OpenAQ)
- **Hosting**: [Vercel](https://vercel.com/) (configured via `vercel.json`)

### Development Tools
- **Package Manager**: [npm](https://www.npmjs.com/) / [Bun](https://bun.sh/)
- **Linting & Formatting**: [ESLint](https://eslint.org/), [PostCSS](https://postcss.org/), [Autoprefixer](https://github.com/postcss/autoprefixer)
- **Environment**: `.env` for secure credential management

### APIs Used
- **Google Maps JavaScript API**: For interactive ward mapping and traffic data
- **ElevenLabs API**: For the conversational AI assistant widget
- **WAQI (World Air Quality Index) API**: Real-time air quality data
- **OpenAQ API**: Historical and real-time air quality data integration

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project (required for authentication)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cleanward
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase Backend**
   
   **Important**: Supabase is required for user authentication and data storage.
   
   a. Create a Supabase project at [supabase.com](https://supabase.com)
   
   b. Run the database migrations:
      - Go to Supabase Dashboard → SQL Editor
      - Run `supabase/migrations/20240101000000_create_users_table.sql`
      - Run `supabase/migrations/20240101000001_fix_rls_policy.sql`
   
   c. Get your Supabase credentials:
      - Go to Settings → API
      - Copy your Project URL and anon/public key
   
   d. Create a `.env` file in the root directory:
      ```env
      VITE_SUPABASE_URL=your_supabase_project_url
      VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
      VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
      ```
   
   > 📖 **Detailed instructions**: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for step-by-step setup guide.

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:8080`

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
cleanward/
├── public/                 # Static assets
│   └── documents/         # PDF documents (ward maps, etc.)
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── DelhiMap.tsx  # Main map component
│   │   ├── WardCard.tsx  # Ward card display
│   │   └── ...
│   ├── pages/            # Route pages
│   │   ├── Index.tsx     # Landing page
│   │   ├── MapPage.tsx   # Map view
│   │   ├── WardProfile.tsx # Individual ward details
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   │   └── usePollutionData.ts # Pollution data fetching
│   ├── data/             # Static data
│   │   └── wards.ts      # Ward data definitions
│   ├── integrations/     # Third-party integrations
│   │   └── supabase/     # Supabase client & types
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript type definitions
├── supabase/
│   ├── migrations/       # Database migrations
│   │   ├── 20240101000000_create_users_table.sql # Users table schema
│   │   └── 20240101000001_fix_rls_policy.sql # RLS policy fixes
│   ├── functions/        # Supabase Edge Functions
│   │   └── fetch-pollution-data/ # Pollution data API
│   └── config.toml       # Supabase configuration
└── package.json
```

## 🗺️ Routes

- `/` - Landing page with hero section and overview
- `/map` - Interactive ward map view
- `/ward/:id` - Individual ward profile page
- `/auth` - Authentication page (login/registration)
  - **Registration**: Collects user info (name, email, phone, age, sex, gender, ward number)
  - **Login**: Authenticates users and redirects to appropriate dashboard
- `/citizen` - Citizen dashboard (requires authentication)
  - Displays personalized ward information based on user's registered ward number
  - Shows pollution data, goals, educational content, and action steps
- `/authority` - Authority dashboard (requires admin authentication)

## 🔐 Authentication & User Management

The app uses Supabase Auth for user authentication and stores user profiles in a `users` table.

### User Registration
During registration, users provide:
- Personal information (name, email, phone, age)
- Demographics (sex, gender)
- **Ward number** (1-250) - This is used to personalize their dashboard

### User Dashboard
After login, users are redirected to the Citizen Dashboard which:
- Fetches their ward number from the database
- Displays their specific ward's pollution data
- Shows personalized goals and recommendations

### Database Schema
User data is stored in the `users` table with Row Level Security (RLS) enabled, ensuring users can only access their own data.

## 🎨 Customization

### Theme Colors
The app uses a custom color scheme defined in `tailwind.config.ts`. You can customize colors by modifying the theme configuration.

### Adding New Wards
Ward data is generated in `src/data/wards.ts`. Modify the `generateWards()` function to add or update ward information.

## 🔧 Configuration

### Supabase Setup (Required)

**Quick Setup:**
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run both database migrations in order:
   - `supabase/migrations/20240101000000_create_users_table.sql` (creates users table)
   - `supabase/migrations/20240101000001_fix_rls_policy.sql` (fixes RLS policies for registration)
3. Add your Supabase credentials to `.env` file
4. Enable Email authentication in Supabase dashboard (Settings → Authentication → Providers)

**Optional:**
- Deploy the Edge Function from `supabase/functions/fetch-pollution-data/` for real-time pollution data

For detailed step-by-step instructions, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## 📝 Data Sources

- **User Data**: Stored in Supabase `users` table (authentication and profiles)
- **Ward Data**: Static ward data generated in `src/data/wards.ts`
- **Real-time Data**: WAQI API and OpenAQ API (via Supabase Edge Functions when configured)
- **Ward Map**: PDF map available in `public/documents/delhi-ward-map.pdf`

## 🐛 Troubleshooting

### Registration Issues
- **"Invalid API key"**: Check your `.env` file and restart the dev server
- **"new row violates row-level security policy"**: Make sure you've run both migration files in order
- **"User already registered"**: Email already exists, try logging in instead

### Setup Issues
- **"Supabase Not Configured"**: Create `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **Database errors**: Ensure both migration files have been run in Supabase SQL Editor

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed troubleshooting guide.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of a Government of NCT of Delhi initiative.

## 🙏 Acknowledgments

- Delhi Government for the initiative
- Supabase for backend infrastructure
- WAQI and OpenAQ for pollution data APIs
- shadcn/ui for the component library

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Built with ❤️ for a cleaner Delhi**


