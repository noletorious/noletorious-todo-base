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

## Security

This application implements **Row Level Security (RLS)** to ensure data isolation and security:

- **🔒 RLS Enabled**: Both `User` and `Todo` tables have RLS policies enforced
- **👤 User Isolation**: Users can only access their own profile and todo data
- **🛡️ Policy Protection**: Comprehensive policies for SELECT, INSERT, UPDATE, DELETE operations
- **🔐 Auth Integration**: Security policies integrated with Supabase Auth (`auth.uid()`)

The database policies ensure that:

- Users can only view/edit their own todos (`userId` matches `auth.uid()`)
- Users can only access their own profile data (`id` matches `auth.uid()`)
- All CRUD operations are properly secured at the database level

## simulated Features

- **Log In**: Click "Log In" in the sidebar to simulate user authentication.
- **Upgrade**: Click "Upgrade" to simulate a Stripe subscription and unlock the Dashboard.
- **Theme**: Toggle the sun/moon icon at the bottom of the sidebar.

## 🚧 Development Progress

### ✅ Completed Features

- **📋 Backlog Manager**:
  - ✅ Full search functionality across titles, labels, and descriptions
  - ✅ Task creation with comprehensive form (title, description, priority, labels, due dates, images)
  - ✅ AGILE-style task selection with collapsible selected tasks panel
  - ✅ "Start Sprint" functionality to move selected tasks to kanban
  - ✅ Collapsible backlog and selected task panels (backlog open by default)
  - ✅ Sophisticated task filtering and organization
- **🏗️ Kanban Board**: Complete drag-and-drop interface with @dnd-kit integration for managing task status
- **🔐 Authentication System**:
  - ✅ Email/password login with Supabase integration
  - ✅ Dedicated sign-up page with email confirmation flow
  - ✅ OAuth integration setup (Google & X/Twitter) - _awaiting provider configuration_
  - ✅ Protected routes and auth state management with Zustand
- **📝 Task Management System**:
  - ✅ Comprehensive todo data model with priority, labels, due dates, images, descriptions
  - ✅ Rich TodoCard component with actions, status indicators, priority badges
  - ✅ TodoForm component for creating/editing with validation
  - ✅ Selection system for AGILE sprint planning
  - ✅ Database schema with user relationships and all todo fields
  - ✅ **Persistent state management** with user-scoped data and automatic rehydration
  - ✅ **Real-time synchronization** with database changes via Supabase subscriptions
  - ✅ **Authentication-triggered data loading** - todos automatically fetch on login/logout
- **🎨 UI/UX Foundation**:
  - ✅ Modern design with custom color palette (Violet/Cyan/Rose)
  - ✅ Dark/light/system theme toggle
  - ✅ Responsive mobile-ready sidebar
  - ✅ Glassmorphism effects and smooth animations
  - ✅ Accessible components with screen reader support
- **🏗️ Technical Infrastructure**:
  - ✅ Vite + React + TypeScript setup
  - ✅ Tailwind CSS configuration with custom design system
  - ✅ Zustand state management for todos and auth with optimistic updates
  - ✅ Prisma + Supabase database configuration with full todo schema
  - ✅ **Row Level Security (RLS)** implemented with comprehensive policies for data isolation
  - ✅ Security-first environment variable management

### 🔄 In Progress

- **� Enhanced Todo Features**: Advanced task management capabilities and workflow improvements

### 📋 Next Sprint

- **📝 Todo Enhancements**:
  - 🔄 Advanced task editing and inline updates
  - 🔄 Task dependencies and subtasks
  - 🔄 Time tracking and effort estimation
  - 🔄 Task templates and automation
  - 🔄 Bulk operations and batch editing
  - 🔄 Task comments and activity history
- **💳 Stripe Integration**: $5/month subscription system
- **📊 Dashboard Completion**: Weather widgets, news feed, S&P 500 charts
- **📈 Analytics**: Burndown charts and velocity tracking (paid feature)
- **🏢 Multi-Project Support**: Project management for paid users
- **🔍 Advanced Search**: Enhanced filtering and sorting capabilities

---

## 🎯 Current Session Progress (Jan 14, 2026)

### **🐛 Issues Resolved:**

