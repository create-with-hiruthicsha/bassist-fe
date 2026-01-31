import { defineConfig } from 'cypress';
import dotenv from 'dotenv';

// Load environment variables from .env files
dotenv.config();

export default defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'spec, mocha-junit-reporter',
    mochaJunitReporterReporterOptions: {
      mochaFile: 'cypress/results/junit/results-[hash].xml',
      toConsole: false,
      attachments: true,
    },
  },
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    env: {
      DISABLE_POSTHOG: 'true',
      API_BASE_URL: process.env.API_BASE_URL,
      SUPABASE_URL: process.env.TEST_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.TEST_SUPABASE_ANON_KEY,
      // Test user credentials (set via environment variables)
      TEST_USER_EMAIL: process.env.TEST_USER_EMAIL,
      TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD,
      // Test API key for cleanup operations
      TEST_API_KEY: 'test-api-key-for-cleanup'
    },
    video: false,
    videoCompression: 32,
    trashAssetsBeforeRuns: false,
    screenshotsFolder: 'cypress/results/screenshots',
    videosFolder: 'cypress/results/videos',
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 2000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents() {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    supportFile: 'cypress/support/component.ts',
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    indexHtmlFile: 'cypress/support/component-index.html',
  },
});
