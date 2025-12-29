const prisma = require('../../../prisma/prismaClient');
const { encrypt } = require('../../../util');

module.exports = {
  // Program Categories Mutations
  createProgramCategory: async (_, { input }) => {
    const { category_name, description, display_order } = input;
    
    return await prisma.programCategory.create({
      data: {
        category_name,
        description,
        display_order: display_order || 0
      }
    });
  },

  updateProgramCategory: async (_, { id, input }) => {
    const { category_name, description, display_order } = input;
    
    return await prisma.programCategory.update({
      where: { id: parseInt(id) },
      data: {
        category_name,
        description,
        display_order: display_order || 0
      }
    });
  },

  deleteProgramCategory: async (_, { id }) => {
    try {
      await prisma.programCategory.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      console.error("Error deleting program category:", error);
      return false;
    }
  },

  // Program Items Mutations
  createProgramItem: async (_, { input }) => {
    const { category_id, program_name, description, display_order } = input;
    
    return await prisma.programItem.create({
      data: {
        category_id: parseInt(category_id),
        program_name,
        description,
        display_order: display_order || 0
      }
    });
  },

  updateProgramItem: async (_, { id, input }) => {
    const { category_id, program_name, description, display_order } = input;
    
    return await prisma.programItem.update({
      where: { id: parseInt(id) },
      data: {
        category_id: parseInt(category_id),
        program_name,
        description,
        display_order: display_order || 0
      }
    });
  },

  deleteProgramItem: async (_, { id }) => {
    try {
      await prisma.programItem.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      console.error("Error deleting program item:", error);
      return false;
    }
  },

  // Location Categories Mutations
  createLocationCategory: async (_, { input }) => {
    const { category_name, description, display_order } = input;
    
    return await prisma.locationCategory.create({
      data: {
        category_name,
        description,
        display_order: display_order || 0
      }
    });
  },

  updateLocationCategory: async (_, { id, input }) => {
    const { category_name, description, display_order } = input;
    
    return await prisma.locationCategory.update({
      where: { id: parseInt(id) },
      data: {
        category_name,
        description,
        display_order: display_order || 0
      }
    });
  },

  deleteLocationCategory: async (_, { id }) => {
    try {
      await prisma.locationCategory.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      console.error("Error deleting location category:", error);
      return false;
    }
  },

  // Locations Mutations
  createLocation: async (_, { input }) => {
    const { location_name, category_id, capacity, description, display_order } = input;
    
    return await prisma.location.create({
      data: {
        location_name,
        category_id: category_id ? parseInt(category_id) : null,
        capacity: capacity ? parseInt(capacity) : null,
        description,
        display_order: display_order || 0
      }
    });
  },

  updateLocation: async (_, { id, input }) => {
    const { location_name, category_id, capacity, description, display_order } = input;
    
    return await prisma.location.update({
      where: { id: parseInt(id) },
      data: {
        location_name,
        category_id: category_id ? parseInt(category_id) : null,
        capacity: capacity ? parseInt(capacity) : null,
        description,
        display_order: display_order || 0
      }
    });
  },

  deleteLocation: async (_, { id }) => {
    try {
      await prisma.location.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      console.error("Error deleting location:", error);
      return false;
    }
  },

  // Instructor Mutations
  createInstructor: async (_, { input }) => {
    const { 
      name, 
      type, 
      category, 
      payment_rate,
      payment,
      tax_rate, 
      specialty, 
      phone, 
      email, 
      description,
      bank_info,
      address,
      contact,
      notes
    } = input;
    
    return await prisma.instructor.create({
      data: {
        name,
        type,
        category,
        payment_rate: payment_rate !== undefined ? payment_rate : 200000,
        payment,
        tax_rate: tax_rate !== undefined ? tax_rate : 0.088,
        specialty,
        phone,
        email,
        description,
        bank_info,
        address,
        contact,
        notes
      }
    });
  },

  updateInstructor: async (_, { id, input }) => {
    const { 
      name, 
      type, 
      category, 
      payment_rate,
      payment,
      tax_rate, 
      specialty, 
      phone, 
      email, 
      description,
      bank_info,
      address,
      contact,
      notes
    } = input;
    
    return await prisma.instructor.update({
      where: { id: parseInt(id) },
      data: {
        name,
        type,
        category,
        payment_rate: payment_rate !== undefined ? payment_rate : undefined,
        payment,
        tax_rate: tax_rate !== undefined ? tax_rate : undefined,
        specialty,
        phone,
        email,
        description,
        bank_info,
        address,
        contact,
        notes
      }
    });
  },

  deleteInstructor: async (_, { id }) => {
    try {
      await prisma.instructor.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      console.error("Error deleting instructor:", error);
      return false;
    }
  },

  // Assistant Instructor Mutations
  createAssistantInstructor: async (_, { input }) => {
    const { name, specialty, phone, email, description } = input;
    
    return await prisma.assistantInstructor.create({
      data: {
        name,
        specialty,
        phone,
        email,
        description
      }
    });
  },

  updateAssistantInstructor: async (_, { id, input }) => {
    const { name, specialty, phone, email, description } = input;
    
    return await prisma.assistantInstructor.update({
      where: { id: parseInt(id) },
      data: {
        name,
        specialty,
        phone,
        email,
        description
      }
    });
  },

  deleteAssistantInstructor: async (_, { id }) => {
    try {
      await prisma.assistantInstructor.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      console.error("Error deleting assistant instructor:", error);
      return false;
    }
  },

  // Helper Mutations
  createHelper: async (_, { input }) => {
    const { name, specialty, phone, email, description } = input;
    
    return await prisma.helper.create({
      data: {
        name,
        specialty,
        phone,
        email,
        description
      }
    });
  },

  updateHelper: async (_, { id, input }) => {
    const { name, specialty, phone, email, description } = input;
    
    return await prisma.helper.update({
      where: { id: parseInt(id) },
      data: {
        name,
        specialty,
        phone,
        email,
        description
      }
    });
  },

  deleteHelper: async (_, { id }) => {
    try {
      await prisma.helper.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      console.error("Error deleting helper:", error);
      return false;
    }
  },

  // Menu Room Mutations
  createMenuRoom: async (_, { input }) => {
    const { 
      room_type, 
      room_name, 
      capacity, 
      price, 
      description, 
      is_available = true, 
      facilities, 
      display_order = 0 
    } = input;
    
    return await prisma.menuRoom.create({
      data: {
        room_type,
        room_name,
        capacity: parseInt(capacity),
        price: parseInt(price),
        description,
        is_available,
        facilities,
        display_order: parseInt(display_order)
      }
    });
  },

  updateMenuRoom: async (_, { id, input }) => {
    const { 
      room_type, 
      room_name, 
      capacity, 
      price, 
      description, 
      is_available, 
      facilities, 
      display_order 
    } = input;
    
    // Get current room to preserve fields that might not be updated
    const currentRoom = await prisma.menuRoom.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!currentRoom) {
      throw new Error(`Room with id ${id} not found`);
    }
    
    return await prisma.menuRoom.update({
      where: { id: parseInt(id) },
      data: {
        room_type,
        room_name,
        capacity: parseInt(capacity),
        price: parseInt(price),
        description,
        is_available: is_available !== undefined ? is_available : currentRoom.is_available,
        facilities,
        display_order: display_order !== undefined ? parseInt(display_order) : currentRoom.display_order
      }
    });
  },

  deleteMenuRoom: async (_, { id }) => {
    try {
      await prisma.menuRoom.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      console.error("Error deleting room:", error);
      return false;
    }
  },

  // User Management Mutations
  createUser: async (_, { input }) => {
    const { user_id, user_name, user_pwd, role, value, viewer_level } = input;
    
    // 비밀번호 암호화
    const encryptedPassword = user_pwd ? encrypt(user_pwd) : null;
    
    return await prisma.user.create({
      data: {
        user_id,
        user_name,
        user_pwd: encryptedPassword,
        role: role || 'pending',
        value: value || '1',
        viewer_level: viewer_level || '1'
      }
    });
  },

  updateUser: async (_, { id, input }) => {
    const { user_id, user_name, user_pwd, role, value, viewer_level } = input;
    
    // Get current user to preserve fields that might not be updated
    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!currentUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    // Build update object based on provided fields
    const updateData = {};
    if (user_id) updateData.user_id = user_id;
    if (user_name) updateData.user_name = user_name;
    if (user_pwd) updateData.user_pwd = encrypt(user_pwd); // 비밀번호 암호화
    if (role) updateData.role = role;
    if (value) updateData.value = value;
    if (viewer_level) updateData.viewer_level = viewer_level;
    
    return await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData
    });
  },

  deleteUser: async (_, { id }) => {
    try {
      await prisma.user.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
}; 