# Agile Starter Kit 🚀

This is a premium, feature-rich starter application built with **Vite, React, Tailwind CSS, and Zustand**. It is designed to be the foundation for future apps, featuring AGILE methodology tools.

## Features

- **🎨 Modern Design**: Custom "Fun" color palette (Violet/Cyan/Rose), glassmorphism, and smooth animations.
- **🌗 Dark Mode**: Full system/light/dark toggle support.
- **📋 Backlog Manager**: Sophisticated search, rich task details, and easy "Select/Start" workflow.
- **🏗️ Kanban Board**: Drag-and-drop powered interface (using `@dnd-kit`) to manage task status.
- **📊 Pro Dashboard**: A paid-only view featuring S&P 500 charts, news feed, and "Highlight Task" widgets.
- **🔐 Auth & Payments Simulation**:
  - **Sidebar** reacts to "Logged In" and "Pro" states.
  - **Upgrade Button** simulates Stripe flow.
- **📱 Responsive**: Mobile-ready "Google-style" slide-in sidebar.

## Tech Stack

- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS (PostCSS method with CSS Variables)
- **State Management**: Zustand
- **Database (Ready)**: Prisma + Supabase schema configuration included.
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173).

## simulated Features

- **Log In**: Click "Log In" in the sidebar to simulate user authentication.
- **Upgrade**: Click "Upgrade" to simulate a Stripe subscription and unlock the Dashboard.
- **Theme**: Toggle the sun/moon icon at the bottom of the sidebar.

## 🚧 Development Progress

### ✅ Completed Features
- **📋 Backlog Manager**: Full search functionality, task filtering, and sophisticated search across titles, labels, and descriptions
- **🏗️ Kanban Board**: Complete drag-and-drop interface with @dnd-kit integration for managing task status
- **🔐 Authentication System**: 
  - ✅ Email/password login with Supabase integration
  - ✅ Dedicated sign-up page with email confirmation flow
  - ✅ OAuth integration setup (Google & X/Twitter) - *awaiting provider configuration*
  - ✅ Protected routes and auth state management with Zustand
- **🎨 UI/UX Foundation**: 
  - ✅ Modern design with custom color palette (Violet/Cyan/Rose)
  - ✅ Dark/light/system theme toggle
  - ✅ Responsive mobile-ready sidebar
  - ✅ Glassmorphism effects and smooth animations
- **🏗️ Technical Infrastructure**: 
  - ✅ Vite + React + TypeScript setup
  - ✅ Tailwind CSS configuration with custom design system
  - ✅ Zustand state management for todos and auth
  - ✅ Prisma + Supabase database configuration
  - ✅ Security-first environment variable management

### 🔄 In Progress
- **📊 Dashboard View**: Premium paid view with S&P 500 data and task highlights

### 📋 Next Sprint
- **💳 Stripe Integration**: $5/month subscription system
- **📊 Dashboard Completion**: Weather widgets, news feed, S&P 500 charts
- **📈 Analytics**: Burndown charts and velocity tracking (paid feature)
- **🏢 Multi-Project Support**: Project management for paid users
- **🔍 Advanced Search**: Enhanced filtering and sorting capabilities

## The prompt

I'll be using copilot that is using claude sonnet 4. Let's work on canvasing a list of sequence prompts that build the app. I'll provide the core prompt...

I want to build an app that is a starter for all my other apps. The features:

- Built with vitejs, tailwindcss, stripe, supabase, prisma

- A simple todo manager app that has AGILE methodology for anyone. It has three main views, a todo backlog and a kanban. The kanban needs to be drag and drop, us a common library that uses that. Each todo can be assigned a "label" that is meant for organizing, there can be traditional information attached to it like description, a photo, a due date, the ability to be added to the kanban by setting to "Selected" like in the traditional AGILE format, etc. Have the backlog view, drag and drop too.

- There will be a third view, a dashboard. Where the user can come, see latest news, a nice list with graphs that show the top performers of the S&P 500. The weather if there location is given. If not, weather for a few key places around the world. One main main highlight in the dashboard is the prompting the user of their most important task which is in their "In progress" or the like lane in the kanban.

- The user can search for a todo user words and sophistacated search.

- The dashboard is a paid view too.

- The cost is simple, $5 a month.

- In the future the app will show traditional stats on your burn down and velocity on doing what you need to do, which is a paid feature.

- The app is meant to extend AGILE methodology to everyone.

- The user has a access to a slide in type of menu, commonly used in google pages, that has a list. If the user is logged out, the list is: Log in, Bold Upgrade button which takes you to the appropriate stripe page, About which is just a tooltip that tells the mission of the app, some text about upgrading allows users to create multiple projects and have access to a dashboard. If logged in and not paid, have a spot for an advertisement, have a bold Upgrade button which takes you to the appropriate stripe page, About with the same tool tip information. If logged in and paid, have Log out, About.

- Include in the menu a light, dark and system toggle.

- Try to make fun colors and keep components screen reader accessible friendly, when in doubt, follow best practice.

This should have all the components of a full-stack app.

- User authentication

- User login

- Gated features only enabled if logged in and paid
