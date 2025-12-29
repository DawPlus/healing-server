/**
 * Index file for common components and utilities
 * This provides a centralized import location for all shared components
 */

// Component exports
export { default as Page1InfoCard } from './Page1InfoCard';

// Utility exports
export {
  mapPage1ToPage2,
  mapPage1ToPage3,
  applyDefaultValues,
  translateBusinessCategory,
  translateSubCategory,
  translateDetailCategory,
  formatDateForServer
} from './Page1DataMapper'; 