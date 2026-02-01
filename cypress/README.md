# Cypress Testing Framework

This directory contains a comprehensive Cypress testing framework organized by test path types for better maintainability, scalability, and clear separation of concerns.

## 🏗️ Architecture

### Test Path Types
The framework organizes tests into six distinct path types:

| Path Type | Description | Focus | Priority |
|-----------|-------------|-------|----------|
| 🟢 **Happy Path** | Normal, expected user flows | Successful operations, typical user journeys | High |
| 🟡 **Sad Path** | Error scenarios handled gracefully | Network issues, slow connections, partial failures | Medium |
| 🔵 **Edge Path** | Boundary conditions and edge cases | Extreme inputs, boundary values, unusual conditions | Medium |
| 🟣 **Alternative Path** | Different ways to accomplish goals | Multiple approaches, user preferences, different workflows | Low |
| 🔴 **Exception Path** | Unexpected errors and system failures | Server errors, system failures, unexpected conditions | High |
| ⚫ **Negative Path** | Invalid inputs and malicious scenarios | Security, input validation, attack prevention | High |

### Directory Structure
```
cypress/
├── component/                    # Component tests
│   ├── ActionCard.cy.tsx
│   ├── GoogleLogin.cy.tsx
│   ├── GitHubRepositorySelector.cy.tsx
│   └── CelebrationModal.cy.tsx
├── e2e/                         # End-to-end tests
│   ├── happy-path/              # Normal user flows
│   ├── sad-path/                # Graceful error handling
│   ├── edge-path/               # Boundary conditions
│   ├── alternative-path/        # Different approaches
│   ├── exception-path/          # System failures
│   ├── negative-path/           # Security scenarios
│   └── test-runner.cy.ts        # Test orchestration
├── fixtures/                    # Test data
│   └── testData.json
├── scripts/                     # Test utilities
│   └── run-tests.js             # Test runner script
├── support/                     # Support files
│   ├── commands.ts
│   ├── e2e.ts
│   └── component.ts
├── test-config.json            # Test configuration
└── README.md                   # This file
```

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Running Tests

#### Basic Commands
```bash
# Run all tests
npm run test

# Run component tests only
npm run test:component

# Run e2e tests only
npm run test:e2e

# Open Cypress UI
npm run cypress:open
```

#### Path-Specific Commands
```bash
# Run specific path types
npm run test:happy              # Happy path tests
npm run test:sad                # Sad path tests
npm run test:edge               # Edge case tests
npm run test:alternative        # Alternative path tests
npm run test:exception          # Exception handling tests
npm run test:negative           # Negative scenario tests
```

#### Feature-Specific Commands
```bash
# Run all tests for specific features
npm run test:landing            # All landing page tests
npm run test:task-generator     # All task generator tests
npm run test:integrations       # All integration tests
npm run test:document-generator # All document generator tests
npm run test:direct-create-tasks # All direct create tasks tests
npm run test:oauth-result       # All OAuth result tests
```

#### Advanced Test Runner
```bash
# Use the advanced test runner
npm run test:runner happy                    # Run happy path tests
npm run test:runner happy landing-page       # Run happy path for landing page
npm run test:runner edge --open              # Open Cypress UI for edge tests
npm run test:runner exception --headed      # Run exception tests in headed mode
npm run test:runner negative --browser chrome # Run negative tests in Chrome
npm run test:runner all                      # Run all tests
npm run test:runner all landing-page         # Run all tests for landing page

# Get help
npm run test:help
```

## 📋 Test Organization

### 1. **Happy Path Tests**
- **Purpose**: Test normal, expected user flows
- **Examples**: Successful navigation, task generation, integration connections
- **Coverage**: 80% of user scenarios

### 2. **Sad Path Tests**
- **Purpose**: Test error scenarios that are handled gracefully
- **Examples**: Slow networks, partial failures, authentication issues
- **Coverage**: 70% of error scenarios

### 3. **Edge Path Tests**
- **Purpose**: Test boundary conditions and edge cases
- **Examples**: Maximum file sizes, extreme inputs, rapid interactions
- **Coverage**: 60% of edge cases

### 4. **Alternative Path Tests**
- **Purpose**: Test different ways to accomplish the same goal
- **Examples**: Multiple authentication methods, different workflows
- **Coverage**: 50% of alternative approaches

### 5. **Exception Path Tests**
- **Purpose**: Test unexpected errors and system failures
- **Examples**: Server errors, network timeouts, system crashes
- **Coverage**: 90% of exception scenarios

### 6. **Negative Path Tests**
- **Purpose**: Test invalid inputs and malicious scenarios
- **Examples**: XSS attacks, SQL injection, malicious uploads
- **Coverage**: 95% of security scenarios

## 🛠️ Development Workflow

### Adding New Tests

#### 1. **New Feature Tests**
```bash
# Create test files for each path type
touch cypress/e2e/happy-path/new-feature.cy.ts
touch cypress/e2e/sad-path/new-feature.cy.ts
touch cypress/e2e/edge-path/new-feature.cy.ts
touch cypress/e2e/alternative-path/new-feature.cy.ts
touch cypress/e2e/exception-path/new-feature.cy.ts
touch cypress/e2e/negative-path/new-feature.cy.ts
```