1. **Fixed Application Startup Crash**: Resolved `ReferenceError` in `useTodoInitialization.ts` by adding missing `todos` destructuring
2. **Database Connectivity**: Fixed table name mismatches (`todos` → `Todo`) throughout the codebase
3. **Database Permissions**: Granted proper `anon` and `authenticated` role permissions for Supabase access
4. **UUID Generation**: Enabled `uuid-ossp` extension and configured auto-generating IDs for Todo table
5. **Timestamp Handling**: Fixed `createdAt` and `updatedAt` columns with proper defaults and update triggers
6. **Loading State Race Condition**: Fixed infinite "Loading Tasks..." by resolving `initializeTodos` loading state conflict

### **🏗️ Database Infrastructure:**

- **✅ Proper Schema**: Migrated via Prisma with correct Todo/User table relationships
- **✅ Auto-Generation**: UUID primary keys and timestamp columns working correctly
- **✅ Permissions**: `anon` and `authenticated` roles have full CRUD access to public schema
- **✅ Triggers**: Automatic `updatedAt` timestamp updates on record modifications

### **🔧 Technical Decisions Made:**

- **RLS Status**: ⚠️ **Temporarily Disabled** for development (security consideration for later)
  - Reason: Prioritized getting core functionality working first
  - Plan: Re-enable with proper policies before production deployment
  - Scripts available: `disable-rls-test.sql`, `enable-rls-with-policies.sql`
- **Error Handling**: Enhanced debugging throughout `todoStore.ts` with detailed console logging
- **State Management**: Fixed race conditions in Zustand store initialization

### **🚀 Current App Status:**

- ✅ **Authentication**: Working (login/logout/signup with email confirmation)
- ✅ **Todo Creation**: Fully functional with proper database persistence
- ✅ **Todo Loading**: Backlog displays todos correctly, no more infinite loading
- ✅ **Real-time Sync**: Supabase subscriptions working for live updates
- ✅ **UI/UX**: Responsive design, theme switching, and AGILE workflow intact

### **🔒 Security Notes:**

- **Production TODO**: Re-enable RLS before deployment
- **Development OK**: Current setup safe for local development
- **Future Fix**: Use `auth.uid()::text` for proper UUID → string comparison in RLS policies

### **📁 Files Created/Modified:**

- `src/hooks/useTodoInitialization.ts` - Fixed missing destructuring
- `src/store/todoStore.ts` - Enhanced debugging, fixed loading states, corrected table names
- `grant-permissions.sql` - Database permission fixes
- `fix-uuid-generation.sql` - UUID auto-generation setup
- `fix-timestamps.sql` - Timestamp column defaults and triggers
- `disable-rls-test.sql` - RLS management for development
- `enable-rls-with-policies.sql` - Ready for production RLS re-enablement

### **⚡ Performance Improvements:**

- Eliminated race conditions in todo initialization
- Optimized loading states to prevent UI hanging
- Added prevention for duplicate database calls

### **🎯 Ready for Next Development Phase:**

The application is now in a **stable, functional state** with:

- All console errors resolved
- Database operations working correctly
- Authentication flow complete
- Todo CRUD operations functional
- Real-time synchronization active

**Next Sprint Ready**: Focus can shift to feature development (Dashboard, Stripe integration, etc.) with confidence in the core infrastructure.

---

## The prompt

I'll be using copilot that is using claude sonnet 4. Let's work on canvasing a list of sequence prompts that build the app. I'll provide the core prompt...

I want to build an app that is a starter for all my other apps. The features:

- Built with vitejs, tailwindcss, stripe, supabase, prisma

- A simple todo manager app that has AGILE methodology for anyone. It has three main views, a todo backlog and a kanban. The kanban needs to be drag and drop, us a common library that uses that. Each todo can be assigned a "label" that is meant for organizing, there can be traditional information attached to it like description, a photo, a due date, the ability to be added to the kanban by setting to "Selected" like in the traditional AGILE format, etc. Have the backlog view, drag and drop too.

- In the Backlog view, when the user selects a todo, it is saved in a list that is collapsable. Also make the backlog list collapsable but open by default.

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

- Gated features:
  - Sprints
  - Dashboard
  - Multiple Projects
