# E2E Test Organization

This directory contains end-to-end tests organized by test path types for better maintainability and scalability.

## Directory Structure

```
cypress/e2e/
├── happy-path/           # Normal, expected user flows
│   ├── landing-page.cy.ts
│   ├── task-generator.cy.ts
│   ├── integrations.cy.ts
│   ├── document-generator.cy.ts
│   ├── direct-create-tasks.cy.ts
│   └── oauth-result.cy.ts
├── sad-path/            # Error scenarios that are expected/handled gracefully
│   ├── landing-page.cy.ts
│   ├── task-generator.cy.ts
│   └── integrations.cy.ts
├── edge-path/           # Boundary conditions and edge cases
│   ├── task-generator.cy.ts
│   ├── document-generator.cy.ts
│   └── direct-create-tasks.cy.ts
├── alternative-path/    # Different ways to accomplish the same goal
│   ├── integrations.cy.ts
│   ├── task-generator.cy.ts
│   └── document-generator.cy.ts
├── exception-path/      # Unexpected errors and system failures
│   ├── task-generator.cy.ts
│   ├── integrations.cy.ts
│   └── document-generator.cy.ts
├── negative-path/       # Invalid inputs and malicious scenarios
│   ├── landing-page.cy.ts
│   ├── task-generator.cy.ts
│   └── integrations.cy.ts
└── test-runner.cy.ts    # Runs all test paths
```

## Test Path Types

### 🟢 Happy Path
- **Purpose**: Test normal, expected user flows
- **Focus**: Successful operations, typical user journeys
- **Examples**: 
  - User successfully navigates to task generator
  - User successfully generates tasks
  - User successfully connects to GitHub

### 🟡 Sad Path
- **Purpose**: Test error scenarios that are expected and handled gracefully
- **Focus**: Network issues, slow connections, partial failures
- **Examples**:
  - Slow network connections
  - Partial page loads
  - Browser back/forward navigation
  - Authentication token expiration

### 🔵 Edge Path
- **Purpose**: Test boundary conditions and edge cases
- **Focus**: Extreme inputs, boundary values, unusual conditions
- **Examples**:
  - Very long project descriptions
  - Maximum file size uploads
  - Special characters and Unicode
  - Rapid user interactions

### 🟣 Alternative Path
- **Purpose**: Test different ways to accomplish the same goal
- **Focus**: Multiple approaches, user preferences, different workflows
- **Examples**:
  - Different authentication methods
  - Alternative file upload methods
  - Different platform selections
  - Various integration approaches

### 🔴 Exception Path
- **Purpose**: Test unexpected errors and system failures
- **Focus**: Server errors, system failures, unexpected conditions
- **Examples**:
  - Server 500 errors
  - Network timeouts
  - Database connection failures
  - Memory allocation errors

### ⚫ Negative Path
- **Purpose**: Test invalid inputs and malicious scenarios
- **Focus**: Security, input validation, attack prevention
- **Examples**:
  - XSS attacks
  - SQL injection
  - CSRF attacks
  - Malicious file uploads

## Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Path Types
```bash
# Happy path only
npx cypress run --spec "cypress/e2e/happy-path/**/*.cy.ts"

# Sad path only
npx cypress run --spec "cypress/e2e/sad-path/**/*.cy.ts"

# Edge cases only
npx cypress run --spec "cypress/e2e/edge-path/**/*.cy.ts"

# Alternative paths only
npx cypress run --spec "cypress/e2e/alternative-path/**/*.cy.ts"

# Exception handling only
npx cypress run --spec "cypress/e2e/exception-path/**/*.cy.ts"

# Negative scenarios only
npx cypress run --spec "cypress/e2e/negative-path/**/*.cy.ts"
```

### Run Specific Features
```bash
# All landing page tests
npx cypress run --spec "cypress/e2e/**/landing-page.cy.ts"

# All task generator tests
npx cypress run --spec "cypress/e2e/**/task-generator.cy.ts"

# All integration tests
npx cypress run --spec "cypress/e2e/**/integrations.cy.ts"
```

## Test Organization Principles

### 1. **Separation of Concerns**
- Each path type has its own directory
- Related tests are grouped together
- Clear naming conventions

### 2. **Scalability**
- Easy to add new test paths
- Easy to add new features
- Easy to maintain existing tests

### 3. **Maintainability**
- Clear test structure
- Consistent patterns
- Easy to find specific tests

### 4. **Flexibility**
- Run all tests or specific paths
- Run specific features across all paths
- Easy to add new test scenarios

## Adding New Tests

### 1. **New Feature Tests**
```bash
# Create test files for each path type
touch cypress/e2e/happy-path/new-feature.cy.ts
touch cypress/e2e/sad-path/new-feature.cy.ts
touch cypress/e2e/edge-path/new-feature.cy.ts
# ... etc
```

### 2. **New Path Type**
```bash
# Create new path type directory
mkdir cypress/e2e/new-path-type
touch cypress/e2e/new-path-type/README.md
```

### 3. **Test Structure Template**
```typescript
describe('Feature Name - Path Type', () => {
  beforeEach(() => {
    cy.visitWithAuth('/feature-path');
  });

  it('should handle specific scenario', () => {
    // Test implementation
  });
});
```

## Best Practices

### 1. **Test Naming**
- Use descriptive test names
- Include the path type in the describe block
- Use "should" statements for test descriptions

### 2. **Test Organization**
- Group related tests together
- Use beforeEach for common setup
- Keep tests focused and atomic

### 3. **Test Data**
- Use fixtures for test data
- Mock external dependencies
- Use realistic test scenarios

### 4. **Assertions**
- Use specific assertions
- Test both positive and negative cases
- Verify error messages and states

### 5. **Cleanup**
- Clean up after tests
- Reset state between tests
- Use proper test isolation

## Debugging Tests

### 1. **Run Specific Test**
```bash
npx cypress run --spec "cypress/e2e/happy-path/landing-page.cy.ts"
```

### 2. **Open Cypress UI**
```bash
npm run cypress:open
```

### 3. **Debug Mode**
```bash
DEBUG=cypress:* npm run test:e2e
```

### 4. **Video Recording**
- Videos are saved in `cypress/videos/`
- Screenshots are saved in `cypress/screenshots/`

## Continuous Integration

### 1. **Parallel Execution**
```bash
# Run tests in parallel
npx cypress run --parallel --record
```

### 2. **Test Reporting**
```bash
# Generate test report
npx cypress run --reporter junit --reporter-options "mochaFile=results/test-results.xml"
```

### 3. **Coverage**
```bash
# Run with coverage
npx cypress run --env coverage=true
```

## Troubleshooting

### 1. **Common Issues**
- **Tests failing**: Check network connectivity and API mocks
- **Slow tests**: Optimize test data and reduce wait times
- **Flaky tests**: Add proper waits and assertions

### 2. **Debug Commands**
```bash
# Run with debug output
DEBUG=cypress:* npm run test:e2e

# Run specific test with debug
DEBUG=cypress:* npx cypress run --spec "cypress/e2e/happy-path/landing-page.cy.ts"
```

### 3. **Test Maintenance**
- Regularly update test data
- Review and update assertions
- Remove obsolete tests
- Add new test scenarios as features evolve
