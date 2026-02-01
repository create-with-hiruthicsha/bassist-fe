# Cypress Real API Testing Setup

This guide explains how to set up Cypress tests with real API calls to the backend, using a separate test database.

## 🏗️ Architecture

### Test Environment
- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Backend**: `http://localhost:5090` (Node.js API with test database)
- **Database**: Separate test database (`your_db_name_test`)
- **Supabase**: Separate test Supabase project

### Environment Configuration
- **NODE_ENV**: `cypress-testing`
- **Database**: Uses test database to avoid affecting production data
- **Supabase**: Uses test Supabase project to avoid affecting production auth
- **Authentication**: Real Supabase authentication (test project)
- **API Calls**: All API calls go to real backend

## 🚀 Setup Instructions

### 1. Backend Setup

#### Create Test Database
```sql
-- Connect to your PostgreSQL instance
CREATE DATABASE your_database_name_test;
```

#### Add Test Database Configuration
Add to your Infisical secrets or `.env`:
```env
PG_TEST_DATABASE=your_database_name_test
```

#### Add Test Supabase Configuration
Add to your Infisical secrets or `.env`:
```env
# Test Supabase project (separate from production)
SUPABASE_TEST_URL=https://your-test-project.supabase.co
SUPABASE_TEST_ANON_KEY=your_test_anon_key
SUPABASE_TEST_SERVICE_ROLE_KEY=your_test_service_role_key
```

#### Run Backend in Test Mode
```bash
# Development mode
cd ../bassist
npm run cypress:test

# Or production build
npm run cypress:test:build
```

### 2. Frontend Setup

#### Start Frontend
```bash
# In bassist-client-ui directory
npm run dev
```

### 3. Run Cypress Tests

#### Start Backend First
```bash
# Terminal 1 - Backend
cd ../bassist
npm run cypress:test
```

#### Start Frontend
```bash
# Terminal 2 - Frontend
npm run dev
```

#### Run Tests
```bash
# Terminal 3 - Tests
npm run test:e2e
```

## 🔧 Configuration Details

### Backend Configuration (`bassist/`)

#### Environment Detection
The backend automatically detects `NODE_ENV=cypress-testing` and:
- Uses test database (`PG_TEST_DATABASE`)
- Enables test-specific logging
- Configures CORS for test environment

#### Database Configuration
```typescript
// In envLoader.ts
db: {
  PG_HOST: getSecret('PG_HOST'),
  PG_PORT: getSecretAsNumber('PG_PORT'),
  PG_USER: getSecret('PG_USER'),
  PG_PASSWORD: getSecret('PG_PASSWORD'),
  PG_DATABASE: getSecret('PG_DATABASE'),
  // Use test database for Cypress testing environment
  ...(getSecret('NODE_ENV') === 'cypress-testing' && {
    PG_DATABASE: getSecret('PG_TEST_DATABASE', getSecret('PG_DATABASE') + '_test')
  })
}
```

#### Supabase Configuration
```typescript
// In envLoader.ts
applicationIntegrations: {
  SUPABASE_URL: getSecret('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getSecret('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: getSecret('SUPABASE_SERVICE_ROLE_KEY'),
  // Use test Supabase project for Cypress testing environment
  ...(getSecret('NODE_ENV') === 'cypress-testing' && {
    SUPABASE_URL: getSecret('SUPABASE_TEST_URL', getSecret('SUPABASE_URL')),
    SUPABASE_ANON_KEY: getSecret('SUPABASE_TEST_ANON_KEY', getSecret('SUPABASE_ANON_KEY')),
    SUPABASE_SERVICE_ROLE_KEY: getSecret('SUPABASE_TEST_SERVICE_ROLE_KEY', getSecret('SUPABASE_SERVICE_ROLE_KEY'))
  })
}
```

### Frontend Configuration (`bassist-client-ui/`)

#### Cypress Configuration
```typescript
// cypress.config.ts
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    env: {
      DISABLE_POSTHOG: 'true',
      API_BASE_URL: 'http://localhost:5090'
    }
  }
});
```

#### No API Mocking
- All API calls go to real backend
- Real authentication with Supabase
- Real database operations
- Only PostHog is disabled to prevent analytics

## 📋 Test Execution

### Manual Testing
```bash
# 1. Start backend in test mode
cd ../bassist
npm run cypress:test

# 2. Start frontend
cd ../bassist-client-ui
npm run dev

# 3. Run tests
npm run test:e2e
```

