# Studio Model Application - Frontend Design

## Technology Stack

**Frontend:**
- **Framework:** SvelteKit (with TypeScript)
- **Styling:** Tailwind CSS
- **State Management:** Svelte stores (built-in)
- **Forms:** Native Svelte bindings

**Backend:**
- **API:** AWS Lambda (TypeScript)
- **Database:** DynamoDB
- **AI Integration:** Anthropic SDK (server-side in Lambda)

## Data Models

### DynamoDB Schema

**Ideas Table:**
- Partition Key: `id` (string)
- Stores ideas with embedded tasks

**Teams Table:**
- Partition Key: `id` (string)
- Stores team with embedded team members

### Idea (with embedded Tasks)
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  ownerIds: string[]; // References to TeamMember IDs
  createdAt: string;
  updatedAt: string;
}

interface Idea {
  id: string;
  teamId: string; // Reference to Team
  name: string;
  hypothesis: string;
  validationStatus: 'first-level' | 'second-level' | 'scaling';
  createdById: string; // Reference to TeamMember ID
  tasks: Task[]; // Embedded tasks array
  createdAt: string;
  updatedAt: string;
}
```

### Team (with embedded TeamMembers)
```typescript
interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[]; // Embedded team members array
  createdAt: string;
  updatedAt: string;
}
```

## Application Structure

```
app/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ideas/
│   │   │   │   ├── IdeaCard.svelte
│   │   │   │   ├── IdeaForm.svelte
│   │   │   │   ├── IdeaList.svelte
│   │   │   │   └── IdeaDetail.svelte
│   │   │   ├── tasks/
│   │   │   │   ├── TaskCard.svelte
│   │   │   │   ├── TaskForm.svelte
│   │   │   │   └── TaskList.svelte
│   │   │   ├── team/
│   │   │   │   ├── TeamMemberCard.svelte
│   │   │   │   └── TeamMemberForm.svelte
│   │   │   └── ui/
│   │   │       ├── Button.svelte
│   │   │       ├── Input.svelte
│   │   │       ├── Select.svelte
│   │   │       └── Modal.svelte
│   │   ├── stores/
│   │   │   ├── ideas.ts
│   │   │   ├── tasks.ts
│   │   │   └── team.ts
│   │   ├── services/
│   │   │   ├── api.ts (Lambda API client)
│   │   │   └── ideas.ts (Ideas API methods)
│   │   │   └── teams.ts (Teams API methods)
│   │   └── types/
│   │       └── index.ts
│   ├── routes/
│   │   ├── +page.svelte (Dashboard/Ideas list)
│   │   ├── ideas/
│   │   │   ├── +page.svelte (Ideas backlog)
│   │   │   ├── new/
│   │   │   │   └── +page.svelte (Create idea form)
│   │   │   └── [id]/
│   │   │       └── +page.svelte (Idea detail)
│   │   └── team/
│   │       └── +page.svelte (Team management)
│   └── app.css (Tailwind imports)
├── static/
├── tailwind.config.js
└── package.json
```

## Key Features & Pages

### 1. Dashboard (Home Page)
**Route:** `/`
**Purpose:** Overview of all ideas grouped by validation status

**Components:**
- Summary statistics (count by validation status)
- Quick access to create new idea
- Recent ideas
- Status board (Kanban-style view)

**Layout:**
```
┌─────────────────────────────────────────┐
│  Studio Model - Ideas Dashboard         │
│  [+ New Idea]                           │
├─────────────────────────────────────────┤
│  Stats:                                 │
│  First Level: 5  Second Level: 3        │
│  Scaling: 2                             │
├─────────────────────────────────────────┤
│  ┌──────────┬──────────┬──────────┐    │
│  │ First    │ Second   │ Scaling  │    │
│  │ Level    │ Level    │          │    │
│  ├──────────┼──────────┼──────────┤    │
│  │ [Card]   │ [Card]   │ [Card]   │    │
│  │ [Card]   │ [Card]   │          │    │
│  └──────────┴──────────┴──────────┘    │
└─────────────────────────────────────────┘
```

### 2. Ideas Backlog
**Route:** `/ideas`
**Purpose:** Full list view of all ideas with filtering/sorting

**Features:**
- Filter by validation status
- Search by name/hypothesis
- Sort by date, status
- Quick actions (edit, view, delete)

### 3. Create Idea Form
**Route:** `/ideas/new`
**Purpose:** Form to create new idea with AI assistance

**Fields:**
- Idea name (text input)
- Hypothesis (textarea)
- Validation status (dropdown)
- [AI Assist] button to refine idea

**AI Integration:**
- User enters basic idea
- Clicks "AI Assist" button
- AI agent helps refine hypothesis and suggests validation approach
- User can accept/edit AI suggestions

**Flow:**
```
1. User fills in basic idea name
2. User writes initial hypothesis
3. User clicks "AI Assist"
4. AI analyzes and suggests:
   - Refined hypothesis statement
   - Initial validation tasks
   - Potential risks/assumptions
