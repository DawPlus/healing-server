const prisma = require('../../../prisma/prismaClient');

/**
 * Service form query resolvers
 */
const resolvers = {
  getServiceForm: async (_, { id }) => {
    try {
      const form = await prisma.serviceForm.findUnique({
        where: { id: parseInt(id) }
      });
      return form;
    } catch (error) {
      console.error('Error fetching service form:', error);
      throw new Error('Failed to fetch service form');
    }
  },
  
  getServiceForms: async (_, { agency, openday, eval_date, agency_id }) => {
    try {
      const where = {};
      if (agency) where.agency = agency;
      if (openday) where.openday = openday;
      if (eval_date) where.eval_date = eval_date;
      if (agency_id) where.agency_id = agency_id;
      
      const forms = await prisma.serviceForm.findMany({
        where,
        orderBy: { created_at: 'desc' }
      });
      return forms;
    } catch (error) {
      console.error('Error fetching service forms:', error);
      throw new Error('Failed to fetch service forms');
    }
  },
  
  getProgramForm: async (_, { id }) => {
    try {
      const form = await prisma.programForm.findUnique({
        where: { id: parseInt(id) }
      });
      return form;
    } catch (error) {
      console.error('Error fetching program form:', error);
      throw new Error('Failed to fetch program form');
    }
  },
  
  getProgramForms: async (_, { agency, agency_id, openday, eval_date }) => {
    console.log('getProgramForms request:', { agency, agency_id, openday, eval_date });
    try {
      const where = {};
      if (agency) where.agency = agency;
      if (agency_id) where.agency_id = agency_id;
      if (openday) where.openday = openday;
      if (eval_date) where.eval_date = eval_date;
      
      console.log('getProgramForms query conditions:', where);
      
      const forms = await prisma.programForm.findMany({
        where,
        orderBy: { created_at: 'desc' },
        ...(Object.keys(where).length === 0 ? { take: 10 } : {})
      });
      
      console.log(`getProgramForms results: ${forms.length} records found`);
      return forms;
    } catch (error) {
      console.error('Error fetching program forms:', error);
      throw new Error('Failed to fetch program forms');
    }
  },
  
  getCounselTherapyForm: async (_, { id }) => {
    try {
      const form = await prisma.counselTherapyForm.findUnique({
        where: { id: parseInt(id) }
      });
      return form;
    } catch (error) {
      console.error('Error fetching counsel therapy form:', error);
      throw new Error('Failed to fetch counsel therapy form');
    }
  },
  
  getCounselTherapyForms: async (_, { agency, agency_id, openday, eval_date }) => {
    console.log('getCounselTherapyForms request:', { agency, agency_id, openday, eval_date });
    try {
      const where = {};
      if (agency) where.agency = agency;
      if (agency_id) where.agency_id = agency_id;
      if (openday) where.openday = openday;
      if (eval_date) where.eval_date = eval_date;
      
      console.log('getCounselTherapyForms query conditions:', where);
      
      const forms = await prisma.counselTherapyForm.findMany({
        where,
        orderBy: { created_at: 'desc' },
        ...(Object.keys(where).length === 0 ? { take: 10 } : {})
      });
      
      console.log(`getCounselTherapyForms results: ${forms.length} records found`);
      return forms;
    } catch (error) {
      console.error('Error fetching counsel therapy forms:', error);
      throw new Error('Failed to fetch counsel therapy forms');
    }
  },
  
  getPreventForm: async (_, { id }) => {
    try {
      const form = await prisma.preventForm.findUnique({
        where: { id: parseInt(id) }
      });
      return form;
    } catch (error) {
      console.error('Error fetching prevent form:', error);
      throw new Error('Failed to fetch prevent form');
    }
  },
  
  getPreventForms: async (_, { agency, agency_id, openday, eval_date }) => {
    console.log('getPreventForms request:', { agency, agency_id, openday, eval_date });
    try {
      const where = {};
      if (agency) where.agency = agency;
      if (agency_id) where.agency_id = agency_id;
      if (openday) where.openday = openday;
      if (eval_date) where.eval_date = eval_date;
      
      console.log('getPreventForms query conditions:', where);
      
      const forms = await prisma.preventForm.findMany({
        where,
        orderBy: { created_at: 'desc' },
        ...(Object.keys(where).length === 0 ? { take: 10 } : {})
      });
      
      console.log(`getPreventForms results: ${forms.length} records found`);
      return forms;
    } catch (error) {
      console.error('Error fetching prevent forms:', error);
      throw new Error('Failed to fetch prevent forms');
    }
  },
  
  getHealingForm: async (_, { id }) => {
    try {
      const form = await prisma.healingForm.findUnique({
        where: { id: parseInt(id) }
      });
      return form;
    } catch (error) {
      console.error('Error fetching healing form:', error);
      throw new Error('Failed to fetch healing form');
    }
  },
  
  getHealingForms: async (_, { agency, agency_id, openday, eval_date }) => {
    console.log('getHealingForms request:', { agency, agency_id, openday, eval_date });
    try {
      const where = {};
      if (agency) where.agency = agency;
      if (agency_id) where.agency_id = agency_id;
      if (openday) where.openday = openday;
      if (eval_date) where.eval_date = eval_date;
      
      console.log('getHealingForms query conditions:', where);
      
      const forms = await prisma.healingForm.findMany({
        where,
        orderBy: { created_at: 'desc' },
        ...(Object.keys(where).length === 0 ? { take: 10 } : {})
      });
      
      console.log(`getHealingForms results: ${forms.length} records found`);
      return forms;
    } catch (error) {
      console.error('Error fetching healing forms:', error);
      throw new Error('Failed to fetch healing forms');
    }
  },
  
  getHrvForm: async (_, { id }) => {
    try {
      const form = await prisma.hrvForm.findUnique({
        where: { id: parseInt(id) }
      });
      return form;
    } catch (error) {
      console.error('Error fetching HRV form:', error);
      throw new Error('Failed to fetch HRV form');
    }
  },
  
  getHrvForms: async (_, { agency, agency_id, openday, eval_date }) => {
    console.log('getHrvForms request:', { agency, agency_id, openday, eval_date });
    try {
      const where = {};
      if (agency) where.agency = agency;
      if (agency_id) where.agency_id = agency_id;
      if (openday) where.openday = openday;
      if (eval_date) where.eval_date = eval_date;
      
      console.log('getHrvForms query conditions:', where);
      
      const forms = await prisma.hrvForm.findMany({
        where,
        orderBy: { created_at: 'desc' },
        ...(Object.keys(where).length === 0 ? { take: 10 } : {})
      });
      
      console.log(`getHrvForms results: ${forms.length} records found`);
      return forms;
    } catch (error) {
      console.error('Error fetching HRV forms:', error);
      throw new Error('Failed to fetch HRV forms');
    }
  },
  
  getVibraForm: async (_, { id }) => {
    try {
      const form = await prisma.vibraForm.findUnique({
        where: { id: parseInt(id) }
      });
      return form;
    } catch (error) {
      console.error('Error fetching Vibra form:', error);
      throw new Error('Failed to fetch Vibra form');
    }
  },
  
  getVibraForms: async (_, { agency, agency_id, openday, eval_date }) => {
    console.log('getVibraForms request:', { agency, agency_id, openday, eval_date });
    try {
      const where = {};
      if (agency) where.agency = agency;
      if (agency_id) where.agency_id = agency_id;
      if (openday) where.openday = openday;
      if (eval_date) where.eval_date = eval_date;
      
      console.log('getVibraForms query conditions:', where);
      
      const forms = await prisma.vibraForm.findMany({
        where,
        orderBy: { created_at: 'desc' },
        ...(Object.keys(where).length === 0 ? { take: 10 } : {})
      });
      
      console.log(`getVibraForms results: ${forms.length} records found`);
      return forms;
    } catch (error) {
      console.error('Error fetching Vibra forms:', error);
      throw new Error('Failed to fetch Vibra forms');
    }
  }
};

module.exports = resolvers; 