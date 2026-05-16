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