5. User reviews, edits, and saves
```

### 4. Idea Detail Page
**Route:** `/ideas/[id]`
**Purpose:** View and manage single idea with tasks

**Sections:**
- Idea header (name, status, metadata)
- Hypothesis statement
- Validation status badge
- Tasks list
- Add task button
- Edit idea button

**Layout:**
```
┌─────────────────────────────────────────┐
│  ← Back to Ideas                        │
│                                         │
│  Idea Name                [Edit]        │
│  Status: First Level                    │
│  Created by: John Doe                   │
│                                         │
│  Hypothesis:                            │
│  [hypothesis text here]                 │
│                                         │
│  Tasks (3)                [+ Add Task]  │
│  ┌─────────────────────────────────┐   │
│  │ □ Task 1         [@Owner]       │   │
│  │ ✓ Task 2         [@Owner]       │   │
│  │ □ Task 3         [@Owners]      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 5. Team Management
**Route:** `/team`
**Purpose:** Manage team members

**Features:**
- List of all team members
- Add new team member form
- Edit/remove team members
- View by role

## State Management

### Ideas Store (`src/lib/stores/ideas.ts`)
```typescript
import { writable } from 'svelte/store';
import { ideasService } from '$lib/services/ideas';
import type { Idea } from '$lib/types';

function createIdeasStore() {
  const { subscribe, set, update } = writable<Idea[]>([]);

  return {
    subscribe,

    // Load ideas from API
    load: async (teamId: string) => {
      const { ideas } = await ideasService.getAll(teamId);
      set(ideas);
    },

    // Create new idea via API
    create: async (data: {
      teamId: string;
      name: string;
      hypothesis: string;
      validationStatus: string;
      createdById: string;
    }) => {
      const { idea } = await ideasService.create(data);
      update(ideas => [...ideas, idea]);
      return idea;
    },

    // Update idea via API
    updateIdea: async (id: string, updates: Partial<Idea>) => {
      const { idea } = await ideasService.update(id, updates);
      update(ideas => ideas.map(i => i.id === id ? idea : i));
      return idea;
    },

    // Delete idea via API
    remove: async (id: string) => {
      await ideasService.delete(id);
      update(ideas => ideas.filter(i => i.id !== id));
    },

    // Task operations
    addTask: async (ideaId: string, task: {
      title: string;
      description?: string;
      ownerIds: string[];
    }) => {
      const { idea } = await ideasService.addTask(ideaId, task);
      update(ideas => ideas.map(i => i.id === ideaId ? idea : i));
      return idea;
    },

    updateTask: async (ideaId: string, taskId: string, taskUpdates: any) => {
      const { idea } = await ideasService.updateTask(ideaId, taskId, taskUpdates);
      update(ideas => ideas.map(i => i.id === ideaId ? idea : i));
      return idea;
    },

    deleteTask: async (ideaId: string, taskId: string) => {
      const { idea } = await ideasService.deleteTask(ideaId, taskId);
      update(ideas => ideas.map(i => i.id === ideaId ? idea : i));
      return idea;
    }
  };
}

export const ideas = createIdeasStore();
```

### Team Store (`src/lib/stores/team.ts`)
```typescript
import { writable } from 'svelte/store';
import { teamsService } from '$lib/services/teams';
import type { Team } from '$lib/types';

function createTeamStore() {
  const { subscribe, set } = writable<Team | null>(null);

  return {
    subscribe,

    // Load team from API
    load: async (id: string) => {
      const { team } = await teamsService.getById(id);
      set(team);
    },

    // Update team
    update: async (id: string, updates: Partial<Team>) => {
      const { team } = await teamsService.update(id, updates);
      set(team);
      return team;
    },

    // Add member
    addMember: async (teamId: string, member: {
      firstName: string;
      lastName: string;
      role: string;
    }) => {
      const { team } = await teamsService.addMember(teamId, member);
      set(team);
      return team;
    },

    // Remove member
    removeMember: async (teamId: string, memberId: string) => {
      const { team } = await teamsService.deleteMember(teamId, memberId);
      set(team);
      return team;
    }
  };
}

export const team = createTeamStore();
```

## API Design

### Lambda Endpoints

**Base URL:** `https://api.{domain}/` (API Gateway)

#### Ideas Endpoints

**GET /ideas**
- Query params: `teamId` (required)
- Returns: Array of ideas for the team
- Response: `{ ideas: Idea[] }`

