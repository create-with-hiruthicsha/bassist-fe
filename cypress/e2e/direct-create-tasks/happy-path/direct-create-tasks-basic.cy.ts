describe('Direct Create Tasks E2E Tests', () => {
  beforeEach(() => {
    cy.visitWithAuth('/direct-create-tasks');
  });

  it('displays the direct create tasks page correctly', () => {
    cy.contains('Create Tasks Directly').should('be.visible');
    cy.contains('Create tasks directly in your preferred platform').should('be.visible');
  });

  it('shows back button and navigates to landing page', () => {
    cy.contains('Back').should('be.visible');
    cy.contains('Back').click();
    cy.url().should('include', '/');
  });

  it('displays platform selection', () => {
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

  it('displays task input form when platform is selected', () => {
    cy.contains('Jira').click();
    cy.contains('Task Details').should('be.visible');
    cy.get('input[placeholder="Enter task title"]').should('be.visible');
    cy.get('textarea[placeholder="Enter task description"]').should('be.visible');
  });

  it('allows adding multiple tasks', () => {
    cy.contains('Jira').click();
    
    // Add first task
    cy.get('input[placeholder="Enter task title"]').type('First task');
    cy.get('textarea[placeholder="Enter task description"]').type('First task description');
    cy.contains('Add Task').click();
    
    // Add second task
    cy.get('input[placeholder="Enter task title"]').type('Second task');
    cy.get('textarea[placeholder="Enter task description"]').type('Second task description');
    cy.contains('Add Task').click();
    
    cy.contains('First task').should('be.visible');
    cy.contains('Second task').should('be.visible');
  });

  it('allows editing tasks', () => {
    cy.contains('Jira').click();
    
    cy.get('input[placeholder="Enter task title"]').type('Test task');
    cy.get('textarea[placeholder="Enter task description"]').type('Test description');
    cy.contains('Add Task').click();
    
    cy.get('button[title="Edit task"]').click();
    cy.get('input[value="Test task"]').clear().type('Updated task');
    cy.contains('Save').click();
    
    cy.contains('Updated task').should('be.visible');
  });

  it('allows deleting tasks', () => {
    cy.contains('Jira').click();
    
    cy.get('input[placeholder="Enter task title"]').type('Test task');
    cy.get('textarea[placeholder="Enter task description"]').type('Test description');
    cy.contains('Add Task').click();
    
    cy.get('button[title="Delete task"]').click();
    cy.contains('Test task').should('not.exist');
  });

  it('shows task validation', () => {
    cy.contains('Jira').click();
    cy.contains('Add Task').click();
    cy.contains('Title is required').should('be.visible');
  });

  it('allows setting task priority', () => {
    cy.contains('Jira').click();
    
    cy.get('input[placeholder="Enter task title"]').type('Test task');
    cy.get('select').select('High');
    cy.contains('Add Task').click();
    
    cy.contains('High').should('be.visible');
  });

  it('allows setting task assignee', () => {
    cy.contains('Jira').click();
    
    cy.get('input[placeholder="Enter task title"]').type('Test task');
    cy.get('input[placeholder="Assignee email"]').type('user@example.com');
    cy.contains('Add Task').click();
    
    cy.contains('user@example.com').should('be.visible');
  });

  it('shows task summary', () => {
    cy.contains('Jira').click();
    
    cy.get('input[placeholder="Enter task title"]').type('Test task');
    cy.get('textarea[placeholder="Enter task description"]').type('Test description');
    cy.contains('Add Task').click();
    
    cy.contains('Task Summary').should('be.visible');
    cy.contains('1 task').should('be.visible');
  });

  it('allows bulk task creation', () => {
    cy.contains('Jira').click();
    cy.contains('Bulk Import').click();
    
    const tasksText = `Task 1: First task description
Task 2: Second task description
Task 3: Third task description`;
    
    cy.get('textarea[placeholder="Enter tasks in format: Title: Description"]').type(tasksText);
    cy.contains('Import Tasks').click();
    
    cy.contains('Task 1').should('be.visible');
    cy.contains('Task 2').should('be.visible');
    cy.contains('Task 3').should('be.visible');
  });

  it('shows create tasks button when tasks are added', () => {
    cy.contains('Jira').click();
    
    cy.get('input[placeholder="Enter task title"]').type('Test task');
    cy.get('textarea[placeholder="Enter task description"]').type('Test description');
    cy.contains('Add Task').click();
    
    cy.get('button:contains("Create Tasks")').should('be.visible');
  });

  it('creates tasks when Create Tasks is clicked', () => {
    cy.intercept('POST', '**/api/tasks/create', {
      statusCode: 200,
      body: { success: true, taskIds: ['1', '2', '3'] }
    }).as('createTasks');

    cy.contains('Jira').click();
    
    cy.get('input[placeholder="Enter task title"]').type('Test task');
    cy.get('textarea[placeholder="Enter task description"]').type('Test description');
    cy.contains('Add Task').click();
    
    cy.get('button:contains("Create Tasks")').click();
    cy.wait('@createTasks');
    cy.contains('Tasks created successfully').should('be.visible');
  });

  it('shows loading state during task creation', () => {
    cy.intercept('POST', '**/api/tasks/create', {
      statusCode: 200,
      delay: 1000,
      body: { success: true }
    }).as('createTasks');

    cy.contains('Jira').click();
    
    cy.get('input[placeholder="Enter task title"]').type('Test task');
    cy.get('textarea[placeholder="Enter task description"]').type('Test description');
    cy.contains('Add Task').click();
    
    cy.get('button:contains("Create Tasks")').click();
    cy.contains('Creating tasks...').should('be.visible');
  });

  it('handles task creation errors', () => {
    cy.intercept('POST', '**/api/tasks/create', {
      statusCode: 500,
      body: { error: 'Failed to create tasks' }
    }).as('createTasksError');

    cy.contains('Jira').click();
    
    cy.get('input[placeholder="Enter task title"]').type('Test task');
    cy.get('textarea[placeholder="Enter task description"]').type('Test description');
    cy.contains('Add Task').click();
    
    cy.get('button:contains("Create Tasks")').click();
    cy.wait('@createTasksError');
    cy.contains('Failed to create tasks').should('be.visible');
  });

  it('allows reordering tasks', () => {
    cy.contains('Jira').click();
    
    // Add multiple tasks
    cy.get('input[placeholder="Enter task title"]').type('Task 1');
    cy.contains('Add Task').click();
    
    cy.get('input[placeholder="Enter task title"]').type('Task 2');
    cy.contains('Add Task').click();
    
    cy.get('button[title="Move up"]').last().click();
    // Verify order changed (this would need specific implementation)
  });

  it('shows task templates', () => {
    cy.contains('Task Templates').should('be.visible');
    cy.contains('Bug Report').should('be.visible');
    cy.contains('Feature Request').should('be.visible');
    cy.contains('User Story').should('be.visible');
  });

  it('allows using task templates', () => {
    cy.contains('Jira').click();
    cy.contains('User Story').click();
    
    cy.get('input[placeholder="Enter task title"]').should('have.value', 'As a user, I want to');
    cy.get('textarea[placeholder="Enter task description"]').should('contain.value', 'So that');
  });

  it('is responsive on mobile', () => {
    cy.viewport(375, 667);
    cy.contains('Create Tasks Directly').should('be.visible');
    cy.get('input').should('be.visible');
  });

  it('maintains form state when switching platforms', () => {
    cy.contains('Jira').click();
    cy.get('input[placeholder="Enter task title"]').type('Test task');
    cy.contains('Add Task').click();
    
    cy.contains('Asana').click();
    cy.contains('Test task').should('be.visible');
  });

  it('shows platform-specific fields', () => {
    cy.contains('Jira').click();
    cy.contains('Epic').should('be.visible');
    cy.contains('Sprint').should('be.visible');
    
    cy.contains('Asana').click();
    cy.contains('Project').should('be.visible');
    cy.contains('Section').should('be.visible');
  });

  it('allows setting due dates', () => {
    cy.contains('Jira').click();
    
    cy.get('input[placeholder="Enter task title"]').type('Test task');
    cy.get('input[type="date"]').type('2024-12-31');
    cy.contains('Add Task').click();
    
    cy.contains('2024-12-31').should('be.visible');
  });

  it('shows task creation progress', () => {
    cy.intercept('POST', '**/api/tasks/create', {
      statusCode: 200,
      body: { success: true }
    }).as('createTasks');

    cy.contains('Jira').click();
    
    cy.get('input[placeholder="Enter task title"]').type('Test task');
    cy.contains('Add Task').click();
    
    cy.get('button:contains("Create Tasks")').click();
    cy.contains('Creating task 1 of 1').should('be.visible');
  });
});


