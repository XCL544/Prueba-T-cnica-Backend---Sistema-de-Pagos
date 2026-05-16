export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // At least 10 characters
  // At least 1 uppercase letter
  // At least 1 lowercase letter
  // At least 1 number
  // At least 1 special character/symbol
  if (password.length < 10) return false;
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password); // Any character that is not a letter or a digit

  return hasUppercase && hasLowercase && hasNumber && hasSymbol;
};

// Card Validators
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const isValidExpMonth = (month: number): boolean => {
  return Number.isInteger(month) && month >= 1 && month <= 12;
};

export const isValidExpYear = (year: number): boolean => {
  const currentYear = new Date().getFullYear();
  return Number.isInteger(year) && year >= currentYear && year <= currentYear + 20;
};

export const isValidLastFour = (lastFour: string): boolean => {
  const lastFourRegex = /^[0-9]{4}$/;
  return lastFourRegex.test(lastFour);
};

export const isValidBrand = (brand: string): boolean => {
  return brand.trim().length > 0 && brand.length <= 20;
};

// Payment Validators
export const isValidAmount = (amount: number): boolean => {
  return typeof amount === 'number' && amount > 0;
};

export const isValidCurrency = (currency: string): boolean => {
  return typeof currency === 'string' && currency.length === 3;
};
