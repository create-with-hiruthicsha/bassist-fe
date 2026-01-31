describe('Task Generator - Happy Path', () => {
  beforeEach(() => {
    // If auth wall present, authenticate first (session cached globally)
    cy.ensureAuthenticated();
    cy.visit('/tasks');
  });

  it('displays the task generator page correctly', () => {
    cy.contains('Task Generator').should('be.visible');
    cy.contains('Select a platform and generate actionable tasks').should('be.visible');
    cy.contains('Back').should('be.visible');
  });

  it('allows platform selection and shows visual feedback', () => {
    cy.contains('Jira').click();
    cy.get('button:contains("Jira")').should('have.class', 'bg-blue-700');
    cy.get('button:contains("Jira")').should('have.class', 'text-white');
  });

  it('enables generate button when platform is selected and text input is provided', () => {
    cy.contains('Jira').click();
    cy.get('textarea').type('Create a React application with authentication and task management');
    cy.get('button:contains("Generate Tasks")').should('not.be.disabled');
  });

  it('successfully generates tasks with text input', () => {
    // Mock successful task generation
    cy.intercept('POST', '**/api/tasks/generate', {
      statusCode: 200,
      body: {
        output: JSON.stringify({
          summary: {
            number_of_epics: 2,
            number_of_tasks: 4,
            total_estimated_hours: 16,
            assumptions: ['User has React knowledge', 'TypeScript is preferred']
          },
          epics: [
            {
              name: 'Authentication Setup',
              tasks: [
                {
                  title: 'Set up Supabase authentication',
                  description: 'Configure Supabase client and authentication flow',
                  estimate: '4h'
                },
                {
                  title: 'Create login component',
                  description: 'Build login form with email/password and Google OAuth',
                  estimate: '3h'
                }
              ]
            },
            {
              name: 'Task Management',
              tasks: [
                {
                  title: 'Create task model',
                  description: 'Define task schema and database structure',
                  estimate: '2h'
                },
                {
                  title: 'Build task list component',
                  description: 'Display tasks in a list with filtering and sorting',
                  estimate: '4h'
                }
              ]
            }
          ]
        })
      }
    }).as('generateTasks');

    cy.contains('Jira').click();
    cy.get('textarea').type('Create a React application with authentication and task management features');
    cy.get('button:contains("Generate Tasks")').click();
    
    cy.wait('@generateTasks');
    
    // Verify generated content
    cy.contains('Generated Tasks').should('be.visible');
    cy.contains('Authentication Setup').should('be.visible');
    cy.contains('Task Management').should('be.visible');
    cy.contains('Set up Supabase authentication').should('be.visible');
    cy.contains('Create login component').should('be.visible');
  });

  it('displays project summary correctly', () => {
    cy.intercept('POST', '**/api/tasks/generate', {
      statusCode: 200,
      body: {
        output: JSON.stringify({
          summary: {
            number_of_epics: 3,
            number_of_tasks: 8,
            total_estimated_hours: 24,
            assumptions: ['User has React knowledge']
          },
          epics: []
        })
      }
    }).as('generateTasks');

    cy.contains('Jira').click();
    cy.get('textarea').type('Test project description');
    cy.get('button:contains("Generate Tasks")').click();
    
    cy.wait('@generateTasks');
    
    cy.contains('Project Summary').should('be.visible');
    cy.contains('3 epics').should('be.visible');
    cy.contains('8 tasks').should('be.visible');
    cy.contains('24 hours').should('be.visible');
    cy.contains('3 days').should('be.visible'); // 24 hours / 8 hours per day
  });

  it('allows task editing successfully', () => {
    cy.intercept('POST', '**/api/tasks/generate', {
      statusCode: 200,
      body: {
        output: JSON.stringify({
          summary: { number_of_epics: 1, number_of_tasks: 1, total_estimated_hours: 4, assumptions: [] },
          epics: [{
            name: 'Test Epic',
            tasks: [{ title: 'Test Task', description: 'Test description', estimate: '2h' }]
          }]
        })
      }
    }).as('generateTasks');

    cy.contains('Jira').click();
    cy.get('textarea').type('Test project description');
    cy.get('button:contains("Generate Tasks")').click();
    
    cy.wait('@generateTasks');
    
    // Edit task
    cy.get('button[title="Edit task"]').click();
    cy.get('input[placeholder="Enter task title"]').clear().type('Updated Task Title');
    cy.get('textarea[placeholder="Enter task description"]').clear().type('Updated task description');
    cy.get('input[placeholder="e.g., 2h, 1d"]').clear().type('3h');
    cy.contains('Save').click();
    
    cy.contains('Updated Task Title').should('be.visible');
    cy.contains('Updated task description').should('be.visible');
    cy.contains('3h').should('be.visible');
  });

  it('successfully uploads and processes DOCX file', () => {
    const fileName = 'project-specification.docx';
    cy.fixture('test-document.docx', 'base64').then((fileContent) => {
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(fileContent, 'base64'),
        fileName: fileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
    });
    
    cy.contains(fileName).should('be.visible');
    cy.contains('Jira').click();
    cy.get('button:contains("Generate Tasks")').should('not.be.disabled');
  });

  it('navigates to create tasks page after successful generation', () => {
    cy.intercept('POST', '**/api/tasks/generate', {
      statusCode: 200,
      body: {
        output: JSON.stringify({
          summary: { number_of_epics: 1, number_of_tasks: 1, total_estimated_hours: 4, assumptions: [] },
          epics: [{
            name: 'Test Epic',
            tasks: [{ title: 'Test Task', description: 'Test description', estimate: '2h' }]
          }]
        })
      }
    }).as('generateTasks');

    cy.contains('Jira').click();
    cy.get('textarea').type('Test project description');
    cy.get('button:contains("Generate Tasks")').click();
    
    cy.wait('@generateTasks');
    
    cy.get('button:contains("Create Tasks")').click();
    cy.url().should('include', '/create-tasks');
  });

  it('shows progress during task generation', () => {
    cy.intercept('POST', '**/api/tasks/generate', {
      statusCode: 200,
      body: { success: true }
    }).as('generateTasks');

    cy.contains('Jira').click();
    cy.get('textarea').type('Test project description');
    cy.get('button:contains("Generate Tasks")').click();
    
    cy.contains('Generating Tasks').should('be.visible');
    cy.get('.animate-spin').should('be.visible');
  });

  it('works with all supported platforms', () => {
    const platforms = ['Jira', 'Asana', 'Trello', 'Linear', 'GitHub Issues'];
    
    platforms.forEach(platform => {
      cy.contains(platform).click();
      cy.get(`button:contains("${platform}")`).should('have.class', 'bg-blue-700');
      
      // Reset for next platform
      cy.contains('Jira').click();
    });
  });

  it('maintains form state when switching between platforms', () => {
    cy.contains('Jira').click();
    cy.get('textarea').type('Test project description');
    
    cy.contains('Asana').click();
    cy.get('textarea').should('have.value', 'Test project description');
    cy.get('button:contains("Generate Tasks")').should('not.be.disabled');
  });

  it('displays assumptions when provided', () => {
    cy.intercept('POST', '**/api/tasks/generate', {
      statusCode: 200,
      body: {
        output: JSON.stringify({
          summary: {
            number_of_epics: 1,
            number_of_tasks: 1,
            total_estimated_hours: 4,
            assumptions: [
              'User has basic React knowledge',
              'Project uses TypeScript',
              'Tailwind CSS is available'
            ]
          },
          epics: []
        })
      }
    }).as('generateTasks');

    cy.contains('Jira').click();
    cy.get('textarea').type('Test project description');
    cy.get('button:contains("Generate Tasks")').click();
    
    cy.wait('@generateTasks');
    
    cy.contains('Assumptions').should('be.visible');
    cy.contains('User has basic React knowledge').should('be.visible');
    cy.contains('Project uses TypeScript').should('be.visible');
    cy.contains('Tailwind CSS is available').should('be.visible');
  });
});


