# LLM Master - Project Guidelines

## Tech Stack

- **Framework**: React 18 + TypeScript (strict mode)
- **Build**: Vite 5 + Vitest
- **Routing**: React Router v6
- **Styling**: Tailwind CSS 3.4
- **Animation**: Framer Motion (UI) + Manim (math visualizations)
- **Desktop**: Tauri 2
- **Testing**: Vitest + jsdom + Testing Library
- **State**: Zustand
- **Math**: KaTeX
- **Search**: Fuse.js

## Coding Standards

### TypeScript

- **Strict mode enabled** - no `any`, no `@ts-ignore`
- Use explicit types for public APIs
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use `unknown` for external input, then narrow safely
- All functions must have explicit return types

### React

- Use functional components with hooks
- Define props with named interfaces
- Avoid `React.FC` unless necessary
- Use `useCallback` for stable callbacks
- Use `useMemo` for expensive computations

### File Organization

```
src/
├── components/     # Reusable UI components
│   ├── derivation/ # Animation components
│   ├── learning/   # Chapter/Lesson components
│   └── ui/         # Base UI components
├── pages/          # Route pages
├── stores/         # Zustand stores
├── types/          # TypeScript type definitions
├── lib/            # Utilities and content
│   ├── content/    # Chapter/lesson data
│   └── utils/      # Helper functions
└── animations/     # Manim Python scripts
```

### Naming Conventions

- **Components**: PascalCase (e.g., `LessonCard.tsx`)
- **Utilities**: camelCase (e.g., `visualization.ts`)
- **Types**: PascalCase (e.g., `LessonStatus`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_PROGRESS`)

### Testing

- Minimum 80% code coverage
- Use `describe` blocks for grouping
- Use meaningful test names: `should_[behavior]_when_[condition]`
- Mock external dependencies
- Test edge cases and error paths

### Error Handling

```typescript
// Use typed errors
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unexpected error";
}

// Async operations with try-catch
async function loadData(): Promise<Data> {
  try {
    return await fetchData();
  } catch (error) {
    logger.error("Failed to load data", error);
    throw new Error(getErrorMessage(error));
  }
}
```

### Immutability

```typescript
// BAD: Mutation
user.name = "new name";

// GOOD: Immutable update
const updatedUser = { ...user, name: "new name" };
```

## Architecture Patterns

### State Management (Zustand)

```typescript
// Use selectors for performance
const progress = useProgressStore((s) => s.progress);

// Prefer computed selectors
export function useProgressPercent(): number {
  const progress = useProgressStore((s) => s.progress);
  // ... compute
}
```

### Component Structure

```typescript
interface LessonCardProps {
  lesson: Lesson;
  onSelect: (id: string) => void;
}

export function LessonCard({ lesson, onSelect }: LessonCardProps) {
  // Hooks at top
  // Render logic
}
```

## Development Workflow

### Before Each Change

1. Run tests: `npm run test:run`
2. Check types: `npx tsc --noEmit`
3. Lint: `npm run lint`

### After Each Change

1. Fix any lint errors
2. Add/update tests
3. Verify all tests pass
4. Check coverage: `npm run test:coverage`

### Commit Messages

Use conventional commits:

- `feat: add new lesson component`
- `fix: resolve navigation bug`
- `test: add coverage for progress store`
- `refactor: extract visualization utils`

## Key Files

- `src/types/index.ts` - All TypeScript type definitions
- `src/stores/progressStore.ts` - Progress tracking state
- `src/lib/content/chapters.ts` - Curriculum data
- `src/components/derivation/` - Animation components
- `vite.config.ts` - Build and test configuration
