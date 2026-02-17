# AMT 3.1 - Academic Topic Coverage Management System

## System Architecture

**Tech Stack**: Next.js 16 (App Router) | Prisma ORM | MySQL/MariaDB | JWT Auth | Tailwind CSS | React 19

This is a role-based academic management system tracking topic/subtopic coverage across courses. Three distinct user types operate in separate auth flows:
- **Admin**: System-wide course/user management
- **Faculty**: Mark topic coverage (roles: TEACHER | HOD with extended visibility)
- **Students**: View assigned courses and coverage progress

**Critical Context**: Academic Year (batch) gates all data - always filter operations by active academic year via `AcademicYear.isActive`.

## Data Model & Relationships

```
User Hierarchy:
├── Admin (admin table) - course/faculty/student management
└── Faculty (faculty table) + Faculty_Role (TEACHER|HOD) - coverage tracking
└── Student (student table) + StudentAcademicYear - enrollment history

Course Structure:
├── Course (course_id) → Department + Semester
└── Topic → SubTopic (hierarchical, self-referential via parentId)
    └── SubTopic.parentId can be NULL (root) or reference another SubTopic

Coverage Tracking:
├── TopicCoverage (topic + faculty + course + semester + academicYear)
└── SubTopicCoverage (subtopic + faculty + course + semester + academicYear)
    └── Both enforce @@unique constraints preventing duplicate coverage
```

**Key Pattern**: Faculty-Course-AcademicYear mapping enforces authorization (`FacultyCourse.academicYearId`). Verify faculty owns course before marking coverage.

## Cross-File Communication

### Authentication Flow
- Login: `/app/api/auth/route.js` validates email + password against role-specific table (admin|faculty|student)
- JWT Token: Issued with payload `{id, email, role}` stored in HTTP-only cookie
- Authorization: `roleGuard(["admin", "faculty"])` middleware validates token before API access
- Password: Bcrypt hashing (10 rounds) via `utils/auth.js`

### Tree Data Handling (Critical)
**Hierarchical Processing Pattern**:
- Use [utils/mark-subtopic-utils.js](utils/mark-subtopic-utils.js) for DFS traversal of SubTopic trees
- `getAllDescendantSubtopicIdsMark()`: Returns all descendant IDs from a parentId (includes multi-level nesting)
- **When marking topic as covered**: Auto-mark all descendant subtopics via `SubTopicCoverage` batch insert
- **When unmarking**: Recursively delete `TopicCoverage` + all `SubTopicCoverage` entries

**Example**: Marking Topic#5 covered → Load all SubTopics where `topicId=5` → Build adjacency map → DFS from null parents → Create coverage records for topic + all descendants.

### API Route Pattern
Routes live in `app/api/{feature}/{route-name}/` with separated concerns:
- `route.js` - HTTP handlers (GET/POST/PUT/DELETE) + error handling
- `*.controller.js` - Business logic calling Prisma (e.g., `course.controller.js`)
- Route handlers catch Prisma errors (P2002=unique, P2025=not found) and return appropriate status codes

**Example structure** [app/api/course/route.js](app/api/course/route.js):
```javascript
export async function GET(req) {
  const guard = await roleGuard(["admin"])(req);
  if (guard) return guard;
  
  try {
    const result = await getAllCourse(); // from controller
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
```

## Frontend Conventions

- **Client Components**: Use `"use client"` at top of `components/` files
- **Data Fetching**: `useState()` + `useEffect()` with `/api/*` calls (no NextAuth, direct fetch)
- **State Management**: Component-local for UI state; rely on API for auth context
- **Confirmation Flow**: Before destructive operations (unmark topic), show dialog with affected subtopic count
- **Tree Rendering**: [components/faculty/TopicTree/TopicTree.jsx](components/faculty/TopicTree/TopicTree.jsx) demonstrates tree navigation + marking with hierarchical effects

## Key Files Reference

| File | Purpose |
|------|---------|
| [prisma/schema.prisma](prisma/schema.prisma) | Complete schema - models, relations, enums (Status, FacultyRoleType, StudentYearStatus) |
| [lib/prisma.ts](lib/prisma.ts) | Singleton Prisma client w/ MariaDB adapter |
| [utils/auth.js](utils/auth.js) | `bcrypt` (hash/compare) + JWT (generate/verify) utilities |
| [utils/roleguard.js](utils/roleguard.js) | Middleware: validates cookie token → checks role allowlist |
| [utils/mark-subtopic-utils.js](utils/mark-subtopic-utils.js) | DFS tree traversal for subtopic hierarchies |
| [utils/zod.js](utils/zod.js) | Schema validation (reference if adding input validation) |
| [app/api/auth/](app/api/auth/) | Login, logout, verify endpoints |
| [app/dashboard/{admin,faculty,student}/](app/dashboard/) | Role-based dashboard entry points |
| [generated/prisma/](generated/prisma/) | Auto-generated Prisma client - **never edit** |

## Development Workflows

### Database Migrations
```bash
npm run prisma:migrate dev -- --name <description>  # Run pending migrations + regenerate client
npm run prisma:studio                               # Visual database browser (http://localhost:5555)
npm run build                                       # Validates Prisma schema
```

### Local Development
```bash
npm run dev    # Next.js dev server on :3000
npm run lint   # ESLint via eslint.config.mjs (TypeScript configs)
```

### Generating Types After Schema Changes
Schema edits → Auto-generated via migrations → Client updates in [generated/prisma/](generated/prisma/)

## Common Pitfalls

1. **Missing Academic Year Filter**: Coverage queries must include `academicYearId` clause; use `AcademicYear.isActive` to find current
2. **Subtopic Deletion Cascade**: Ensure deletes flow through `SubTopic.parentId=null` logic (self-referential, use transactions)
3. **Role Ambiguity**: Faculty with `role=HOD` can see broader data; TEACHER limited to own courses. Check `Faculty.facultyRole` before displaying
4. **Unique Constraint Violations**: `TopicCoverage` + `SubTopicCoverage` already have @@unique - batch upsert carefully
5. **Tree Traversal Edge Cases**: `parentId=null` indicates root subtopic; handle empty trees in DFS

## Writing New Features

- **New API Endpoint**: Validate inputs with Zod ([utils/zod.js](utils/zod.js)), apply `roleGuard()`, separate logic to `*.controller.js`
- **New Tree Operation**: Extend [utils/mark-subtopic-utils.js](utils/mark-subtopic-utils.js) with appropriate DFS variant
- **New Role Permission**: Update Prisma `FacultyRoleType` enum, adjust `roleGuard()` allowlist, add dashboard route
- **New Status Tracking**: Add enum to `schema.prisma`, regenerate via migration, update frontend filters
