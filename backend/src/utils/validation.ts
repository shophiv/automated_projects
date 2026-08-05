export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequiredFields = (fields: string[], data: Record<string, any>): string[] => {
  const missingFields: string[] = [];
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  }
  return missingFields;
};