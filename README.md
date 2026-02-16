# CoVest - Stock Market Tracking & Analysis Platform

A real-time stock market platform that lets users track stocks, manage personalized watchlists, chat with AI about investments, compete in group leaderboards, and receive daily AI-generated news summaries — all in one place.

---

## Features

### Market Dashboard

- Live market overview powered by TradingView widgets
- Global indices organized by sector (Financial, Technology, Services)
- Interactive stock heatmap visualization
- Top market stories and real-time quotes table

### Stock Search & Details

- Command palette search by symbol or company name
- Detailed stock pages with real-time price data
- Advanced candlestick and baseline charts
- Technical analysis, company profile, and financials

### Personal Watchlist

- Add and remove stocks to a personal watchlist
- Real-time price updates, market cap, and P/E ratio display
- Curated news feed for watchlisted stocks

### AI Stock Chat

- Conversational AI assistant powered by Google Gemini
- Uses live stock data as context for analysis
- Follow-up questions to understand investment goals

### Groups & Leaderboards

- Create private investing groups with invite codes
- Track portfolio positions across group members
- Daily gains leaderboard ranking
- Share group invites via WhatsApp

### Email Notifications

- Personalized AI-generated welcome email on sign-up
- Daily news summary emails at 12:00 UTC via scheduled background jobs
- Content personalized based on each user's watchlist

---

## Tech Stack

| Layer                | Technology                                       |
| -------------------- | ------------------------------------------------ |
| **Framework**        | Next.js 16 (App Router)                          |
| **Language**         | TypeScript                                       |
| **UI**               | React 19, Tailwind CSS 4, Radix UI, Lucide Icons |
| **Database**         | MongoDB with Mongoose                            |
| **Authentication**   | Better Auth (email/password)                     |
| **AI**               | Google Gemini                                    |
| **Stock Data**       | Finnhub API                                      |
| **Charts & Widgets** | TradingView Embedded Widgets                     |
| **Background Jobs**  | Inngest                                          |
| **Email**            | Nodemailer (Gmail SMTP)                          |
| **Forms**            | React Hook Form                                  |
| **Notifications**    | Sonner (toast notifications)                     |

---

## Project Structure

```
stock-market/
├── app/
│   ├── (root)/                # Protected routes (require auth)
│   │   ├── page.tsx           # Home / Dashboard
│   │   ├── [symbol]/page.tsx  # Stock detail page
│   │   ├── watchlist/page.tsx # User watchlist
│   │   └── groups/            # Group pages & leaderboards
│   ├── (auth)/                # Sign-in & Sign-up pages
│   ├── api/                   # API routes (chat, groups, inngest)
│   └── layout.tsx             # Root layout
├── components/                # React components & UI library
├── db/
│   ├── models/                # Mongoose models (Watchlist, Group, GroupMember)
│   └── mongoose.ts            # Database connection
├── hooks/                     # Custom React hooks
├── lib/
│   ├── actions/               # Server actions (auth, watchlist, groups, finnhub)
│   ├── better-auth/           # Auth configuration
│   ├── inngest/               # Background job definitions
│   └── nodemailer/            # Email service & templates
├── types/                     # TypeScript type definitions
└── .env                       # Environment variables
```

---
