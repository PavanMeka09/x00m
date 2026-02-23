# x00m

A simple video conferencing application built with Next.js, featuring real-time video calls and collaborative sketching.

## Features

- User authentication with NextAuth
- Create and join video meetings
- Real-time 1-on-1 video calls using WebRTC
- Collaborative sketching feature
- Responsive UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Authentication**: NextAuth.js
- **Database**: Prisma with PostgreSQL
- **Real-time Communication**: WebSockets (ws), WebRTC
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Prerequisites

- Node.js (version 18 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd x00m
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   - Create a PostgreSQL database
   - Update the database URL in `prisma/schema.prisma`
   - Run Prisma migrations:
     ```bash
     npx prisma migrate dev
     ```

4. Configure environment variables:
   - Create a `.env.local` file in the root directory
   - Add the following variables:
     ```
     NEXTAUTH_SECRET=your-secret-key
     NEXTAUTH_URL=http://localhost:3000
     DATABASE_URL=your-postgresql-connection-string
     # Add any other required auth provider keys (e.g., Google OAuth)
     ```

5. Start the WebSocket server:
   ```bash
   npm run dev:server  # Assuming you have a script, or run node src/server/index.ts
   ```
   Note: You may need to add a script in `package.json` for the server.

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- Sign in using the login button
- Create a new meeting or join an existing one
- Share the meeting link to invite others
- Use the video call feature for 1-on-1 conversations
- Access the sketch feature for collaborative drawing

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── (auth)/         # Authentication pages
│   ├── (meeting)/      # Meeting-related pages
│   └── components/     # Reusable components
├── lib/                # Utility libraries
└── server/             # WebSocket server
prisma/
└── schema.prisma       # Database schema
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.