# SwipeHabit

A modern, mobile-first, swipe-based habit tracker. One habit = one question on a card. You answer by swiping!

## Architecture

Below is the high-level architecture flow of the SwipeHabit application:

```mermaid
flowchart TD
    subgraph Client ["Client (Browser/PWA)"]
        UI[Next.js React Server & Client Components]
        Gestures[Framer Motion - Swipe Engine]
        Charts[Recharts - Analytics]
        
        UI --> Gestures
        UI --> Charts
    end

    subgraph Backend ["Backend as a Service"]
        Supabase[Supabase]
        Auth[Google OAuth (PKCE Flow)]
        DB[(PostgreSQL Database)]
        RLS[Row Level Security]

        Supabase --> Auth
        Supabase --> RLS
        RLS --> DB
    end

    Client -- "Reads/Writes (Anon Key)" --> Supabase
    Auth -- "Validates User Session" --> Client
```

## Features

- **Tinder-Style Swiping**: 
  - Swipe right for Yes 👍
  - Swipe left for No 👎
  - Use the chevron buttons to skip a habit for now (sends it to the back of the deck).
- **Daily Deck**: Swiped habits are removed from the deck for the day. Once all habits are answered, you are greeted with a calming "Done" state.
- **Habit Management**: Add, edit, and organize your daily questions.
- **Analytics Dashboard**: Visualize your habit completion rates with Today, Weekly, Monthly, and Overall views.
- **Secure Authentication**: Google OAuth powered by Supabase with Row Level Security (RLS) to ensure your data stays private.
- **Dark & Light Mode**: Built-in theme toggle that respects your system preferences.

## Tech Stack

- **Framework**: Next.js 15 (App Router) & React 19
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL, RLS, PKCE OAuth)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Date Parsing**: date-fns

## Getting Started

### Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com/) project
- A Google Cloud Console project (for OAuth Keys)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd protocols
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Create a `.env.local` file in the root directory and add your Supabase credentials alongside your Google OAuth Keys:
   ```env
   # Supabase Setup
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Authentication setup
   SUPABASE_JWT_SECRET=your_jwt_secret

   # Google OAuth Keys
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Database Setup:
   Ensure you have created the `habits` and `habit_logs` tables in your Supabase project, along with the appropriate Row Level Security (RLS) policies.

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
