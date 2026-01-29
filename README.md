Topic Coverage Management SystemA comprehensive Next.js application for managing topic and subtopic coverage in academic courses with role-based access control, undo functionality, and real-time tracking.📋 Table of Contents
Features
Tech Stack
Installation
Project Structure
Configuration
API Documentation
Frontend Usage
Security
Testing
Troubleshooting
✨ FeaturesCore Features

✅ Mark topics as covered (automatically marks all subtopics)
✅ Unmark topics (undo functionality)
✅ Mark individual subtopics
✅ Hierarchical subtopic support (multi-level nesting)
✅ Coverage tracking with dates and remarks
✅ Real-time coverage statistics
✅ Role-based access control (TEACHER, HOD, ADMIN)
Security Features

🔒 Authentication and authorization
🔒 Input validation and sanitization
🔒 SQL injection protection (Prisma ORM)
🔒 Transaction safety
🔒 Course-faculty authorization checks
User Experience

🎯 Interactive tree view
🎯 Coverage progress dashboard
🎯 Recent activity tracking
🎯 Confirmation dialogs for destructive actions
🎯 Loading states and error handling
🛠 Tech Stack
Framework: Next.js 14+ (App Router)
Database: MySQL with Prisma ORM
Authentication: NextAuth.js (or JWT)
Styling: Tailwind CSS
Language: JavaScript (ES6+)
📦 InstallationPrerequisites
Node.js 18+ and npm/yarn
MySQL database
Git
Step 1: Clone and Installbash# Clone the repository
git clone <your-repo-url>
cd topic-coverage-system

# Install dependencies
npm install
# or
yarn installStep 2: Environment SetupCreate a .env file in the root directory:env# Database
DATABASE_URL="mysql://username:password@localhost:3306/your_database"

# NextAuth (if using session-based auth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# JWT (if using token-based auth)
JWT_SECRET="your-jwt-secret-here"

# API
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Environment
NODE_ENV="development"Step 3: Database Setupbash# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seedStep 4: Start Development Serverbashnpm run dev
# or
yarn devNavigate to http://localhost:3000📁 Project Structuretopic-coverage-system/
├── app/
│   └── api/
│       ├── topics/
│       │   └── [topicId]/
│       │       └── mark/
│       │           └── route.js          # Topic marking endpoints
│       ├── subtopics/
│       │   └── [subtopicId]/
│       │       └── mark/
│       │           └── route.js          # Subtopic marking endpoints
│       └── courses/
│           └── [courseId]/
│               ├── topics/
│               │   └── coverage/
│               │       └── route.js      # Get topics with coverage
│               └── coverage/
│                   └── summary/
│                       └── route.js      # Coverage statistics
├── components/
│   └── TopicCoverageSystem.jsx          # Main UI component
├── utils/
│   ├── roleguard.js                      # Authentication middleware
│   └── topicCoverageAPI.js               # API helper functions
├── lib/
│   └── prisma.js                         # Prisma client
├── prisma/
│   └── schema.prisma                     # Database schema
├── public/
├── .env                                   # Environment variables
├── package.json
└── README.md⚙️ ConfigurationDatabase ConfigurationYour Prisma schema should be set up according to the provided schema. Key models:
Topic - Course topics
SubTopic - Subtopics (hierarchical)
TopicCoverage - Topic coverage records
SubTopicCoverage - Subtopic coverage records
Faculty - Faculty members
Course - Courses
AcademicYear - Academic year/batch
Authentication SetupOption 1: NextAuth.js (Session-based)Create app/api/auth/[...nextauth]/route.js:javascriptimport NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const faculty = await prisma.faculty.findUnique({
          where: { email: credentials.email },
          include: { facultyRole: true }
        });

        if (!faculty) return null;

        const isValid = await bcrypt.compare(
          credentials.password, 
          faculty.password
        );

        if (!isValid) return null;

        return {
          id: faculty.id,
          email: faculty.email,
          name: faculty.name,
          role: faculty.facultyRole.description
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };Option 2: JWT (Token-based)See utils/roleguard.js for JWT implementation example.📖 API DocumentationEndpointsMethodEndpointDescriptionPOST/api/topics/[topicId]/markMark topic as coveredDELETE/api/topics/[topicId]/markUnmark topic (undo)POST/api/subtopics/[subtopicId]/markMark subtopic as coveredDELETE/api/subtopics/[subtopicId]/markUnmark subtopic (undo)GET/api/courses/[courseId]/topics/coverageGet topics with coverage statusGET/api/courses/[courseId]/coverage/summaryGet coverage statisticsSee API_DOCUMENTATION.md for detailed API documentation with examples.🎨 Frontend UsageBasic Implementationjavascriptimport TopicCoverageSystem from '@/components/TopicCoverageSystem';