#### 2. **Test Template**
```typescript
describe('Feature Name - Path Type', () => {
  beforeEach(() => {
    cy.visitWithAuth('/feature-path');
  });

  it('should handle specific scenario', () => {
    // Test implementation
    cy.contains('Expected Content').should('be.visible');
    cy.get('[data-cy="element"]').click();
    cy.url().should('include', '/expected-path');
  });
});
```

#### 3. **Component Tests**
```typescript
import React from 'react';
import ComponentName from '../../src/components/ComponentName';

describe('ComponentName - Path Type', () => {
  const mockProps = {
    // Mock props
  };

  beforeEach(() => {
    cy.mount(<ComponentName {...mockProps} />);
  });

  it('should render correctly', () => {
    cy.get('[data-cy="component"]').should('be.visible');
  });
});
```

### Test Data Management

#### 1. **Fixtures**
```json
{
  "user": {
    "id": "mock-user-id",
    "email": "test@example.com"
  },
  "taskBreakdown": {
    "summary": {
      "number_of_epics": 3,
      "number_of_tasks": 8,
      "total_estimated_hours": 24
    }
  }
}
```

#### 2. **Mocking**
```typescript
// API mocking
cy.intercept('POST', '**/api/tasks/generate', {
  statusCode: 200,
  body: { success: true }
}).as('generateTasks');

// Service mocking
cy.window().then((win) => {
  win.posthog = {
    capture: cy.stub(),
    identify: cy.stub()
  };
});
```

## 🔧 Configuration

### Test Configuration
The `test-config.json` file contains:
- Path type definitions
- Feature mappings
- Coverage targets
- Priority levels
- Script configurations

### Cypress Configuration
The `cypress.config.ts` file configures:
- Base URL for e2e tests
- Component testing setup
- Viewport settings
- Timeout configurations
- Video and screenshot settings

## 📊 Coverage and Reporting

### Coverage Targets
- **Happy Path**: 80%
- **Sad Path**: 70%
- **Edge Path**: 60%
- **Alternative Path**: 50%
- **Exception Path**: 90%
- **Negative Path**: 95%

### Reporting
```bash
# Generate test report
npx cypress run --reporter junit --reporter-options "mochaFile=results/test-results.xml"

# Run with coverage
npx cypress run --env coverage=true
```

## 🐛 Debugging

### Common Issues
1. **Tests failing**: Check network connectivity and API mocks
2. **Slow tests**: Optimize test data and reduce wait times
3. **Flaky tests**: Add proper waits and assertions

### Debug Commands
```bash
# Run with debug output
DEBUG=cypress:* npm run test:e2e

# Run specific test with debug
DEBUG=cypress:* npx cypress run --spec "cypress/e2e/happy-path/landing-page.cy.ts"

# Open Cypress UI for debugging
npm run cypress:open
```

### Debug Tools
- **Cypress UI**: Interactive test runner
- **Video Recording**: Automatic video capture on failure
- **Screenshots**: Automatic screenshots on failure
- **Console Logs**: Detailed logging for debugging

## 🔄 Continuous Integration

### Parallel Execution
```bash
# Run tests in parallel
npx cypress run --parallel --record
```

### CI Configuration
```yaml
# Example GitHub Actions workflow
name: Cypress Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:happy
      - run: npm run test:exception
      - run: npm run test:negative
```

## 📈 Best Practices

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

## 🚨 Security Testing

### Negative Path Tests
The framework includes comprehensive security testing:

- **XSS Prevention**: Tests for script injection
- **SQL Injection**: Tests for database attacks
- **CSRF Protection**: Tests for cross-site request forgery
- **Input Validation**: Tests for malicious inputs
- **File Upload Security**: Tests for malicious file uploads
- **Authentication Security**: Tests for session management
- **Authorization**: Tests for access control

### Security Best Practices
1. **Input Sanitization**: All user inputs are sanitized
2. **Output Encoding**: All outputs are properly encoded
3. **Authentication**: Secure session management
4. **Authorization**: Proper access control
5. **Data Protection**: Sensitive data is protected

## 📚 Resources

### Documentation
- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress Testing Library](https://testing-library.com/docs/cypress-testing-library/intro/)

### Community
- [Cypress Discord](https://discord.gg/cypress)
- [Cypress GitHub](https://github.com/cypress-io/cypress)
- [Cypress Blog](https://www.cypress.io/blog/)

### Tools
- [Cypress Dashboard](https://dashboard.cypress.io/)
- [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app)
- [Cypress Examples](https://example.cypress.io/)

## 🤝 Contributing

### Adding New Tests
1. Choose the appropriate path type
2. Create test file in the correct directory
3. Follow the test template
4. Add proper assertions
5. Update documentation

### Updating Tests
1. Identify the test to update
2. Make the necessary changes
3. Verify the test still passes
4. Update documentation if needed

### Reporting Issues
1. Check existing issues
2. Create a new issue with:
   - Test path type
   - Feature affected
   - Steps to reproduce
   - Expected vs actual behavior

## 📄 License

This testing framework is part of the Bassist project and follows the same license terms.