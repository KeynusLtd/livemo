# Contributing to Livemo Farmer Dashboard

Thank you for your interest in contributing! This guide will help you get started.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Access to the Livemo Backend API

### Setup

1. **Fork and clone the repository**
   ```bash
   git clone <your-fork-url>
   cd livemo-farmer-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API configuration
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: All new code must be typed
- **Components**: Use functional components with hooks
- **Styling**: Use TailwindCSS and shadcn/ui components
- **Imports**: Keep imports organized and remove unused ones

### File Organization

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── lib/           # API modules and utilities
├── hooks/         # Custom hooks
├── stores/        # Zustand stores
└── types/         # TypeScript definitions
```

### Component Patterns

```tsx
// Example component structure
import { useState } from "react";
import { Card } from "@/components/ui/card";

interface MyComponentProps {
  title: string;
  data: SomeType[];
}

export function MyComponent({ title, data }: MyComponentProps) {
  const [state, setState] = useState();

  return (
    <Card>
      {/* Component content */}
    </Card>
  );
}
```

## 🔄 API Integration

### Using React Query

```tsx
import { useQuery } from "@tanstack/react-query";
import { getSomeData } from "@/lib/api";

export function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["someData"],
    queryFn: getSomeData,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

### Error Handling

- Always handle loading and error states
- Provide user-friendly error messages
- Use proper TypeScript types for API responses

## 🧪 Testing

### Running Tests

```bash
npm run test          # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Writing Tests

```tsx
import { render, screen } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent title="Test" data={[]} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
```

## 📝 Commit Guidelines

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```
feat(dashboard): add farm selector component
fix(alerts): resolve pagination issue
docs(readme): update installation instructions
```

## 🚀 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the code style guidelines
   - Add tests for new features
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): add your feature"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Fill out the PR template**
   - Describe what you changed
   - Explain why it's needed
   - Include screenshots if applicable

## 🐛 Bug Reports

When reporting bugs, please include:

- **Description**: What happened
- **Steps to reproduce**: How to reproduce the issue
- **Expected behavior**: What should have happened
- **Environment**: Browser, OS, Node version
- **Screenshots**: If applicable

## 💡 Feature Requests

For feature requests:

- **Use case**: Why is this feature needed?
- **Proposed solution**: How should it work?
- **Alternatives**: Other approaches considered
- **Additional context**: Any other relevant info

## 📋 Code Review Checklist

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All imports are used
- [ ] TypeScript types are correct
- [ ] Components are properly tested
- [ ] Documentation is updated
- [ ] No console errors or warnings

### During Review

- [ ] Functionality works as expected
- [ ] Error handling is appropriate
- [ ] Performance is acceptable
- [ ] Accessibility is considered
- [ ] Responsive design works

## 🔧 Common Issues

### Build Warnings

- Remove unused imports
- Fix TypeScript errors
- Update dependencies if needed

### API Issues

- Check API endpoint URLs
- Verify environment variables
- Handle error states properly

### Performance

- Use React Query for caching
- Optimize re-renders
- Use proper keys for lists

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Query](https://tanstack.com/query/latest)

## 🤝 Getting Help

- Check existing issues and PRs
- Ask questions in discussions
- Review the codebase for examples
- Follow the established patterns

---

Thank you for contributing to Livemo Farmer Dashboard! 🚜
