// Cypress E2E Support File
// This file is processed and loaded automatically before test files.

// Handle Next.js redirects and expected authentication errors
Cypress.on('uncaught:exception', (err) => {
  // Next.js redirects throw a NEXT_REDIRECT error which is expected behavior
  if (err.message.includes('NEXT_REDIRECT')) {
    return false;
  }
  // Expected authentication errors (these should be caught by the UI)
  if (err.message.includes('No studio found for this email')) {
    return false;
  }
  // Let other errors fail the test
  return true;
});
