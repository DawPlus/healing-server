const prisma = require('../../../prisma/prismaClient');

module.exports = {
  // Create a new Page5 document
  createPage5Document: async (_, { input }) => {
    try {
      console.log('Creating new Page5 document with input:', input);
      
      // Check if page1_id exists before creating the document
      if (input.page1_id) {
        const page1 = await prisma.page1.findUnique({
          where: { id: input.page1_id }
        });
        
        if (!page1) {
          throw new Error(`Page1 record with id ${input.page1_id} not found`);
        }
      }
      
      // Create the new document
      const newDocument = await prisma.page5Document.create({
        data: {
          page1_id: input.page1_id,
          document_type: input.document_type,
          status: input.status || 'draft',
          organization_name: input.organization_name,
          contact_name: input.contact_name,
          contact_email: input.contact_email,
          contact_phone: input.contact_phone,
          reservation_date: input.reservation_date ? new Date(input.reservation_date) : null,
          reservation_code: input.reservation_code,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      
      return newDocument;
    } catch (error) {
      console.error('Error creating Page5 document:', error);
      throw new Error(`Failed to create Page5 document: ${error.message}`);
    }
  },
  
  // Update an existing Page5 document
  updatePage5Document: async (_, { id, input }) => {
    try {
      console.log(`Updating Page5 document id ${id} with input:`, input);
      
      // Check if document exists
      const existingDocument = await prisma.page5Document.findUnique({
        where: { id }
      });
      
      if (!existingDocument) {
        throw new Error(`Page5 document with id ${id} not found`);
      }
      
      // If page1_id is changing, verify the new page1 exists
      if (input.page1_id && input.page1_id !== existingDocument.page1_id) {
        const page1 = await prisma.page1.findUnique({
          where: { id: input.page1_id }
        });
        
        if (!page1) {
          throw new Error(`Page1 record with id ${input.page1_id} not found`);
        }
      }
      
      // Update the document
      const updatedDocument = await prisma.page5Document.update({
        where: { id },
        data: {
          page1_id: input.page1_id !== undefined ? input.page1_id : undefined,
          document_type: input.document_type !== undefined ? input.document_type : undefined,
          status: input.status !== undefined ? input.status : undefined,
          organization_name: input.organization_name !== undefined ? input.organization_name : undefined,
          contact_name: input.contact_name !== undefined ? input.contact_name : undefined,
          contact_email: input.contact_email !== undefined ? input.contact_email : undefined,
          contact_phone: input.contact_phone !== undefined ? input.contact_phone : undefined,
          reservation_date: input.reservation_date !== undefined ? new Date(input.reservation_date) : undefined,
          reservation_code: input.reservation_code !== undefined ? input.reservation_code : undefined,
          updated_at: new Date()
        }
      });
      
      return updatedDocument;
    } catch (error) {
      console.error('Error updating Page5 document:', error);
      throw new Error(`Failed to update Page5 document: ${error.message}`);
    }
  },
  
  // Delete a Page5 document
  deletePage5Document: async (_, { id }) => {
    try {
      console.log(`Deleting Page5 document id ${id}`);
      
      // Check if document exists
      const existingDocument = await prisma.page5Document.findUnique({
        where: { id }
      });
      
      if (!existingDocument) {
        throw new Error(`Page5 document with id ${id} not found`);
      }
      
      // Delete the document
      await prisma.page5Document.delete({
        where: { id }
      });
      
      return { id, success: true };
    } catch (error) {
      console.error('Error deleting Page5 document:', error);
      throw new Error(`Failed to delete Page5 document: ${error.message}`);
    }
  }
};