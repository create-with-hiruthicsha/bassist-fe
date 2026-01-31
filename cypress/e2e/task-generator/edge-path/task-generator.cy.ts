describe('Task Generator - Edge Cases', () => {
  beforeEach(() => {
    cy.visitWithAuth('/tasks');
  });

  it('handles extremely long project descriptions', () => {
    const longDescription = 'A'.repeat(10000); // 10,000 character description
    
    cy.contains('Jira').click();
    cy.get('textarea').type(longDescription);
    cy.get('button:contains("Generate Tasks")').should('not.be.disabled');
    
    // Should handle long input gracefully
    cy.get('textarea').should('have.value', longDescription);
  });

  it('handles special characters in project description', () => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\'\\';
    
    cy.contains('Jira').click();
    cy.get('textarea').type(specialChars);
    cy.get('button:contains("Generate Tasks")').should('not.be.disabled');
  });

  it('handles Unicode characters in project description', () => {
    const unicodeText = '🚀 Project with emojis and 中文 and العربية and русский';
    
    cy.contains('Jira').click();
    cy.get('textarea').type(unicodeText);
    cy.get('button:contains("Generate Tasks")').should('not.be.disabled');
  });

  it('handles empty project description with only whitespace', () => {
    cy.contains('Jira').click();
    cy.get('textarea').type('   \n\t   ');
    cy.get('button:contains("Generate Tasks")').should('be.disabled');
  });

  it('handles maximum file size upload', () => {
    // Create a file at the maximum allowed size (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const largeFile = new File(['x'.repeat(maxSize)], 'large-file.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    cy.get('input[type="file"]').selectFile({
      contents: largeFile,
      fileName: 'large-file.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    cy.contains('large-file.docx').should('be.visible');
    cy.contains('Jira').click();
    cy.get('button:contains("Generate Tasks")').should('not.be.disabled');
  });

  it('handles file upload at exact size limit', () => {
    const exactSize = 10 * 1024 * 1024; // Exactly 10MB
    const exactFile = new File(['x'.repeat(exactSize)], 'exact-size.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    cy.get('input[type="file"]').selectFile({
      contents: exactFile,
      fileName: 'exact-size.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    cy.contains('exact-size.docx').should('be.visible');
  });

  it('handles rapid platform switching', () => {
    const platforms = ['Jira', 'Asana', 'Trello', 'Linear', 'GitHub Issues'];
    
    // Rapidly switch between platforms
    platforms.forEach(platform => {
      cy.contains(platform).click();
      cy.get(`button:contains("${platform}")`).should('have.class', 'bg-blue-700');
    });
    
    // Should end up with the last selected platform
    cy.get('button:contains("GitHub Issues")').should('have.class', 'bg-blue-700');
  });

  it('handles concurrent file uploads', () => {
    const file1 = new File(['content1'], 'file1.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    const file2 = new File(['content2'], 'file2.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    // Try to upload multiple files (should only accept one)
    cy.get('input[type="file"]').selectFile({
      contents: file1,
      fileName: 'file1.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    cy.get('input[type="file"]').selectFile({
      contents: file2,
      fileName: 'file2.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    // Should show the last uploaded file
    cy.contains('file2.docx').should('be.visible');
  });

  it('handles very short project descriptions', () => {
    cy.contains('Jira').click();
    cy.get('textarea').type('AI');
    cy.get('button:contains("Generate Tasks")').should('not.be.disabled');
  });

  it('handles project descriptions with only numbers', () => {
    cy.contains('Jira').click();
    cy.get('textarea').type('123456789');
    cy.get('button:contains("Generate Tasks")').should('not.be.disabled');
  });

  it('handles project descriptions with only symbols', () => {
    cy.contains('Jira').click();
    cy.get('textarea').type('!!!@@@###$$$');
    cy.get('button:contains("Generate Tasks")').should('not.be.disabled');
  });

  it('handles mixed content types (file + text)', () => {
    const fileName = 'test-document.docx';
    cy.fixture('test-document.docx', 'base64').then((fileContent) => {
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(fileContent, 'base64'),
        fileName: fileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
    });
    
    cy.contains(fileName).should('be.visible');
    
    // Also add text input
    cy.get('textarea').type('Additional project requirements');
    cy.contains('Jira').click();
    cy.get('button:contains("Generate Tasks")').should('not.be.disabled');
  });

  it('handles browser back/forward navigation during generation', () => {
    cy.contains('Jira').click();
    cy.get('textarea').type('Test project description');
    cy.get('button:contains("Generate Tasks")').click();
    
    // Navigate away during generation
    cy.go('back');
    cy.url().should('include', '/');
    
    // Navigate forward
    cy.go('forward');
    cy.url().should('include', '/tasks');
  });

  it('handles page refresh during task generation', () => {
    cy.intercept('POST', '**/api/tasks/generate', {
      statusCode: 200,
      body: { success: true }
    }).as('generateTasks');
    
    cy.contains('Jira').click();
    cy.get('textarea').type('Test project description');
    cy.get('button:contains("Generate Tasks")').click();
    
    // Refresh during generation
    cy.reload();
    cy.contains('Task Generator').should('be.visible');
  });

  it('handles very large generated task lists', () => {
    // Mock a response with many tasks
    const manyTasks = Array.from({ length: 100 }, (_, i) => ({
      title: `Task ${i + 1}`,
      description: `Description for task ${i + 1}`,
      estimate: '2h'
    }));
    
    cy.intercept('POST', '**/api/tasks/generate', {
      statusCode: 200,
      body: {
        output: JSON.stringify({
          summary: {
            number_of_epics: 1,
            number_of_tasks: 100,
            total_estimated_hours: 200,
            assumptions: []
          },
          epics: [{
            name: 'Large Epic',
            tasks: manyTasks
          }]
        })
      }
    }).as('generateManyTasks');
    
    cy.contains('Jira').click();
    cy.get('textarea').type('Generate many tasks');
    cy.get('button:contains("Generate Tasks")').click();
    
    cy.wait('@generateManyTasks');
    cy.contains('Generated Tasks').should('be.visible');
    cy.contains('100 tasks').should('be.visible');
  });

  it('handles zero estimated hours in generated tasks', () => {
    cy.intercept('POST', '**/api/tasks/generate', {
      statusCode: 200,
      body: {
        output: JSON.stringify({
          summary: {
            number_of_epics: 1,
            number_of_tasks: 1,
            total_estimated_hours: 0,
            assumptions: []
          },
          epics: [{
            name: 'Zero Hour Epic',
            tasks: [{
              title: 'Zero hour task',
              description: 'Task with no time estimate',
              estimate: '0h'
            }]
          }]
        })
      }
    }).as('generateZeroHourTasks');
    
    cy.contains('Jira').click();
    cy.get('textarea').type('Generate zero hour tasks');
    cy.get('button:contains("Generate Tasks")').click();
    
    cy.wait('@generateZeroHourTasks');
    cy.contains('0 hours').should('be.visible');
    cy.contains('0 days').should('be.visible');
  });

  it('handles very long task titles and descriptions', () => {
    const longTitle = 'A'.repeat(500);
    const longDescription = 'B'.repeat(2000);
    
    cy.intercept('POST', '**/api/tasks/generate', {
      statusCode: 200,
      body: {
        output: JSON.stringify({
          summary: {
            number_of_epics: 1,
            number_of_tasks: 1,
            total_estimated_hours: 4,
            assumptions: []
          },
          epics: [{
            name: 'Long Content Epic',
            tasks: [{
              title: longTitle,
              description: longDescription,
              estimate: '4h'
            }]
          }]
        })
      }
    }).as('generateLongContentTasks');
    
    cy.contains('Jira').click();
    cy.get('textarea').type('Generate tasks with long content');
    cy.get('button:contains("Generate Tasks")').click();
    
    cy.wait('@generateLongContentTasks');
    cy.contains('Generated Tasks').should('be.visible');
    // Should handle long content gracefully
    cy.contains(longTitle.substring(0, 50)).should('be.visible');
  });

  it('handles rapid form input changes', () => {
    cy.contains('Jira').click();
    
    // Rapidly change text input
    cy.get('textarea').type('Initial text');
    cy.get('textarea').clear().type('Changed text');
    cy.get('textarea').clear().type('Final text');
    
    cy.get('textarea').should('have.value', 'Final text');
    cy.get('button:contains("Generate Tasks")').should('not.be.disabled');
  });

  it('handles browser zoom during task generation', () => {
    cy.viewport(1280, 720);
    cy.contains('Jira').click();
    cy.get('textarea').type('Test project description');
    
    // Zoom in
    cy.viewport(640, 360);
    cy.get('button:contains("Generate Tasks")').should('not.be.disabled');
    
    // Zoom out
    cy.viewport(2560, 1440);
    cy.get('button:contains("Generate Tasks")').should('not.be.disabled');
  });

  it('handles very small viewport sizes', () => {
    cy.viewport(320, 568); // Very small mobile
    cy.contains('Task Generator').should('be.visible');
    cy.get('textarea').should('be.visible');
    cy.contains('Jira').click();
    cy.get('button:contains("Generate Tasks")').should('be.visible');
  });

  it('handles very large viewport sizes', () => {
    cy.viewport(3840, 2160); // 4K display
    cy.contains('Task Generator').should('be.visible');
    cy.get('textarea').should('be.visible');
    cy.contains('Jira').click();
    cy.get('button:contains("Generate Tasks")').should('be.visible');
  });
});