**GET /ideas/:id**
- Returns: Single idea with all tasks
- Response: `{ idea: Idea }`

**POST /ideas**
- Body: `{ teamId, name, hypothesis, validationStatus, createdById }`
- Returns: Created idea
- Response: `{ idea: Idea }`

**PUT /ideas/:id**
- Body: Partial idea updates
- Returns: Updated idea
- Response: `{ idea: Idea }`

**DELETE /ideas/:id**
- Returns: Success confirmation
- Response: `{ success: boolean }`

**POST /ideas/:id/tasks**
- Body: `{ title, description, ownerIds }`
- Returns: Updated idea with new task
- Response: `{ idea: Idea }`

**PUT /ideas/:id/tasks/:taskId**
- Body: Partial task updates
- Returns: Updated idea
- Response: `{ idea: Idea }`

**DELETE /ideas/:id/tasks/:taskId**
- Returns: Updated idea
- Response: `{ idea: Idea }`

**POST /ideas/ai-assist**
- Body: `{ name, hypothesis }`
- Returns: AI-refined hypothesis and suggestions
- Response: `{ refinedHypothesis: string, suggestedTasks: string[], assumptions: string[] }`

#### Teams Endpoints

**GET /teams/:id**
- Returns: Team with all members
- Response: `{ team: Team }`

**POST /teams**
- Body: `{ name, members }`
- Returns: Created team
- Response: `{ team: Team }`

**PUT /teams/:id**
- Body: Partial team updates (name, members)
- Returns: Updated team
- Response: `{ team: Team }`

**POST /teams/:id/members**
- Body: `{ firstName, lastName, role }`
- Returns: Updated team with new member
- Response: `{ team: Team }`

**DELETE /teams/:id/members/:memberId**
- Returns: Updated team
- Response: `{ team: Team }`

### API Client Service

**API Client** (`src/lib/services/api.ts`)
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, data: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: <T>(endpoint: string, data: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};
```

**Ideas Service** (`src/lib/services/ideas.ts`)
```typescript
import { api } from './api';
import type { Idea } from '$lib/types';

export const ideasService = {
  getAll: (teamId: string) =>
    api.get<{ ideas: Idea[] }>(`/ideas?teamId=${teamId}`),

  getById: (id: string) =>
    api.get<{ idea: Idea }>(`/ideas/${id}`),

  create: (data: {
    teamId: string;
    name: string;
    hypothesis: string;
    validationStatus: string;
    createdById: string;
  }) => api.post<{ idea: Idea }>('/ideas', data),

  update: (id: string, data: Partial<Idea>) =>
    api.put<{ idea: Idea }>(`/ideas/${id}`, data),

  delete: (id: string) =>
    api.delete<{ success: boolean }>(`/ideas/${id}`),

  addTask: (ideaId: string, task: {
    title: string;
    description?: string;
    ownerIds: string[];
  }) => api.post<{ idea: Idea }>(`/ideas/${ideaId}/tasks`, task),

  updateTask: (ideaId: string, taskId: string, data: any) =>
    api.put<{ idea: Idea }>(`/ideas/${ideaId}/tasks/${taskId}`, data),

  deleteTask: (ideaId: string, taskId: string) =>
    api.delete<{ idea: Idea }>(`/ideas/${ideaId}/tasks/${taskId}`),

  aiAssist: (data: { name: string; hypothesis: string }) =>
    api.post<{
      refinedHypothesis: string;
      suggestedTasks: string[];
      assumptions: string[];
    }>('/ideas/ai-assist', data),
};
```

**Teams Service** (`src/lib/services/teams.ts`)
```typescript
import { api } from './api';
import type { Team, TeamMember } from '$lib/types';

