/**
 * Utility functions for personnel management in programs
 */

// Format time for display (HH:MM)
export const formatTimeNoSeconds = (timeStr) => {
  if (!timeStr) return '';
  // If the time has seconds (HH:MM:SS), remove them
  if (timeStr.length > 5) {
    return timeStr.substring(0, 5);
  }
  return timeStr;
};

// Check for booking conflicts (same date, time, and location)
export const checkForBookingConflict = (newProgram, programs, editingProgramId, externalPrograms = []) => {
  // If we don't have date, time or place, no conflict can be detected
  if (!newProgram.date || !newProgram.start_time || !newProgram.place) {
    return false;
  }
  
  // First, check against our own programs
  const hasInternalConflict = programs.some(existingProgram => {
    // Skip the program itself if we're editing
    if (existingProgram.id === (newProgram.id || editingProgramId)) {
      return false;
    }
    
    // Check if dates match
    const sameDate = existingProgram.date && new Date(existingProgram.date).toDateString() === new Date(newProgram.date).toDateString();
    if (!sameDate) return false;
    
    // Check if the place is the same
    const samePlace = existingProgram.place === newProgram.place;
    if (!samePlace) return false;
    
    // Check if time overlaps
    const existingStart = existingProgram.start_time;
    const existingEnd = existingProgram.end_time;
    const newStart = newProgram.start_time;
    const newEnd = newProgram.end_time;
    
    if (!existingStart || !existingEnd || !newStart || !newEnd) {
      return false;
    }
    
    // Check for time overlap
    return (
      (newStart >= existingStart && newStart < existingEnd) || // New program starts during existing program
      (newEnd > existingStart && newEnd <= existingEnd) ||     // New program ends during existing program
      (newStart <= existingStart && newEnd >= existingEnd)     // New program completely contains existing program
    );
  });
  
  if (hasInternalConflict) {
    return true;
  }
  
  // Then, check against external programs (from other groups) if provided
  if (externalPrograms && externalPrograms.length > 0) {
    return externalPrograms.some(existingProgram => {
      // Check if dates match
      const sameDate = existingProgram.date && new Date(existingProgram.date).toDateString() === new Date(newProgram.date).toDateString();
      if (!sameDate) return false;
      
      // Check if the place is the same
      const samePlace = existingProgram.place === newProgram.place;
      if (!samePlace) return false;
      
      // Check if time overlaps
      const existingStart = existingProgram.start_time;
      const existingEnd = existingProgram.end_time;
      const newStart = newProgram.start_time;
      const newEnd = newProgram.end_time;
      
      if (!existingStart || !existingEnd || !newStart || !newEnd) {
        return false;
      }
      
      // Check for time overlap
      const isOverlapping = (
        (newStart >= existingStart && newStart < existingEnd) || // New program starts during existing program
        (newEnd > existingStart && newEnd <= existingEnd) ||     // New program ends during existing program
        (newStart <= existingStart && newEnd >= existingEnd)     // New program completely contains existing program
      );
      
      return isOverlapping;
    });
  }
  
  return false;
};

// Check for personnel conflicts (same person assigned to overlapping time slots on same date)
export const checkForPersonnelConflict = (
  newProgram, 
  programs, 
  editingProgramId,
  getInstructorName,
  getAssistantName,
  getHelperName
) => {
  // If we don't have date, time, or personnel, no conflict can be detected
  if (!newProgram.date || !newProgram.start_time || !newProgram.end_time || 
      (!newProgram.instructor && !newProgram.assistant && !newProgram.helper)) {
    return { hasConflict: false };
  }
  
  // Check against existing programs
  for (const existingProgram of programs) {
    // Skip the program itself if we're editing
    if (existingProgram.id === (newProgram.id || editingProgramId)) {
      continue;
    }
    
    // Check if dates match
    const sameDate = existingProgram.date && new Date(existingProgram.date).toDateString() === new Date(newProgram.date).toDateString();
    if (!sameDate) continue;
    
    // Check if time overlaps
    const existingStart = existingProgram.start_time;
    const existingEnd = existingProgram.end_time;
    const newStart = newProgram.start_time;
    const newEnd = newProgram.end_time;
    
    if (!existingStart || !existingEnd || !newStart || !newEnd) {
      continue;
    }
    
    // Check for time overlap
    const timeOverlap = (
      (newStart >= existingStart && newStart < existingEnd) || // New program starts during existing program
      (newEnd > existingStart && newEnd <= existingEnd) ||     // New program ends during existing program
      (newStart <= existingStart && newEnd >= existingEnd)     // New program completely contains existing program
    );
    
    if (!timeOverlap) continue;
    
    // Check if any personnel overlaps
    const instructorConflict = newProgram.instructor && 
                             existingProgram.instructor && 
                             newProgram.instructor === existingProgram.instructor;
    
    const assistantConflict = newProgram.assistant && 
                            existingProgram.assistant && 
                            newProgram.assistant === existingProgram.assistant;
    
    const helperConflict = newProgram.helper && 
                         existingProgram.helper && 
                         newProgram.helper === existingProgram.helper;
    
    if (instructorConflict || assistantConflict || helperConflict) {
      return { 
        hasConflict: true, 
        conflictType: instructorConflict ? 'instructor' : 
                      assistantConflict ? 'assistant' : 'helper',
        conflictName: instructorConflict ? (existingProgram.instructor_name || getInstructorName(existingProgram.instructor)) : 
                      assistantConflict ? (existingProgram.assistant_name || getAssistantName(existingProgram.assistant)) : 
                      (existingProgram.helper_name || getHelperName(existingProgram.helper)),
        existingProgram
      };
    }
  }
  
  return { hasConflict: false };
};

