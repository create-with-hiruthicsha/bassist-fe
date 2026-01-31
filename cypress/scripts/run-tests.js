#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load test configuration
const configPath = path.join(__dirname, '..', 'test-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Parse command line arguments
const args = process.argv.slice(2);
const pathType = args[0];
const feature = args[1];
const options = args.slice(2);

// Available path types
const pathTypes = Object.keys(config.testPaths);
const features = Object.keys(config.features);

// Help function
function showHelp() {
  console.log(`
Cypress Test Runner

Usage:
  node run-tests.js <path-type> [feature] [options]

Path Types:
  ${pathTypes.map(type => `  ${type.padEnd(12)} - ${config.testPaths[type].description}`).join('\n')}

Features:
  ${features.map(feature => `  ${feature.padEnd(20)} - ${config.features[feature].description}`).join('\n')}

Options:
  --open              Open Cypress UI
  --headed            Run in headed mode
  --browser <name>    Specify browser (chrome, firefox, edge, electron)
  --record            Record test run
  --parallel          Run tests in parallel
  --reporter <name>    Specify reporter (spec, json, junit, etc.)

Examples:
  node run-tests.js happy                    # Run all happy path tests
  node run-tests.js happy landing-page       # Run happy path tests for landing page
  node run-tests.js edge --open              # Open Cypress UI for edge tests
  node run-tests.js exception --headed      # Run exception tests in headed mode
  node run-tests.js negative --browser chrome # Run negative tests in Chrome
  node run-tests.js all                      # Run all tests
  node run-tests.js all landing-page         # Run all tests for landing page

Priority Levels:
  High: ${config.priorities.high.join(', ')}
  Medium: ${config.priorities.medium.join(', ')}
  Low: ${config.priorities.low.join(', ')}
`);
}

// Validate path type
function validatePathType(pathType) {
  if (pathType === 'all') return true;
  if (pathTypes.includes(pathType)) return true;
  console.error(`Error: Invalid path type '${pathType}'`);
  console.error(`Available path types: ${pathTypes.join(', ')}`);
  return false;
}

// Validate feature
function validateFeature(feature) {
  if (!feature) return true;
  if (features.includes(feature)) return true;
  console.error(`Error: Invalid feature '${feature}'`);
  console.error(`Available features: ${features.join(', ')}`);
  return false;
}

// Build Cypress command
function buildCommand(pathType, feature, options) {
  let command = 'npx cypress run --e2e';
  
  // Add spec pattern
  if (pathType === 'all') {
    if (feature) {
      command += ` --spec "cypress/e2e/**/${feature}.cy.ts"`;
    } else {
      command += ' --spec "cypress/e2e/**/*.cy.ts"';
    }
  } else {
    if (feature) {
      command += ` --spec "cypress/e2e/${pathType}/${feature}.cy.ts"`;
    } else {
      command += ` --spec "cypress/e2e/${pathType}/**/*.cy.ts"`;
    }
  }
  
  // Add options
  if (options.includes('--open')) {
    command = command.replace('cypress run', 'cypress open');
  }
  
  if (options.includes('--headed')) {
    command += ' --headed';
  }
  
  if (options.includes('--record')) {
    command += ' --record';
  }
  
  if (options.includes('--parallel')) {
    command += ' --parallel';
  }
  
  const browserIndex = options.indexOf('--browser');
  if (browserIndex !== -1 && options[browserIndex + 1]) {
    command += ` --browser ${options[browserIndex + 1]}`;
  }
  
  const reporterIndex = options.indexOf('--reporter');
  if (reporterIndex !== -1 && options[reporterIndex + 1]) {
    command += ` --reporter ${options[reporterIndex + 1]}`;
  }
  
  return command;
}

// Run tests
function runTests(command) {
  console.log(`Running: ${command}`);
  console.log('='.repeat(50));
  
  try {
    execSync(command, { stdio: 'inherit' });
    console.log('\n✅ Tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed!');
    process.exit(1);
  }
}

// Main execution
function main() {
  // Show help if no arguments or help requested
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  // Validate arguments
  if (!validatePathType(pathType)) {
    process.exit(1);
  }
  
  if (!validateFeature(feature)) {
    process.exit(1);
  }
  
  // Build and run command
  const command = buildCommand(pathType, feature, options);
  runTests(command);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, buildCommand, validatePathType, validateFeature };
