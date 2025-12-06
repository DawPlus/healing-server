const prisma = require('../../../prisma/prismaClient');

module.exports = {
  createPage2: async (_, { input }) => {
    try {
      const newPage2 = await prisma.page2.create({
        data: {
          page1_id: input.page1_id,
          male_count: input.male_count || 0,
          female_count: input.female_count || 0,
          total_count: input.total_count || 0,
          male_leader_count: input.male_leader_count || 0,
          female_leader_count: input.female_leader_count || 0,
          total_leader_count: input.total_leader_count || 0,
          is_mou: input.is_mou || false,
          org_nature: input.org_nature,
          part_type: input.part_type,
          age_type: input.age_type,
          part_form: input.part_form,
          service_type: input.service_type,
          infant_count: input.infant_count || 0,
          elementary_count: input.elementary_count || 0,
          middle_count: input.middle_count || 0,
          high_count: input.high_count || 0,
          adult_count: input.adult_count || 0,
          elderly_count: input.elderly_count || 0,
          age_group_total: (
            (input.infant_count || 0) + 
            (input.elementary_count || 0) + 
            (input.middle_count || 0) + 
            (input.high_count || 0) + 
            (input.adult_count || 0) + 
            (input.elderly_count || 0)
          )
        },
        include: {
          page1: true,
          programs: true
        }
      });
      
      return newPage2;
    } catch (error) {
      console.error('Error creating Page2:', error);
      throw new Error(`Failed to create Page2 record: ${error.message}`);
    }
  },

  updatePage2: async (_, { id, input }) => {
    try {
      const updatedPage2 = await prisma.page2.update({
        where: { id },
        data: {
          page1_id: input.page1_id,
          male_count: input.male_count || 0,
          female_count: input.female_count || 0,
          total_count: input.total_count || 0,
          male_leader_count: input.male_leader_count || 0,
          female_leader_count: input.female_leader_count || 0,
          total_leader_count: input.total_leader_count || 0,
          is_mou: input.is_mou || false,
          org_nature: input.org_nature,
          part_type: input.part_type,
          age_type: input.age_type,
          part_form: input.part_form,
          service_type: input.service_type,
          infant_count: input.infant_count || 0,
          elementary_count: input.elementary_count || 0,
          middle_count: input.middle_count || 0,
          high_count: input.high_count || 0,
          adult_count: input.adult_count || 0,
          elderly_count: input.elderly_count || 0,
          age_group_total: (
            (input.infant_count || 0) + 
            (input.elementary_count || 0) + 
            (input.middle_count || 0) + 
            (input.high_count || 0) + 
            (input.adult_count || 0) + 
            (input.elderly_count || 0)
          )
        },
        include: {
          page1: true,
          programs: true
        }
      });
      
      return updatedPage2;
    } catch (error) {
      console.error('Error updating Page2:', error);
      throw new Error(`Failed to update Page2 record: ${error.message}`);
    }
  },

  deletePage2: async (_, { id }) => {
    try {
      // First delete all associated programs
      await prisma.page2Program.deleteMany({
        where: { reservation_id: id }
      });
      
      // Then delete the page2 reservation
      await prisma.page2.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting Page2 with ID ${id}:`, error);
      throw new Error(`Failed to delete Page2 record: ${error.message}`);
    }
  },
  
  createPage2Program: async (parent, { input }, { prisma }) => {
    console.log('[page2.js] Creating Page2Program with input:', input);
    
    // Verify reservation_id exists and is valid
    if (!input.reservation_id) {
      throw new Error('reservation_id is required');
    }
    
    // Check if reservation exists
    const reservation = await prisma.page2.findUnique({
      where: { id: input.reservation_id }
    });
    
    if (!reservation) {
      throw new Error(`Reservation with ID ${input.reservation_id} not found`);
    }
    
    // Get names based on IDs if not provided directly
    let instructorName = input.instructor_name;
    let assistantName = input.assistant_name;
    let helperName = input.helper_name;
    
    // Convert potential numeric IDs to strings for consistency
    if (input.instructor) input.instructor = String(input.instructor);
    if (input.assistant) input.assistant = String(input.assistant);
    if (input.helper) input.helper = String(input.helper);
    if (input.category) input.category = String(input.category);
    if (input.program) input.program = String(input.program);
    if (input.place) input.place = String(input.place);
    
    // If names not provided, try to retrieve them
    if (!instructorName && input.instructor) {
      const instructor = await prisma.instructor.findUnique({
        where: { id: input.instructor }
      });
      instructorName = instructor?.name || '';
    }
    
    if (!assistantName && input.assistant) {
      const assistant = await prisma.assistant.findUnique({
        where: { id: input.assistant }
      });
      assistantName = assistant?.name || '';
    }
    
    if (!helperName && input.helper) {
      const helper = await prisma.helper.findUnique({
        where: { id: input.helper }
      });
      helperName = helper?.name || '';
    }
    
    // Create the program with validated data
    const createData = {
      reservation_id: input.reservation_id,
      category: input.category || '',
      category_name: input.category_name || '',
      program: input.program || '',
      program_name: input.program_name || '',
      date: input.date || null,
      start_time: input.start_time || null,
      end_time: input.end_time || null,
      duration: input.duration || null,
      place: input.place || '',
      place_name: input.place_name || '',
      instructor: input.instructor || '',
      instructor_name: instructorName || '',
      assistant: input.assistant || '',
      assistant_name: assistantName || '',
      helper: input.helper || '',
      helper_name: helperName || '',
      price: input.price || 0,
      participants: input.participants || 0,
      is_multi: input.is_multi || false,
      multi1_name: input.multi1_name || null,
      multi2_name: input.multi2_name || null,
      notes: input.notes || null
    };
    
    console.log('[page2.js] Creating Page2Program with processed data:', createData);
    
    try {
      const program = await prisma.page2Program.create({
        data: createData
      });
      
      console.log('[page2.js] Created Page2Program:', program);
      return program;
    } catch (error) {
      console.error('[page2.js] Error creating Page2Program:', error);
      throw new Error(`Failed to create program: ${error.message}`);
    }
  },
  
  updatePage2Program: async (parent, { id, input }, { prisma }) => {
    console.log('[page2.js] Updating Page2Program with ID:', id, 'and input:', input);
    
    if (!id) {
      throw new Error('Program ID is required for update');
    }
    
    // Check if program exists
    const existingProgram = await prisma.page2Program.findUnique({
      where: { id }
    });
    
    if (!existingProgram) {
      throw new Error(`Program with ID ${id} not found`);
    }
    
    // Convert potential numeric IDs to strings for consistency
    if (input.instructor) input.instructor = String(input.instructor);
    if (input.assistant) input.assistant = String(input.assistant);
    if (input.helper) input.helper = String(input.helper);
    if (input.category) input.category = String(input.category);
    if (input.program) input.program = String(input.program);
    if (input.place) input.place = String(input.place);
    
    // Get names based on IDs if not provided
    let instructorName = input.instructor_name;
    let assistantName = input.assistant_name;
    let helperName = input.helper_name;
    
    if (!instructorName && input.instructor) {
      const instructor = await prisma.instructor.findUnique({
        where: { id: input.instructor }
      });
      instructorName = instructor?.name || '';
    }
    
    if (!assistantName && input.assistant) {
      const assistant = await prisma.assistant.findUnique({
        where: { id: input.assistant }
      });
      assistantName = assistant?.name || '';
    }
    
    if (!helperName && input.helper) {
      const helper = await prisma.helper.findUnique({
        where: { id: input.helper }
      });
      helperName = helper?.name || '';
    }
    
    // Create update data with validated fields
    const updateData = {
      ...(input.reservation_id && { reservation_id: input.reservation_id }),
      ...(input.category !== undefined && { category: input.category || '' }),
      ...(input.category_name !== undefined && { category_name: input.category_name || '' }),
      ...(input.program !== undefined && { program: input.program || '' }),
      ...(input.program_name !== undefined && { program_name: input.program_name || '' }),
      ...(input.date !== undefined && { date: input.date }),
      ...(input.start_time !== undefined && { start_time: input.start_time }),
      ...(input.end_time !== undefined && { end_time: input.end_time }),
      ...(input.duration !== undefined && { duration: input.duration }),
      ...(input.place !== undefined && { place: input.place || '' }),
      ...(input.place_name !== undefined && { place_name: input.place_name || '' }),
      ...(input.instructor !== undefined && { instructor: input.instructor || '' }),
      ...(instructorName !== undefined && { instructor_name: instructorName || '' }),
      ...(input.assistant !== undefined && { assistant: input.assistant || '' }),
      ...(assistantName !== undefined && { assistant_name: assistantName || '' }),
      ...(input.helper !== undefined && { helper: input.helper || '' }),
      ...(helperName !== undefined && { helper_name: helperName || '' }),
      ...(input.price !== undefined && { price: input.price || 0 }),
      ...(input.participants !== undefined && { participants: input.participants || 0 }),
      ...(input.is_multi !== undefined && { is_multi: input.is_multi }),
      ...(input.multi1_name !== undefined && { multi1_name: input.multi1_name }),
      ...(input.multi2_name !== undefined && { multi2_name: input.multi2_name }),
      ...(input.notes !== undefined && { notes: input.notes || '' })
    };
    
    console.log('[page2.js] Updating Page2Program with processed data:', updateData);
    
    try {
      const updatedProgram = await prisma.page2Program.update({
        where: { id },
        data: updateData
      });
      
      console.log('[page2.js] Updated Page2Program:', updatedProgram);
      return updatedProgram;
    } catch (error) {
      console.error('[page2.js] Error updating Page2Program:', error);
      throw new Error(`Failed to update program: ${error.message}`);
    }
  },
  
  deletePage2Program: async (parent, { id }, { prisma }) => {
    console.log('[page2.js] Deleting Page2Program with ID:', id);
    
    if (!id) {
      throw new Error('Program ID is required for deletion');
    }
    
    // Check if program exists
    const existingProgram = await prisma.page2Program.findUnique({
      where: { id }
    });
    
    if (!existingProgram) {
      throw new Error(`Program with ID ${id} not found`);
    }
    
    try {
      await prisma.page2Program.delete({
        where: { id }
      });
      
      console.log('[page2.js] Deleted Page2Program:', id);
      return true; // Return boolean true on success
    } catch (error) {
      console.error('[page2.js] Error deleting Page2Program:', error);
      throw new Error(`Failed to delete program: ${error.message}`);
    }
  }
};
