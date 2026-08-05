export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRegistrationPayload = (body: any): string | null => {
  if (!body.tenantName || typeof body.tenantName !== 'string' || body.tenantName.trim() === '') {
    return 'Tenant name is required and must be a non-empty string.';
  }
  if (!body.email || !isValidEmail(body.email)) {
    return 'A valid email is required.';
  }
  if (!body.password || typeof body.password !== 'string' || body.password.length < 6) {
    return 'Password is required and must be at least 6 characters long.';
  }
  return null;
};

export const validateLoginPayload = (body: any): string | null => {
  if (!body.email || !isValidEmail(body.email)) {
    return 'A valid email is required.';
  }
  if (!body.password || typeof body.password !== 'string') {
    return 'Password is required.';
  }
  return null;
};