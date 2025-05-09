# BrewMe - A Coffee App For Coffee Nerds

![BrewMe Logo](public/brew-me-logo.png)

BrewMe is a comprehensive coffee brewing tracking application designed for coffee enthusiasts who want to perfect their craft. Track your brewing journey, save your favorite recipes, and discover what works best for your taste preferences.

## 🌟 Features

- **Brew Logging**: Record and track all your coffee brewing sessions
- **Brew Profiles**: Create and save detailed brew recipes for consistent results
- **Coffee Database**: Maintain a personal database of coffees with details like origin, roaster, and tasting notes
- **Brewing Devices**: Track which brewing methods work best for different coffees
- **Measurement Integration**: Calculate coffee-to-water ratios for optimal flavor
- **Timeline View**: Visualize your brewing journey over time
- **Favorites**: Save your best brews for easy reference
- **User Profiles**: Personalize your experience with custom settings

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/quincarter/coffee-app.git
   cd coffee-app
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/brewme"
   JWT_SECRET_KEY="your-secret-key"
   NEXT_PUBLIC_UPLOAD_API_URL="/api/upload"
   ```

4. Set up the database:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, DaisyUI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom JWT-based auth
- **Styling**: Tailwind CSS with custom coffee theme
- **Deployment**: Vercel

## 📱 Mobile Support

BrewMe is designed to be fully responsive and works great on mobile devices. The mobile experience includes:

- Bottom navigation for easy access to key features
- Full-screen modals for better form input
- Optimized layouts for smaller screens

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Prisma](https://www.prisma.io/)
- [Vercel](https://vercel.com/)

---

Made with ☕ and ❤️ by coffee enthusiasts