### Automated Testing
```bash
# Run all tests
npm run test

# Run specific path types
npm run test:happy
npm run test:sad
npm run test:edge
npm run test:alternative
npm run test:exception
npm run test:negative

# Run specific features
npm run test:landing
npm run test:task-generator
npm run test:integrations
```

## 🗄️ Database Management

### Test Database Isolation
- **Production DB**: `your_database_name`
- **Test DB**: `your_database_name_test`
- **Complete isolation**: No risk of affecting production data

### Test Supabase Isolation
- **Production Supabase**: Your main Supabase project
- **Test Supabase**: Separate test Supabase project
- **Complete isolation**: No risk of affecting production auth/users

### Database Cleanup
```sql
-- Clean test database between test runs
TRUNCATE TABLE your_tables CASCADE;
```

### Database Seeding
```sql
-- Add test data for consistent testing
INSERT INTO users (id, email, name) VALUES 
('test-user-1', 'test1@example.com', 'Test User 1'),
('test-user-2', 'test2@example.com', 'Test User 2');
```

## 🔐 Authentication

### Real Supabase Authentication
- Tests use real Supabase authentication
- No mocking of auth tokens
- Real user sessions and permissions
- Tests actual auth flows

### Test User Setup
```typescript
// Create test users in TEST Supabase project
const testUsers = [
  {
    email: 'cypress-test@example.com',
    password: 'test-password-123',
    name: 'Cypress Test User'
  }
];
```

### Supabase Test Project Setup
1. **Create Test Project**: Create a new Supabase project for testing
2. **Configure Auth**: Set up authentication settings for test environment
3. **Create Test Users**: Add test users to the test Supabase project
4. **Configure RLS**: Set up Row Level Security policies for test data

## 🚨 Troubleshooting

### Common Issues

#### 1. Backend Not Starting
```bash
# Check if port 5090 is available
netstat -an | grep 5090

# Check backend logs
cd ../bassist
npm run cypress:test
```

#### 2. Database Connection Issues
```bash
# Verify test database exists
psql -h localhost -U your_user -d your_database_name_test

# Check database permissions
GRANT ALL PRIVILEGES ON DATABASE your_database_name_test TO your_user;
```

#### 3. Authentication Issues
```bash
# Check Supabase configuration
# Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
# Ensure test users exist in Supabase
```

#### 4. CORS Issues
```bash
# Check backend CORS configuration
# Ensure localhost:5173 is in allowed origins
```

### Debug Commands
```bash
# Check backend health
curl http://localhost:5090/test

# Check frontend
curl http://localhost:5173

# Check database connection
psql -h localhost -U your_user -d your_database_name_test -c "SELECT 1;"
```

## 📊 Benefits of Real API Testing

### 1. **True Integration Testing**
- Tests real API endpoints
- Tests real database operations
- Tests real authentication flows
- Tests real error handling

### 2. **Catch Real Issues**
- API changes break tests (good!)
- Database schema changes are caught
- Authentication issues are detected
- Performance issues are identified

### 3. **No Mock Maintenance**
- No need to update mocks when APIs change
- No mock drift from real implementation
- Tests always reflect current API behavior

### 4. **Realistic Test Data**
- Uses real database constraints
- Tests real data validation
- Tests real business logic
- Tests real error scenarios

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Cypress Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: bassist_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd bassist && npm install
      - run: cd bassist && npm run cypress:test:build
      - run: cd bassist-client-ui && npm install
      - run: cd bassist-client-ui && npm run test:e2e
```

## 📝 Best Practices

### 1. **Test Data Management**
- Use consistent test data
- Clean database between test runs
- Use realistic test scenarios
- Test edge cases with real data

### 2. **Test Isolation**
- Each test should be independent
- Clean up after each test
- Use unique test data
- Avoid test dependencies

### 3. **Error Handling**
- Test real error scenarios
- Test network failures
- Test authentication failures
- Test validation errors

### 4. **Performance Testing**
- Test with real data volumes
- Test API response times
- Test database performance
- Test concurrent operations

## 🎯 Next Steps

1. **Set up test database**
2. **Configure backend for test environment**
3. **Run initial tests**
4. **Add test data seeding**
5. **Set up CI/CD pipeline**
6. **Monitor test performance**
7. **Add more test scenarios**

This setup provides comprehensive integration testing with real API calls while maintaining data isolation and test reliability.
