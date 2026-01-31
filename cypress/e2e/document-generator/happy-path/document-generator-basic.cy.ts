describe('Document Generator E2E Tests', () => {
  beforeEach(() => {
    cy.visitWithAuth('/documents');
  });

  it('displays the document generator page correctly', () => {
    cy.contains('Document Generator').should('be.visible');
    cy.contains('Generate comprehensive documentation').should('be.visible');
  });

  it('shows back button and navigates to landing page', () => {
    cy.contains('Back').should('be.visible');
    cy.contains('Back').click();
    cy.url().should('include', '/');
  });

  it('displays file upload section', () => {
    cy.contains('Upload Project Files').should('be.visible');
    cy.contains('Click to upload or drag and drop').should('be.visible');
    cy.contains('DOCX, PDF, TXT files supported').should('be.visible');
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
    cy.contains('Or describe your project').should('be.visible');
    cy.get('textarea').should('be.visible');
    cy.get('textarea').should('have.attr', 'placeholder', 'Describe your project, features, or paste your project specification...');
  });

  it('allows text input', () => {
    const projectDescription = 'Create a React application with authentication and task management features';
    cy.get('textarea').type(projectDescription);
    cy.get('textarea').should('have.value', projectDescription);
  });

  it('shows document type selection', () => {
    cy.contains('Document Type').should('be.visible');
    cy.get('input[type="radio"]').should('exist');
  });

  it('allows document type selection', () => {
    cy.get('input[value="technical"]').click();
    cy.get('input[value="technical"]').should('be.checked');
  });

  it('shows generate button that is disabled initially', () => {
    cy.get('button:contains("Generate Documentation")').should('be.visible');
    cy.get('button:contains("Generate Documentation")').should('be.disabled');
  });

  it('enables generate button when input is provided', () => {
    cy.get('textarea').type('Test project description');
    cy.get('button:contains("Generate Documentation")').should('not.be.disabled');
  });

  it('shows loading state during document generation', () => {
    cy.intercept('POST', '**/api/documents/generate', {
      statusCode: 200,
      body: { success: true }
    }).as('generateDocument');

    cy.get('textarea').type('Test project description');
    cy.get('button:contains("Generate Documentation")').click();
    
    cy.contains('Generating Documentation').should('be.visible');
    cy.get('.animate-spin').should('be.visible');
  });

  it('displays generated documentation when available', () => {
    cy.intercept('POST', '**/api/documents/generate', {
      statusCode: 200,
      body: {
        document: {
          title: 'Project Documentation',
          content: 'This is the generated documentation content...',
          sections: [
            { title: 'Overview', content: 'Project overview content' },
            { title: 'Features', content: 'Project features content' }
          ]
        }
      }
    }).as('generateDocument');

    cy.get('textarea').type('Test project description');
    cy.get('button:contains("Generate Documentation")').click();
    
    cy.wait('@generateDocument');
    cy.contains('Generated Documentation').should('be.visible');
    cy.contains('Project Documentation').should('be.visible');
  });

  it('allows downloading generated documentation', () => {
    cy.intercept('POST', '**/api/documents/generate', {
      statusCode: 200,
      body: {
        document: {
          title: 'Project Documentation',
          content: 'Generated content...',
          downloadUrl: '/api/documents/download/123'
        }
      }
    }).as('generateDocument');

    cy.get('textarea').type('Test project description');
    cy.get('button:contains("Generate Documentation")').click();
    
    cy.wait('@generateDocument');
    cy.contains('Download').should('be.visible');
  });

  it('shows document preview', () => {
    cy.intercept('POST', '**/api/documents/generate', {
      statusCode: 200,
      body: {
        document: {
          title: 'Project Documentation',
          content: 'This is the generated documentation content...',
          sections: [
            { title: 'Overview', content: 'Project overview content' },
            { title: 'Features', content: 'Project features content' }
          ]
        }
      }
    }).as('generateDocument');

    cy.get('textarea').type('Test project description');
    cy.get('button:contains("Generate Documentation")').click();
    
    cy.wait('@generateDocument');
    cy.contains('Document Preview').should('be.visible');
    cy.contains('Overview').should('be.visible');
    cy.contains('Features').should('be.visible');
  });

  it('handles file validation errors', () => {
    const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    cy.get('input[type="file"]').selectFile({
      contents: invalidFile,
      fileName: 'test.txt',
      mimeType: 'text/plain'
    });
    cy.contains('Invalid file type').should('be.visible');
  });

  it('shows document generation progress', () => {
    cy.intercept('POST', '**/api/documents/generate', {
      statusCode: 200,
      body: { success: true }
    }).as('generateDocument');

    cy.get('textarea').type('Test project description');
    cy.get('button:contains("Generate Documentation")').click();
    
    cy.contains('Analyzing project structure').should('be.visible');
    cy.contains('Generating documentation sections').should('be.visible');
  });

  it('allows customizing document sections', () => {
    cy.contains('Customize Sections').should('be.visible');
    cy.get('input[type="checkbox"]').should('exist');
  });

  it('shows document templates', () => {
    cy.contains('Document Templates').should('be.visible');
    cy.contains('Technical Documentation').should('be.visible');
    cy.contains('API Documentation').should('be.visible');
    cy.contains('User Guide').should('be.visible');
  });

  it('allows template selection', () => {
    cy.contains('Technical Documentation').click();
    cy.get('input[value="technical"]').should('be.checked');
  });

  it('is responsive on mobile', () => {
    cy.viewport(375, 667);
    cy.contains('Document Generator').should('be.visible');
    cy.get('textarea').should('be.visible');
  });

  it('maintains form state when navigating back and forth', () => {
    const projectDescription = 'Test project description';
    cy.get('textarea').type(projectDescription);
    
    cy.contains('Back').click();
    cy.url().should('include', '/');
    
    cy.visitWithAuth('/documents');
    cy.get('textarea').should('have.value', '');
  });

  it('shows document generation options', () => {
    cy.contains('Generation Options').should('be.visible');
    cy.contains('Include code examples').should('be.visible');
    cy.contains('Include diagrams').should('be.visible');
    cy.contains('Include API documentation').should('be.visible');
  });

  it('allows toggling generation options', () => {
    cy.get('input[type="checkbox"]').first().click();
    cy.get('input[type="checkbox"]').first().should('be.checked');
  });
});


