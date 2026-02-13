# Contributing to Croevo AI

Thank you for your interest in contributing to Croevo AI! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB (local or Atlas)
- Git
- A code editor (VS Code recommended)

### Setup Development Environment

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/yourusername/croevo-ai.git
   cd croevo-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Run tests:**
   ```bash
   npm test
   ```

## Development Workflow

### Branch Naming

- `feature/` - New features (e.g., `feature/add-search`)
- `fix/` - Bug fixes (e.g., `fix/login-error`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-module`)

### Making Changes

1. **Create a new branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Write clean, readable code
   - Follow the code style guide (below)
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes:**
   ```bash
   npm test
   npm run dev  # Manual testing
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add password reset functionality
fix(api): resolve CORS issue on content endpoint
docs(readme): update installation instructions
```

## Code Style Guide

### JavaScript

- Use ES6+ features
- Use `const` and `let` instead of `var`
- Use arrow functions for callbacks
- Use template literals for string interpolation
- Use async/await instead of callbacks
- Add JSDoc comments for functions

**Example:**
```javascript
/**
 * Fetch user data from the database
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} User object
 */
const getUserData = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user;
    } catch (error) {
        logger.error('Error fetching user', { error: error.message });
        throw error;
    }
};
```

### HTML/CSS

- Use semantic HTML5 elements
- Use Tailwind CSS utility classes
- Keep inline styles minimal
- Use meaningful class names
- Ensure accessibility (ARIA labels, alt text, etc.)

### File Organization

```
webpage/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── public/          # Static files
├── data/            # Seed data
└── tests/           # Test files
```

## Testing

### Writing Tests

- Write tests for new features
- Update tests when modifying existing features
- Aim for high code coverage
- Test both success and error cases

**Example:**
```javascript
describe('Auth API', () => {
    it('should login with valid credentials', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({ username: 'admin', password: 'password123' });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({ username: 'admin', password: 'wrong' });
        
        expect(response.status).toBe(401);
    });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Run with coverage
npm run test:coverage
```

## Pull Request Process

1. **Update documentation:**
   - Update README.md if needed
   - Update API.md for API changes
   - Add JSDoc comments to new functions

2. **Ensure tests pass:**
   ```bash
   npm test
   ```

3. **Create pull request:**
   - Go to GitHub and create a PR
   - Use a clear, descriptive title
   - Describe what changes you made and why
   - Reference any related issues

4. **PR Template:**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tests pass locally
   - [ ] Added new tests
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No new warnings
   ```

5. **Code review:**
   - Address review comments
   - Make requested changes
   - Re-request review when ready

6. **Merge:**
   - Maintainers will merge approved PRs
   - Delete your branch after merge

## Reporting Bugs

### Before Submitting

- Check if the bug has already been reported
- Verify the bug exists in the latest version
- Collect relevant information (logs, screenshots, etc.)

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node.js version: [e.g., 18.17.0]

**Additional context**
Any other relevant information.
```

## Feature Requests

We welcome feature requests! Please:

1. Check if the feature has already been requested
2. Clearly describe the feature and its benefits
3. Provide examples or mockups if possible
4. Explain why this feature would be useful

## Questions?

- Open a GitHub Discussion for general questions
- Open an issue for bug reports or feature requests
- Check existing documentation first

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (ISC License).

---

Thank you for contributing to Croevo AI! 🚀