export default function CoursePage() {
  return (
    <TopicCoverageSystem
      courseId="CS101"
      facultyId={1}
      semesterId="01"
      academicYearId={1}
    />
  );
}Using the Custom Hookjavascriptimport { useTopicCoverage } from '@/utils/topicCoverageAPI';

function MyComponent() {
  const {
    topics,
    summary,
    loading,
    error,
    markTopic,
    unmarkTopic,
    refresh
  } = useTopicCoverage('CS101', 1, '01', 1);

  // Use the data and functions
}Manual API Callsjavascriptimport { topicCoverageAPI } from '@/utils/topicCoverageAPI';

// Mark a topic
const result = await topicCoverageAPI.markTopic(10, {
  facultyId: 1,
  courseId: 'CS101',
  semesterId: '01',
  academicYearId: 1,
  taughtOn: '2025-01-29',
  remark: 'Covered with examples'
});

if (result.success) {
  console.log('Marked successfully');
}🔒 SecurityImplemented Security Measures
Role-Based Access Control

Only authorized roles can mark/unmark topics
Faculty can only access their assigned courses



Input Validation

All inputs are validated before processing
Type checking and sanitization



Authorization Checks

Verify faculty-course assignments
Verify topic-course relationships



SQL Injection Protection

Using Prisma ORM with parameterized queries



Transaction Safety

Atomic operations with rollback on errors


Best Practices
Always use HTTPS in production
Implement rate limiting
Use environment variables for secrets
Regular security audits
Keep dependencies updated
🧪 TestingManual Testing Checklistbash# Test marking a topic
✓ Topic is marked
✓ All subtopics are automatically marked
✓ Coverage date is recorded
✓ Remark is saved (if provided)

# Test unmarking a topic
✓ Topic coverage is removed
✓ All subtopic coverages are removed
✓ Database transaction is atomic

# Test permissions
✓ Unauthorized users are blocked
✓ Faculty can only access assigned courses
✓ Invalid inputs are rejected

# Test UI
✓ Tree view displays correctly
✓ Coverage status updates in real-time
✓ Modal dialog works properly
✓ Confirmation dialogs appearAutomated Testing (Future)bash# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e🐛 TroubleshootingCommon IssuesIssue: "Faculty not assigned to course"
sql-- Check faculty-course mapping
SELECT * FROM faculty_course_mapping 
WHERE facultyId = 1 AND courseId = 'CS101';

-- Add mapping if missing
INSERT INTO faculty_course_mapping (facultyId, courseId) 
VALUES (1, 'CS101');Issue: "Prisma Client not generated"
bashnpx prisma generateIssue: Database connection fails
bash# Check DATABASE_URL in .env
# Verify MySQL is running
mysql -u username -p

# Test connection
npx prisma db pullIssue: Topics not loading
javascript// Check browser console for errors
// Verify API endpoints are accessible
// Check network tab in DevToolsDebug ModeEnable detailed logging in development:javascript// Add to API routes
console.log('Request data:', req.body);
console.log('User:', session.user);
console.log('Query result:', result);🚀 DeploymentProduction Buildbash# Build the application
npm run build

# Start production server
npm startEnvironment Variables (Production)envDATABASE_URL="mysql://user:pass@production-host:3306/db"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="strong-production-secret"
NODE_ENV="production"Deployment Platforms
Vercel (Recommended for Next.js)
Netlify
AWS
DigitalOcean
📝 LicenseThis project is licensed under the MIT License.👥 Contributors
Your Name
📞 SupportFor issues and questions:

Open an issue on GitHub
Email: your-email@example.com
🗺️ Roadmap
 Bulk mark/unmark operations
 Export coverage reports (PDF, Excel)
 Email notifications
 Analytics dashboard
 Mobile app
 Offline support
 Multi-language support
📚 Additional Resources
Next.js Documentation
Prisma Documentation
Tailwind CSS Documentation
NextAuth.js Documentation
Made with ❤️ for education