// 모든 예약에 걸쳐 인원 충돌을 검사하는 함수 (글로벌 충돌 검사)
export const checkForGlobalPersonnelConflict = (
  newProgram,
  allPrograms,
  editingProgramId,
  getInstructorName,
  getAssistantName,
  getHelperName
) => {
  // If we don't have date, time, or personnel, no conflict can be detected
  if (!newProgram.date || !newProgram.start_time || !newProgram.end_time || 
      (!newProgram.instructor && !newProgram.assistant && !newProgram.helper)) {
    return { hasConflict: false };
  }
  
  // Check against all programs from all reservations
  for (const existingProgram of allPrograms) {
    // Skip the program itself if we're editing
    if (existingProgram.id === (newProgram.id || editingProgramId)) {
      continue;
    }
    
    // Check if dates match
    const sameDate = existingProgram.date && new Date(existingProgram.date).toDateString() === new Date(newProgram.date).toDateString();
    if (!sameDate) continue;
    
    // Check if time overlaps
    const existingStart = existingProgram.start_time;
    const existingEnd = existingProgram.end_time;
    const newStart = newProgram.start_time;
    const newEnd = newProgram.end_time;
    
    if (!existingStart || !existingEnd || !newStart || !newEnd) {
      continue;
    }
    
    // Check for time overlap
    const timeOverlap = (
      (newStart >= existingStart && newStart < existingEnd) || // New program starts during existing program
      (newEnd > existingStart && newEnd <= existingEnd) ||     // New program ends during existing program
      (newStart <= existingStart && newEnd >= existingEnd)     // New program completely contains existing program
    );
    
    if (!timeOverlap) continue;
    
    // Check if any personnel overlaps
    const instructorConflict = newProgram.instructor && 
                             existingProgram.instructor && 
                             newProgram.instructor === existingProgram.instructor;
    
    const assistantConflict = newProgram.assistant && 
                            existingProgram.assistant && 
                            newProgram.assistant === existingProgram.assistant;
    
    const helperConflict = newProgram.helper && 
                         existingProgram.helper && 
                         newProgram.helper === existingProgram.helper;
    
    if (instructorConflict || assistantConflict || helperConflict) {
      // 충돌 정보에 예약/단체 정보 포함
      const reservationInfo = existingProgram.reservation?.page1 ? {
        group_name: existingProgram.reservation.page1.group_name || '알 수 없는 단체',
        customer_name: existingProgram.reservation.page1.customer_name || '알 수 없는 담당자',
        reservation_status: existingProgram.reservation.page1.reservation_status || '알 수 없음'
      } : {
        group_name: '알 수 없는 단체',
        customer_name: '알 수 없는 담당자',
        reservation_status: '알 수 없음'
      };
      
      return { 
        hasConflict: true, 
        conflictType: instructorConflict ? 'instructor' : 
                      assistantConflict ? 'assistant' : 'helper',
        conflictName: instructorConflict ? (existingProgram.instructor_name || getInstructorName(existingProgram.instructor)) : 
                      assistantConflict ? (existingProgram.assistant_name || getAssistantName(existingProgram.assistant)) : 
                      (existingProgram.helper_name || getHelperName(existingProgram.helper)),
        existingProgram,
        isGlobal: true,
        reservationInfo
      };
    }
  }
  
  return { hasConflict: false };
}; 