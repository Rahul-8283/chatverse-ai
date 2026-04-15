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

// A slightly more robust password check
export const isPasswordStrong = (password) => {
  // Example: At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  // const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
  // For this project, we'll stick to the 6-character minimum for simplicity.
  return password.length >= 6;
};
