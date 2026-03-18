// Email validation regex
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Full name validation
export const validateFullName = (fullName) => {
  return fullName.trim().length >= 2;
};

// Password validation
export const validatePassword = (password) => {
  return password.length >= 6;
};

// Check if passwords match
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword && password.length > 0;
};
