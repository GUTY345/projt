import { format } from 'date-fns';
import { th } from 'date-fns/locale';

// Format date to Thai locale
export const formatDate = (date) => {
  return format(date, 'PPP', { locale: th });
};

// Format time to Thai locale
export const formatTime = (date) => {
  return format(date, 'p', { locale: th });
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validate email format
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Sort array by date
export const sortByDate = (array, dateField, ascending = false) => {
  return array.sort((a, b) => {
    const dateA = new Date(a[dateField]);
    const dateB = new Date(b[dateField]);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

// Group array by field
export const groupBy = (array, field) => {
  return array.reduce((groups, item) => {
    const value = item[field];
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
};

// Remove duplicates from array
export const removeDuplicates = (array, field) => {
  return array.filter((item, index, self) =>
    index === self.findIndex((t) => t[field] === item[field])
  );
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Check if object is empty
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Get random element from array
export const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Capitalize first letter
export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};