# SK Project - Youth Council Management System 🐳

A full-stack web application designed specifically for Sangguniang Kabataan (SK) councils to streamline youth programs, community engagement, and administrative processes.

**✨ Fully Dockerized for seamless deployment and development!**

## 🚀 Core Features

### **User & Access Management**
- **Secure Authentication**: Email/password-based login system with bcrypt encryption
- **User Profile Management**: Complete user profiles with image upload support
- **SK Member Management**: Dedicated youth profile system with role assignments

### **Program & Event Management**
- **Program Creation**: Comprehensive program management with objectives, scheduling, and budget allocation
- **Event Calendar**: Interactive calendar for scheduling and managing events
- **Recurring Events**: Support for one-time and recurring event patterns
- **Event Assignment**: Assign members to specific programs and events
- **Status Tracking**: Track program and event status (Ongoing, Completed, Cancelled)

### **Dynamic Form System**
- **Form Builder**: Create custom forms with multiple field types (text, email, phone, etc.)
- **QR Code Generation**: Automatic QR code generation for form access
- **Form Submissions**: Collect and manage form submissions with file uploads
- **GCash Integration**: Support for payment receipts and financial transactions
- **Publish Management**: Draft, publish, and archive form status

### **Content & Communication**
- **Content Management**: Create and manage announcements, news, and events
- **Rich Text Editor**: Advanced text editing with formatting options
- **File Uploads**: Support for multiple file types and image galleries
- **Content Publishing**: Draft, publish, and archive content with featured content support
- **Search & Filter**: Advanced content search and filtering capabilities

### **Location & Mapping**
- **Interactive Maps**: Leaflet-based mapping with location management
- **Location Management**: Add, edit, and manage various location types
- **Route Planning**: Basic route calculation and navigation features
- **Geolocation**: User location detection and mapping integration

### **Financial Management**
- **Budget Tracking**: Budget allocation and monitoring
- **Expense Management**: Track expenses by category with receipt uploads
- **Revenue Tracking**: Monitor income from various sources including GCash
- **Financial Reports**: Detailed budget utilization and financial analytics
- **Expense Categories**: Organized expense tracking (Venue, Materials, Food, etc.)

### **Analytics & Reporting**
- **Dashboard Analytics**: Real-time statistics and key performance indicators
- **Program Analytics**: Track program performance and participation
- **Event Analytics**: Monitor event creation and attendance trends
- **Budget Analytics**: Financial performance and utilization reports
- **Submission Analytics**: Form submission tracking and analysis

### **Technical Features**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **File Management**: Secure file upload and storage system
- **Database Management**: Prisma ORM with MySQL database
- **API Integration**: RESTful API endpoints for all functionality

## 🎯 Problems This Project Solves

### **Youth Council Management Challenges**
- **Manual Process Inefficiency**: Replaces paper-based forms and manual record-keeping with digital automation
- **Communication Gaps**: Bridges communication between youth council members, local government, and community
- **Data Fragmentation**: Centralizes all youth programs, events, and member information in one system
- **Limited Accessibility**: Provides 24/7 access to youth council services and information
- **Resource Tracking**: Eliminates manual budget and resource tracking difficulties

### **Community Engagement Issues**
- **Low Participation**: Increases youth engagement through digital platforms and mobile accessibility
- **Information Dissemination**: Streamlines announcement distribution and event promotion
- **Registration Barriers**: Simplifies program registration and form submission processes
- **Geographic Limitations**: Connects youth across different barangay locations through digital means

### **Administrative Overhead**
- **Document Management**: Organizes and secures important documents and records
- **Compliance Tracking**: Ensures proper documentation for government compliance requirements
- **Resource Allocation**: Optimizes budget and resource distribution through data-driven insights

## 🛠️ Technology Stack

### **Frontend Technologies**
- **Next.js 14**: React framework with App Router for optimal performance and SEO
- **React 18**: Modern React with concurrent features and improved rendering
- **TypeScript**: Type-safe JavaScript development for better code quality
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Radix UI**: Accessible, unstyled UI components for consistent design
- **Lucide Icons**: Beautiful, customizable icon library

### **Backend & Database**
- **Next.js API Routes**: Serverless API endpoints for backend functionality
- **Prisma ORM**: Type-safe database client with automatic migrations
- **MySQL**: Relational database for data persistence
- **Custom Auth Context**: React Context-based authentication system
- **bcryptjs**: Password hashing and security