export const teamsService = {
  getById: (id: string) =>
    api.get<{ team: Team }>(`/teams/${id}`),

  create: (data: { name: string; members: TeamMember[] }) =>
    api.post<{ team: Team }>('/teams', data),

  update: (id: string, data: Partial<Team>) =>
    api.put<{ team: Team }>(`/teams/${id}`, data),

  addMember: (teamId: string, member: Omit<TeamMember, 'id'>) =>
    api.post<{ team: Team }>(`/teams/${teamId}/members`, member),

  deleteMember: (teamId: string, memberId: string) =>
    api.delete<{ team: Team }>(`/teams/${teamId}/members/${memberId}`),
};
```

## UI Components

### Reusable Components

**Button** (`ui/Button.svelte`)
- Variants: primary, secondary, danger
- Sizes: sm, md, lg
- Tailwind-based styling

**Input** (`ui/Input.svelte`)
- Label support
- Error states
- Help text

**Select** (`ui/Select.svelte`)
- Dropdown for validation status, team members, etc.

**Modal** (`ui/Modal.svelte`)
- For forms and confirmations
- Keyboard navigation (ESC to close)

### Domain Components

**IdeaCard** (`ideas/IdeaCard.svelte`)
- Display idea summary
- Status badge
- Quick actions
- Draggable (for Kanban board)

**IdeaForm** (`ideas/IdeaForm.svelte`)
- Create/edit idea
- AI assist button integration
- Form validation

**TaskCard** (`tasks/TaskCard.svelte`)
- Checkbox for completion
- Owner avatars
- Inline editing

## Styling Approach

### Tailwind Configuration
```javascript
// tailwind.config.js
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'studio': {
          'first': '#3B82F6',    // blue
          'second': '#8B5CF6',   // purple
          'scaling': '#10B981',  // green
        }
      }
    }
  }
}
```

### Design Tokens
- Validation statuses have distinct colors
- Consistent spacing using Tailwind scale
- Typography scale for hierarchy
- Accessible color contrast

## Backend Architecture

### Lambda Functions

**Ideas Lambda** (`lambda/ideas/`)
- Handles all ideas and tasks operations
- Integrates with DynamoDB Ideas table
- Includes AI assist endpoint with Anthropic SDK

**Teams Lambda** (`lambda/teams/`)
- Handles team and team member operations
- Integrates with DynamoDB Teams table

### DynamoDB Configuration

**Ideas Table:**
```
TableName: studio-ideas
PartitionKey: id (String)
Attributes:
  - id: string
  - teamId: string (GSI partition key)
  - name: string
  - hypothesis: string
  - validationStatus: string
  - createdById: string
  - tasks: list (embedded)
  - createdAt: string
  - updatedAt: string

GlobalSecondaryIndex:
  IndexName: team-index
  PartitionKey: teamId
  ProjectionType: ALL
```

**Teams Table:**
```
TableName: studio-teams
PartitionKey: id (String)
Attributes:
  - id: string
  - name: string
  - members: list (embedded)
  - createdAt: string
  - updatedAt: string
```

### Infrastructure as Code

Use AWS CDK or Serverless Framework to define:
- Lambda functions
- API Gateway
- DynamoDB tables
- IAM roles and permissions
- Environment variables (API keys)

## Development Phases

### Phase 1: Backend Infrastructure
- [ ] Set up AWS account and configure credentials
- [ ] Create DynamoDB tables (Ideas, Teams)
- [ ] Implement Lambda functions for Ideas endpoints
- [ ] Implement Lambda functions for Teams endpoints
- [ ] Set up API Gateway
- [ ] Configure CORS for frontend access
- [ ] Deploy backend infrastructure
- [ ] Test endpoints with Postman/Insomnia

### Phase 2: Frontend Core (without AI)
- [ ] Initialize SvelteKit project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up project structure
- [ ] Create data models and types
- [ ] Implement API client service
- [ ] Create basic UI components (Button, Input, Select, Modal)
- [ ] Build stores for state management
- [ ] Implement team management page
- [ ] Build dashboard with idea cards
- [ ] Create idea form (basic, no AI)
- [ ] Build idea detail page with tasks
- [ ] Implement task CRUD operations

### Phase 3: AI Integration
- [ ] Add Anthropic SDK to Lambda
- [ ] Implement AI assist endpoint
- [ ] Integrate AI assist in idea form UI
- [ ] Refine prompt engineering
- [ ] Handle AI responses and errors gracefully
- [ ] Add loading states for AI operations

### Phase 4: Enhanced UX
- [ ] Implement drag-and-drop Kanban board
- [ ] Add filtering and search
- [ ] Keyboard shortcuts
- [ ] Smooth animations and transitions
- [ ] Mobile responsive design
- [ ] Error boundaries and better error handling
- [ ] Optimistic updates for better perceived performance

### Phase 5: Production Ready
- [ ] Add authentication (Cognito or Auth0)
- [ ] Implement authorization (team-based access)
- [ ] Add comprehensive error logging
- [ ] Performance optimization
- [ ] Security audit
- [ ] Deploy frontend to S3/CloudFront or Vercel
- [ ] Set up monitoring and alerts
- [ ] Write user documentation

## Testing Strategy

**Unit Tests:** Vitest for stores and utilities
**Component Tests:** Svelte Testing Library
**E2E Tests:** Playwright (later phase)

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus management
- Screen reader friendly

## Performance Targets

- Initial load: < 2s
- Route transitions: < 100ms
- Form interactions: immediate feedback
- Bundle size: < 100kb (gzipped)

---

**Version:** 1.0
**Status:** Draft
**Next Steps:** Review and approval before implementation
