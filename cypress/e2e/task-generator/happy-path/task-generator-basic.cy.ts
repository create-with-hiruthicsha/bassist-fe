describe('Task Generator E2E Tests', () => {
  beforeEach(() => {
    cy.visitWithAuth('/tasks');
  });

  it('displays the task generator page correctly', () => {
    cy.contains('Task Generator').should('be.visible');
    cy.contains('Select a platform and generate actionable tasks').should('be.visible');
  });

  it('shows back button and navigates to landing page', () => {
    cy.contains('Back').should('be.visible');
    cy.contains('Back').click();
    cy.url().should('include', '/');
  });

  it('displays platform selection section', () => {
    cy.contains('Select Platform').should('be.visible');
    cy.get('button').should('contain', 'Jira');
    cy.get('button').should('contain', 'Asana');
    cy.get('button').should('contain', 'Trello');
    cy.get('button').should('contain', 'Linear');
    cy.get('button').should('contain', 'GitHub Issues');
  });

  it('allows platform selection', () => {
    cy.contains('Jira').click();
    cy.get('button:contains("Jira")').should('have.class', 'bg-blue-700');
  });

  it('displays file upload section', () => {
    cy.contains('Upload DOCX File (Optional)').should('be.visible');
    cy.contains('Click to upload or drag and drop').should('be.visible');
    cy.contains('DOCX files only, max 10MB').should('be.visible');
  });

  it('allows file upload', () => {
    const fileName = 'test-document.docx';
    cy.fixture('test-document.docx', 'base64').then((fileContent) => {
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(fileContent, 'base64'),
        fileName: fileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
    });
    cy.contains(fileName).should('be.visible');
  });

  it('displays text input section', () => {
    cy.contains('Or describe your project idea').should('be.visible');
    cy.get('textarea').should('be.visible');
    cy.get('textarea').should('have.attr', 'placeholder', 'Describe your project, features, requirements, or paste your project specification...');
  });

  it('allows text input', () => {
    const projectDescription = 'Create a React application with authentication and task management';
    cy.get('textarea').type(projectDescription);
    cy.get('textarea').should('have.value', projectDescription);
  });

  it('shows generate button that is disabled initially', () => {
    cy.get('button:contains("Generate Tasks")').should('be.visible');
    cy.get('button:contains("Generate Tasks")').should('be.disabled');
  });

  it('enables generate button when platform is selected and input is provided', () => {
    cy.contains('Jira').click();
    cy.get('textarea').type('Test project description');
    cy.get('button:contains("Generate Tasks")').should('not.be.disabled');
  });

  it('shows loading state during task generation', () => {
    // Mock the API response
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

  it('displays generated tasks when available', () => {
    // Mock successful task generation
    cy.intercept('POST', '**/api/tasks/generate', {
      statusCode: 200,
      body: {
        output: JSON.stringify({
          summary: {
            number_of_epics: 2,
            number_of_tasks: 4,
            total_estimated_hours: 16,
            assumptions: ['User has React knowledge']
          },
          epics: [
            {
              name: 'Authentication',
              tasks: [
                {
                  title: 'Set up authentication',
                  description: 'Configure auth system',
                  estimate: '4h'
                }
              ]
            }
          ]
        })
      }
    }).as('generateTasks');

    cy.contains('Jira').click();
    cy.get('textarea').type('Test project description');
    cy.get('button:contains("Generate Tasks")').click();
    
    cy.wait('@generateTasks');
    cy.contains('Generated Tasks').should('be.visible');
    cy.contains('Authentication').should('be.visible');
    cy.contains('Set up authentication').should('be.visible');
  });

  it('shows project summary when tasks are generated', () => {
    // Mock task generation response
    cy.intercept('POST', '**/api/tasks/generate', {
      statusCode: 200,
      body: {
        output: JSON.stringify({
          summary: {
            number_of_epics: 2,
            number_of_tasks: 4,
            total_estimated_hours: 16,
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
    cy.contains('2 epics').should('be.visible');
    cy.contains('4 tasks').should('be.visible');
    cy.contains('16 hours').should('be.visible');
  });

  it('allows task editing', () => {
    // Mock task generation and then test editing
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
    cy.get('button[title="Edit task"]').click();
    cy.get('input[placeholder="Enter task title"]').should('be.visible');
    cy.get('textarea[placeholder="Enter task description"]').should('be.visible');
  });

  it('shows create tasks button when tasks are generated', () => {
    // Mock task generation
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
    cy.get('button:contains("Create Tasks")').should('be.visible');
  });

  it('navigates to create tasks page when Create Tasks is clicked', () => {
    // Mock task generation and navigation
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

  it('handles file validation errors', () => {
    const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    cy.get('input[type="file"]').selectFile({
      contents: invalidFile,
      fileName: 'test.txt',
      mimeType: 'text/plain'
    });
    cy.contains('Invalid file').should('be.visible');
  });

  it('is responsive on mobile', () => {
    cy.viewport(375, 667);
    cy.contains('Task Generator').should('be.visible');
    cy.get('textarea').should('be.visible');
  });
});