### **Third-Party Integrations**
- **Leaflet & React-Leaflet**: Interactive maps and location services
- **QRCode**: Dynamic QR code generation for forms
- **File System**: Local file storage and management
- **Geolocation API**: Browser-based location services

### **Development & Deployment**
- **Docker**: Containerization for easy deployment
- **Docker Compose**: Multi-container application orchestration
- **Git**: Version control and collaboration
- **ESLint & Prettier**: Code quality and formatting standards

### **UI & Styling**
- **Tailwind CSS**: Utility-first CSS framework
- **Class Variance Authority**: Component variant management
- **CLSX & Tailwind Merge**: Conditional class name utilities
- **Custom Components**: Reusable UI components built with Radix UI

## 🚧 Development Highlights

### **Technical Achievements**
- **File Upload System**: Built comprehensive file handling system supporting multiple file types and sizes
- **Database Design**: Created well-structured database schema with Prisma ORM and MySQL
- **API Architecture**: Developed RESTful API endpoints for all application functionality
- **Form Management**: Implemented dynamic form builder with QR code generation

### **User Experience Features**
- **Responsive Design**: Mobile-first approach ensuring seamless experience across all devices
- **Interactive Maps**: Integrated Leaflet maps for location management and visualization
- **Dashboard Analytics**: Created comprehensive analytics and reporting system
- **Content Management**: Built rich content management system with file uploads

### **Security Implementation**
- **Authentication System**: Implemented secure email/password authentication with bcrypt
- **Input Validation**: Added form validation to prevent security vulnerabilities

### **Integration Features**
- **Map Integration**: Successfully integrated Leaflet maps for location services
- **QR Code Generation**: Implemented QR code generation for form access
- **File Storage**: Built local file storage system for uploads and media

## 📋 Prerequisites

- **Node.js**: Version 18.17.0 or higher
- **npm**: Version 9.0.0 or higher
- **Docker & Docker Compose**: For containerized deployment
- **Git**: For version control
- **MySQL**: Version 8.0 or higher (if running locally)

## 🚀 Quick Start

### Option 1: 🐳 Docker Setup (Recommended)

The easiest way to run this project is using Docker:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/sk-project.git
cd sk-project

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 3. Start with Docker
docker-compose up -d

# 4. Access the application
# Main App: http://localhost:3001
# Database Admin: http://localhost:8080
```

**That's it! 🎉** Your application is now running with:
- ✅ Next.js application on port 3001
- ✅ MySQL database on port 3307
- ✅ phpMyAdmin on port 8080
- ✅ All dependencies automatically installed
- ✅ Database schema automatically set up

### Option 2: 💻 Local Development Setup

If you prefer to run without Docker:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/sk-project.git
cd sk-project

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your local database configuration

# 4. Set up the database
npx prisma migrate dev
npx prisma db seed

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/sk_project"

# Next.js
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Email (Optional)
EMAIL_HOST="your-smtp-host"
EMAIL_PORT=587
EMAIL_USER="your-email"
EMAIL_PASS="your-password"
```

## 📁 Project Structure

```
sk-project/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes and endpoints
│   │   ├── dashboard/         # Admin dashboard pages
│   │   ├── auth/              # Authentication pages
│   │   ├── forms/             # Public form pages
│   │   └── news/              # Public news and content pages
│   ├── components/            # Reusable React components
│   │   ├── ui/                # Base UI components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── map/               # Map-related components
│   │   └── analytics/         # Analytics and chart components
│   ├── lib/                   # Utility functions and configurations
│   │   ├── services/          # Service layer functions
│   │   └── utils.ts           # Helper utilities
│   └── types/                 # TypeScript type definitions
├── prisma/                    # Database schema and migrations
├── public/                    # Static assets and uploads
│   ├── images/               # Static images
│   └── uploads/              # User-uploaded files
├── scripts/                   # Database scripts and utilities
└── docker-compose.yml         # Docker configuration
```

## 📦 Build & Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t sk-project .

# Run container
docker run -p 3000:3000 sk-project
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma migrate dev` - Run database migrations
- `npx prisma db seed` - Seed database with sample data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for Sangguniang Kabataan councils in the Philippines
- Designed to streamline youth engagement and community programs
- Special thanks to the open-source community for the amazing tools and libraries

## 📞 Support

For support and questions, please open an issue in the GitHub repository or contact the development team.

---

**Made with ❤️ for the Filipino youth community**