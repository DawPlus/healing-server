import React from 'react';
import FormDataAdapter from './FormDataAdapter';

// Import original form components
import Service from '../service 13-55-35-040';
import Program from '../program 13-55-35-024';
import Counsel from '../counselTherapy 13-55-34-721';
import Prevent from '../prevent 13-55-34-971';
import Healing from '../healing 13-55-34-767';
import Hrv from '../hrv 13-55-34-925';
import Vibra from '../vibra 13-55-35-075';



// Create enhanced versions of each component
export const EnhancedService = FormDataAdapter(Service);
export const EnhancedProgram = FormDataAdapter(Program);
export const EnhancedCounsel = FormDataAdapter(Counsel);
export const EnhancedPrevent = FormDataAdapter(Prevent);
export const EnhancedHealing = FormDataAdapter(Healing);
export const EnhancedHrv = FormDataAdapter(Hrv);
export const EnhancedVibra = FormDataAdapter(Vibra);

// Export the original components with their original names
export { 
  Service as OriginalService,
  Program as OriginalProgram,
  Counsel as OriginalCounsel,
  Prevent as OriginalPrevent,
  Healing as OriginalHealing,
  Hrv as OriginalHrv,
  Vibra as OriginalVibra
};

// Default exports for backward compatibility
// Export the enhanced versions as the default exports with the original names
export {
  EnhancedService as Service,
  EnhancedProgram as Program,
  EnhancedCounsel as Counsel,
  EnhancedPrevent as Prevent,
  EnhancedHealing as Healing,
  EnhancedHrv as Hrv,
  EnhancedVibra as Vibra
}; 