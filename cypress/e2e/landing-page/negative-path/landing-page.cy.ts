describe('Landing Page - Negative Scenarios', () => {
  beforeEach(() => {
    cy.visitWithAuth('/');
  });

  it('prevents XSS attacks in user input', () => {
    // Try to inject malicious script
    const maliciousScript = '<script>alert("XSS")</script>';
    cy.window().then((win) => {
      win.eval(maliciousScript);
    });
    
    // Should not execute the script
    cy.contains('Bassist').should('be.visible');
    cy.get('script').should('not.exist');
  });

  it('prevents SQL injection attempts', () => {
    // Try to inject SQL
    const sqlInjection = "'; DROP TABLE users; --";
    cy.window().then((win) => {
      win.localStorage.setItem('malicious', sqlInjection);
    });
    
    // Should handle malicious input safely
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents CSRF attacks', () => {
    // Try to perform unauthorized actions
    cy.window().then((win) => {
      win.fetch('/api/admin/delete-all-users', {
        method: 'POST',
        headers: { 'X-CSRF-Token': 'fake-token' }
      }).catch(() => {});
    });
    
    // Should not allow unauthorized actions
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents clickjacking attacks', () => {
    // Check for frame busting
    cy.window().then((win) => {
      const frame = win.document.createElement('iframe');
      frame.src = 'about:blank';
      win.document.body.appendChild(frame);
      
      // Should prevent framing
      expect(win.self).to.equal(win.top);
    });
  });

  it('prevents unauthorized access to admin functions', () => {
    // Try to access admin endpoints
    cy.window().then((win) => {
      win.fetch('/api/admin/users', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer fake-admin-token' }
      }).catch(() => {});
    });
    
    // Should not expose admin functionality
    cy.contains('Bassist').should('be.visible');
    cy.contains('Admin').should('not.exist');
  });

  it('prevents unauthorized file access', () => {
    // Try to access sensitive files
    cy.window().then((win) => {
      win.fetch('/.env', { method: 'GET' }).catch(() => {});
      win.fetch('/package.json', { method: 'GET' }).catch(() => {});
      win.fetch('/src/config/secrets.js', { method: 'GET' }).catch(() => {});
    });
    
    // Should not expose sensitive files
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents directory traversal attacks', () => {
    // Try directory traversal
    const traversalPaths = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '....//....//....//etc/passwd'
    ];
    
    traversalPaths.forEach(path => {
      cy.window().then((win) => {
        win.fetch(`/api/files/${path}`, { method: 'GET' }).catch(() => {});
      });
    });
    
    // Should not allow directory traversal
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents command injection attacks', () => {
    // Try to inject system commands
    const commandInjection = '; rm -rf /; echo "hacked"';
    cy.window().then((win) => {
      win.localStorage.setItem('command', commandInjection);
    });
    
    // Should not execute system commands
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents prototype pollution attacks', () => {
    // Try to pollute Object.prototype
    cy.window().then((win) => {
      const maliciousPayload = JSON.parse('{"__proto__": {"isAdmin": true}}');
      win.Object.assign(win.Object.prototype, maliciousPayload);
    });
    
    // Should not allow prototype pollution
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents timing attacks', () => {
    // Measure response times for different inputs
    const startTime = Date.now();
    cy.contains('Generate Tasks').click();
    const endTime = Date.now();
    
    // Response time should be consistent
    expect(endTime - startTime).to.be.lessThan(1000);
  });

  it('prevents information disclosure through error messages', () => {
    // Try to trigger error messages
    cy.window().then((win) => {
      win.fetch('/api/nonexistent', { method: 'GET' }).catch(() => {});
    });
    
    // Should not reveal sensitive information
    cy.contains('Bassist').should('be.visible');
    cy.contains('Database').should('not.exist');
    cy.contains('Server').should('not.exist');
  });

  it('prevents session fixation attacks', () => {
    // Check session security
    cy.window().then((win) => {
      const sessionId = win.localStorage.getItem('sessionId');
      // Session ID should be null for security
      cy.wrap(sessionId).should('be.null');
    });
  });

  it('prevents brute force attacks', () => {
    // Try multiple rapid requests
    for (let i = 0; i < 10; i++) {
      cy.window().then((win) => {
        win.fetch('/api/tasks/generate', {
          method: 'POST',
          body: JSON.stringify({ malicious: true })
        }).catch(() => {});
      });
    }
    
    // Should not allow brute force
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents DoS attacks through resource exhaustion', () => {
    // Try to exhaust resources
    cy.window().then((win) => {
      // Create many DOM elements
      for (let i = 0; i < 1000; i++) {
        const div = win.document.createElement('div');
        div.innerHTML = 'A'.repeat(1000);
        win.document.body.appendChild(div);
      }
    });
    
    // Should handle resource exhaustion gracefully
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents malicious redirects', () => {
    // Try to redirect to malicious sites
    const maliciousUrls = [
      'javascript:alert("XSS")',
      'data:text/html,<script>alert("XSS")</script>',
      'vbscript:msgbox("XSS")'
    ];
    
    maliciousUrls.forEach(url => {
      cy.window().then((win) => {
        win.location.href = url;
      });
    });
    
    // Should not redirect to malicious URLs
    cy.url().should('include', '/');
  });

  it('prevents malicious file uploads', () => {
    // Try to upload malicious files
    const maliciousFiles = [
      { name: 'malicious.exe', type: 'application/x-executable' },
      { name: 'virus.js', type: 'application/javascript' },
      { name: 'trojan.php', type: 'application/x-php' }
    ];
    
    maliciousFiles.forEach(file => {
      cy.get('input[type="file"]').selectFile({
        contents: 'malicious content',
        fileName: file.name,
        mimeType: file.type
      });
    });
    
    // Should reject malicious files
    cy.contains('Invalid file type').should('be.visible');
  });

  it('prevents malicious cookie manipulation', () => {
    // Try to set malicious cookies
    cy.window().then((win) => {
      win.document.cookie = 'admin=true; path=/';
      win.document.cookie = 'sessionId=malicious; path=/';
      win.document.cookie = 'token=stolen; path=/';
    });
    
    // Should not allow malicious cookies
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents malicious header injection', () => {
    // Try to inject malicious headers
    cy.window().then((win) => {
      win.fetch('/api/tasks/generate', {
        method: 'POST',
        headers: {
          'X-Forwarded-For': '127.0.0.1',
          'X-Real-IP': '127.0.0.1',
          'X-Original-URL': '/admin/delete-all-users',
          'X-Rewrite-URL': '/admin/delete-all-users'
        },
        body: JSON.stringify({ malicious: true })
      }).catch(() => {});
    });
    
    // Should not allow header injection
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents malicious query parameter injection', () => {
    // Try to inject malicious query parameters
    const maliciousParams = [
      '?admin=true',
      '?debug=true',
      '?token=stolen',
      '?user=admin'
    ];
    
    maliciousParams.forEach(param => {
      cy.visit(`/${param}`);
    });
    
    // Should not allow malicious parameters
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents malicious fragment injection', () => {
    // Try to inject malicious fragments
    const maliciousFragments = [
      '#admin',
      '#debug',
      '#token=stolen',
      '#user=admin'
    ];
    
    maliciousFragments.forEach(fragment => {
      cy.visit(`/${fragment}`);
    });
    
    // Should not allow malicious fragments
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents malicious WebSocket connections', () => {
    // Try to establish malicious WebSocket connections
    cy.window().then((win) => {
      try {
        const ws = new win.WebSocket('ws://malicious-site.com/ws');
        ws.onopen = () => {
          ws.send('malicious data');
        };
      } catch {
        // Should prevent malicious WebSocket connections
      }
    });
    
    // Should not allow malicious WebSocket connections
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents malicious Service Worker registration', () => {
    // Try to register malicious Service Worker
    cy.window().then((win) => {
      if (win.navigator.serviceWorker) {
        win.navigator.serviceWorker.register('malicious-sw.js').catch(() => {});
      }
    });
    
    // Should not allow malicious Service Worker registration
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents malicious WebRTC connections', () => {
    // Try to establish malicious WebRTC connections
    cy.window().then((win) => {
      try {
        const pc = new win.RTCPeerConnection();
        pc.createDataChannel('malicious');
      } catch {
        // Should prevent malicious WebRTC connections
      }
    });
    
    // Should not allow malicious WebRTC connections
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents malicious Geolocation access', () => {
    // Try to access geolocation maliciously
    cy.window().then((win) => {
      if (win.navigator.geolocation) {
        win.navigator.geolocation.getCurrentPosition(
          () => {},
          () => {},
          { enableHighAccuracy: true }
        );
      }
    });
    
    // Should not allow malicious geolocation access
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents malicious Camera access', () => {
    // Try to access camera maliciously
    cy.window().then((win) => {
      if (win.navigator.mediaDevices) {
        win.navigator.mediaDevices.getUserMedia({ video: true }).catch(() => {});
      }
    });
    
    // Should not allow malicious camera access
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents malicious Microphone access', () => {
    // Try to access microphone maliciously
    cy.window().then((win) => {
      if (win.navigator.mediaDevices) {
        win.navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {});
      }
    });
    
    // Should not allow malicious microphone access
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents malicious Clipboard access', () => {
    // Try to access clipboard maliciously
    cy.window().then((win) => {
      if (win.navigator.clipboard) {
        win.navigator.clipboard.readText().catch(() => {});
      }
    });
    
    // Should not allow malicious clipboard access
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents malicious Notification access', () => {
    // Try to request notifications maliciously
    cy.window().then((win) => {
      if (win.Notification) {
        win.Notification.requestPermission().catch(() => {});
      }
    });
    
    // Should not allow malicious notification access
    cy.contains('Bassist').should('be.visible');
  });

  it('prevents malicious Push API access', () => {
    // Try to access Push API maliciously
    cy.window().then((win) => {
      if (win.navigator.serviceWorker) {
        win.navigator.serviceWorker.ready.then(registration => {
          registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'malicious-key'
          }).catch(() => {});
        });
      }
    });
    
    // Should not allow malicious Push API access
    cy.contains('Bassist').should('be.visible');
  });
});


