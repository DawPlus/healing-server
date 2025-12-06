// 공유 Prisma 인스턴스 사용
const prisma = require('../../../prisma/prismaClient');

/**
 * Service form mutation resolvers
 */
const resolvers = {
  // Service Form mutations
  createServiceForm: async (_, { input }) => {
    try {
      // Create the form with all fields directly
      const form = await prisma.serviceForm.create({
        data: {
          agency: input.agency,
          agency_id: input.agency_id || null,
          openday: input.openday,
          eval_date: input.eval_date,
          ptcprogram: input.ptcprogram,
          service_seq: input.service_seq || null,
          sex: input.sex || "미기재",
          age: input.age || "",
          residence: input.residence || "미기재",
          job: input.job || "",
          score1: input.score1 || "",
          score2: input.score2 || "",
          score3: input.score3 || "",
          score4: input.score4 || "",
          score5: input.score5 || "",
          score6: input.score6 || "",
          score7: input.score7 || "",
          score8: input.score8 || "",
          score9: input.score9 || "",
          score10: input.score10 || "",
          facility_opinion: input.facility_opinion || "",
          score11: input.score11 || "",
          score12: input.score12 || "",
          score13: input.score13 || "",
          score14: input.score14 || "",
          score15: input.score15 || "",
          score16: input.score16 || "",
          operation_opinion: input.operation_opinion || "",
          score17: input.score17 || "",
          score18: input.score18 || "",
          score19: input.score19 || "",
          score20: input.score20 || "",
          score21: input.score21 || "",
          score22: input.score22 || "",
          score23: input.score23 || "",
          score24: input.score24 || "",
          score25: input.score25 || "",
          score26: input.score26 || "",
          score27: input.score27 || "",
          score28: input.score28 || ""
        }
      });
      
      return form;
    } catch (error) {
      console.error('Error creating service form:', error);
      throw new Error('Failed to create service form');
    }
  },
  
  updateServiceForm: async (_, { id, input }) => {
    try {
      // Get existing form to verify it exists
      const existingForm = await prisma.serviceForm.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!existingForm) {
        throw new Error(`Service form with ID ${id} not found`);
      }
      
      // Update the form with all fields directly
      const updatedForm = await prisma.serviceForm.update({
        where: { id: parseInt(id) },
        data: {
          agency: input.agency,
          agency_id: input.agency_id || null,
          openday: input.openday,
          eval_date: input.eval_date,
          ptcprogram: input.ptcprogram,
          service_seq: input.service_seq || null,
          sex: input.sex || "미기재",
          age: input.age || "",
          residence: input.residence || "미기재",
          job: input.job || "",
          score1: input.score1 || "",
          score2: input.score2 || "",
          score3: input.score3 || "",
          score4: input.score4 || "",
          score5: input.score5 || "",
          score6: input.score6 || "",
          score7: input.score7 || "",
          score8: input.score8 || "",
          score9: input.score9 || "",
          score10: input.score10 || "",
          facility_opinion: input.facility_opinion || "",
          score11: input.score11 || "",
          score12: input.score12 || "",
          score13: input.score13 || "",
          score14: input.score14 || "",
          score15: input.score15 || "",
          score16: input.score16 || "",
          operation_opinion: input.operation_opinion || "",
          score17: input.score17 || "",
          score18: input.score18 || "",
          score19: input.score19 || "",
          score20: input.score20 || "",
          score21: input.score21 || "",
          score22: input.score22 || "",
          score23: input.score23 || "",
          score24: input.score24 || "",
          score25: input.score25 || "",
          score26: input.score26 || "",
          score27: input.score27 || "",
          score28: input.score28 || ""
        }
      });
      
      return updatedForm;
    } catch (error) {
      console.error('Error updating service form:', error);
      throw new Error('Failed to update service form');
    }
  },
  
  deleteServiceForm: async (_, { id }) => {
    try {
      await prisma.serviceForm.delete({
        where: { id: parseInt(id) }
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting service form:', error);
      throw new Error('Failed to delete service form');
    }
  },
  
  // Program Form mutations
  createProgramForm: async (_, { input }) => {
    try {
      // Create the form with all fields directly
      const form = await prisma.programForm.create({
        data: {
          agency: input.agency,
          agency_id: input.agency_id || null,
          openday: input.openday,
          eval_date: input.eval_date,
          ptcprogram: input.ptcprogram,
          program_id: input.program_id || null,
          program_category_id: input.program_category_id || null,
          teacher_id: input.teacher_id || null,
          place: input.place || null,
          program_seq: input.program_seq || null,
          sex: input.sex || "미기재",
          age: input.age || "",
          residence: input.residence || "미기재",
          job: input.job || "",
          type: input.type || "참여자",
          score1: input.score1 || "",
          score2: input.score2 || "",
          score3: input.score3 || "",
          score4: input.score4 || "",
          score5: input.score5 || "",
          score6: input.score6 || "",
          score7: input.score7 || "",
          score8: input.score8 || "",
          score9: input.score9 || "",
          score10: input.score10 || "",
          score11: input.score11 || "",
          score12: input.score12 || "",
          expectation: input.expectation || "",
          improvement: input.improvement || ""
        }
      });
      
      return form;
    } catch (error) {
      console.error('Error creating program form:', error);
      throw new Error('Failed to create program form');
    }
  },
  
  updateProgramForm: async (_, { id, input }) => {
    try {
      // Get existing form to verify it exists
      const existingForm = await prisma.programForm.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!existingForm) {
        throw new Error(`Program form with ID ${id} not found`);
      }
      
      // Update the form with all fields directly
      const updatedForm = await prisma.programForm.update({
        where: { id: parseInt(id) },
        data: {
          agency: input.agency,
          agency_id: input.agency_id || null,
          openday: input.openday,
          eval_date: input.eval_date,
          ptcprogram: input.ptcprogram,
          program_id: input.program_id || null,
          program_category_id: input.program_category_id || null,
          teacher_id: input.teacher_id || null,
          place: input.place || null,
          program_seq: input.program_seq || null,
          sex: input.sex || "미기재",
          age: input.age || "",
          residence: input.residence || "미기재",
          job: input.job || "",
          type: input.type || "참여자",
          score1: input.score1 || "",
          score2: input.score2 || "",
          score3: input.score3 || "",
          score4: input.score4 || "",
          score5: input.score5 || "",
          score6: input.score6 || "",
          score7: input.score7 || "",
          score8: input.score8 || "",
          score9: input.score9 || "",
          score10: input.score10 || "",
          score11: input.score11 || "",
          score12: input.score12 || "",
          expectation: input.expectation || "",
          improvement: input.improvement || ""
        }
      });
      
      return updatedForm;
    } catch (error) {
      console.error('Error updating program form:', error);
      throw new Error('Failed to update program form');
    }
  },
  
  deleteProgramForm: async (_, { id }) => {
    try {
      // Prisma will cascade delete the entries due to the relation
      await prisma.programForm.delete({
        where: { id: parseInt(id) }
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting program form:', error);
      throw new Error('Failed to delete program form');
    }
  },
  
  // Counsel Form mutations
  createCounselTherapyForm: async (_, { input }) => {
    try {
      // Create the form with all fields directly
      const form = await prisma.counselTherapyForm.create({
        data: {
          agency: input.agency,
          agency_id: input.agency_id || null,
          name: input.name || "",
          openday: input.openday,
          eval_date: input.eval_date,
          ptcprogram: input.ptcprogram || "",
          counsel_contents: input.counsel_contents || "",
          session1: input.session1 || "",
          session2: input.session2 || "",
          pv: input.pv || "",
          past_stress_experience: input.past_stress_experience || "",
          counsel_therapy_seq: input.counsel_therapy_seq || null,
          sex: input.sex || "미기재",
          age: input.age || "",
          residence: input.residence || "미기재",
          job: input.job || "",
          past_experience: input.past_experience || "",
          score1: input.score1 || "",
          score2: input.score2 || "",
          score3: input.score3 || "",
          score4: input.score4 || "",
          score5: input.score5 || "",
          score6: input.score6 || "",
          score7: input.score7 || "",
          score8: input.score8 || "",
          score9: input.score9 || "",
          score10: input.score10 || "",
          score11: input.score11 || "",
          score12: input.score12 || "",
          score13: input.score13 || "",
          score14: input.score14 || "",
          score15: input.score15 || "",
          score16: input.score16 || "",
          score17: input.score17 || "",
          score18: input.score18 || "",
          score19: input.score19 || "",
          score20: input.score20 || "",
          score21: input.score21 || "",
          score22: input.score22 || "",
          score23: input.score23 || "",
          score24: input.score24 || "",
          score25: input.score25 || "",
          score26: input.score26 || "",
          score27: input.score27 || "",
          score28: input.score28 || "",
          score29: input.score29 || "",
          score30: input.score30 || "",
          score31: input.score31 || "",
          score32: input.score32 || "",
          score33: input.score33 || "",
          score34: input.score34 || "",
          score35: input.score35 || "",
          score36: input.score36 || "",
          score37: input.score37 || "",
          score38: input.score38 || "",
          score39: input.score39 || "",
          score40: input.score40 || "",
          score41: input.score41 || "",
          score42: input.score42 || "",
          score43: input.score43 || "",
          score44: input.score44 || "",
          score45: input.score45 || "",
          score46: input.score46 || "",
          score47: input.score47 || "",
          score48: input.score48 || "",
          score49: input.score49 || "",
          score50: input.score50 || "",
          score51: input.score51 || "",
          score52: input.score52 || "",
          score53: input.score53 || "",
          score54: input.score54 || "",
          score55: input.score55 || "",
          score56: input.score56 || "",
          score57: input.score57 || "",
          score58: input.score58 || "",
          score59: input.score59 || "",
          score60: input.score60 || "",
          score61: input.score61 || "",
          score62: input.score62 || ""
        }
      });
      
      return form;
    } catch (error) {
      console.error('Error creating counsel therapy form:', error);
      throw new Error('Failed to create counsel therapy form');
    }
  },
  
  updateCounselTherapyForm: async (_, { id, input }) => {
    try {
      // Get existing form to verify it exists
      const existingForm = await prisma.counselTherapyForm.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!existingForm) {
        throw new Error(`Counsel therapy form with ID ${id} not found`);
      }
      
      // Update the form with all fields directly
      const updatedForm = await prisma.counselTherapyForm.update({
        where: { id: parseInt(id) },
        data: {
          agency: input.agency,
          agency_id: input.agency_id || null,
          name: input.name || "",
          openday: input.openday,
          eval_date: input.eval_date,
          ptcprogram: input.ptcprogram || "",
          counsel_contents: input.counsel_contents || "",
          session1: input.session1 || "",
          session2: input.session2 || "",
          pv: input.pv || "",
          past_stress_experience: input.past_stress_experience || "",
          counsel_therapy_seq: input.counsel_therapy_seq || null,
          sex: input.sex || "미기재",
          age: input.age || "",
          residence: input.residence || "미기재",
          job: input.job || "",
          past_experience: input.past_experience || "",
          score1: input.score1 || "",
          score2: input.score2 || "",
          score3: input.score3 || "",
          score4: input.score4 || "",
          score5: input.score5 || "",
          score6: input.score6 || "",
          score7: input.score7 || "",
          score8: input.score8 || "",
          score9: input.score9 || "",
          score10: input.score10 || "",
          score11: input.score11 || "",
          score12: input.score12 || "",
          score13: input.score13 || "",
          score14: input.score14 || "",
          score15: input.score15 || "",
          score16: input.score16 || "",
          score17: input.score17 || "",
          score18: input.score18 || "",
          score19: input.score19 || "",
          score20: input.score20 || "",
          score21: input.score21 || "",
          score22: input.score22 || "",
          score23: input.score23 || "",
          score24: input.score24 || "",
          score25: input.score25 || "",
          score26: input.score26 || "",
          score27: input.score27 || "",
          score28: input.score28 || "",
          score29: input.score29 || "",
          score30: input.score30 || "",
          score31: input.score31 || "",
          score32: input.score32 || "",
          score33: input.score33 || "",
          score34: input.score34 || "",
          score35: input.score35 || "",
          score36: input.score36 || "",
          score37: input.score37 || "",
          score38: input.score38 || "",
          score39: input.score39 || "",
          score40: input.score40 || "",
          score41: input.score41 || "",
          score42: input.score42 || "",
          score43: input.score43 || "",
          score44: input.score44 || "",
          score45: input.score45 || "",
          score46: input.score46 || "",
          score47: input.score47 || "",
          score48: input.score48 || "",
          score49: input.score49 || "",
          score50: input.score50 || "",
          score51: input.score51 || "",
          score52: input.score52 || "",
          score53: input.score53 || "",
          score54: input.score54 || "",
          score55: input.score55 || "",
          score56: input.score56 || "",
          score57: input.score57 || "",
          score58: input.score58 || "",
          score59: input.score59 || "",
          score60: input.score60 || "",
          score61: input.score61 || "",
          score62: input.score62 || ""
        }
      });
      
      return updatedForm;
    } catch (error) {
      console.error('Error updating counsel therapy form:', error);
      throw new Error('Failed to update counsel therapy form');
    }
  },
  
  deleteCounselTherapyForm: async (_, { id }) => {
    try {
      // Prisma will cascade delete the entries due to the relation
      await prisma.counselTherapyForm.delete({
        where: { id: parseInt(id) }
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting counsel therapy form:', error);
      throw new Error('Failed to delete counsel therapy form');
    }
  },
  
  // Prevent Form mutations
  createPreventForm: async (_, { input }) => {
    try {
      // Create the form with all fields directly
      const form = await prisma.preventForm.create({
        data: {
          agency: input.agency,
          agency_id: input.agency_id || null,
          name: input.name || "",
          openday: input.openday,
          eval_date: input.eval_date,
          ptcprogram: input.ptcprogram || "",
          prevent_contents: input.prevent_contents || "",
          pv: input.pv || "",
          past_stress_experience: input.past_stress_experience || "",
          prevent_seq: input.prevent_seq || null,
          sex: input.sex || "미기재",
          age: input.age || "",
          residence: input.residence || "미기재",
          job: input.job || "",
          score1: input.score1 || "",
          score2: input.score2 || "",
          score3: input.score3 || "",
          score4: input.score4 || "",
          score5: input.score5 || "",
          score6: input.score6 || "",
          score7: input.score7 || "",
          score8: input.score8 || "",
          score9: input.score9 || "",
          score10: input.score10 || "",
          score11: input.score11 || "",
          score12: input.score12 || "",
          score13: input.score13 || "",
          score14: input.score14 || "",
          score15: input.score15 || "",
          score16: input.score16 || "",
          score17: input.score17 || "",
          score18: input.score18 || "",
          score19: input.score19 || "",
          score20: input.score20 || ""
        }
      });
      
      return form;
    } catch (error) {
      console.error('Error creating prevent form:', error);
      throw new Error('Failed to create prevent form');
    }
  },
  
  updatePreventForm: async (_, { id, input }) => {
    try {
      // Get existing form to verify it exists
      const existingForm = await prisma.preventForm.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!existingForm) {
        throw new Error(`Prevent form with ID ${id} not found`);
      }
      
      // Update the form with all fields directly
      const updatedForm = await prisma.preventForm.update({
        where: { id: parseInt(id) },
        data: {
          agency: input.agency,
          agency_id: input.agency_id || null,
          name: input.name || "",
          openday: input.openday,
          eval_date: input.eval_date,
          ptcprogram: input.ptcprogram || "",
          prevent_contents: input.prevent_contents || "",
          pv: input.pv || "",
          past_stress_experience: input.past_stress_experience || "",
          prevent_seq: input.prevent_seq || null,
          sex: input.sex || "미기재",
          age: input.age || "",
          residence: input.residence || "미기재",
          job: input.job || "",
          score1: input.score1 || "",
          score2: input.score2 || "",
          score3: input.score3 || "",
          score4: input.score4 || "",
          score5: input.score5 || "",
          score6: input.score6 || "",
          score7: input.score7 || "",
          score8: input.score8 || "",
          score9: input.score9 || "",
          score10: input.score10 || "",
          score11: input.score11 || "",
          score12: input.score12 || "",
          score13: input.score13 || "",
          score14: input.score14 || "",
          score15: input.score15 || "",
          score16: input.score16 || "",
          score17: input.score17 || "",
          score18: input.score18 || "",
          score19: input.score19 || "",
          score20: input.score20 || ""
        }
      });
      
      return updatedForm;
    } catch (error) {
      console.error('Error updating prevent form:', error);
      throw new Error('Failed to update prevent form');
    }
  },
  
  deletePreventForm: async (_, { id }) => {
    try {
      // Prisma will cascade delete the entries due to the relation
      await prisma.preventForm.delete({
        where: { id: parseInt(id) }
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting prevent form:', error);
      throw new Error('Failed to delete prevent form');
    }
  },
  
  // Healing Form mutations
  createHealingForm: async (_, { input }) => {
    try {
      // Create the form with all fields directly
      const form = await prisma.healingForm.create({
        data: {
          agency: input.agency,
          agency_id: input.agency_id || null,
          name: input.name || "",
          openday: input.openday,
          eval_date: input.eval_date,
          ptcprogram: input.ptcprogram || "",
          pv: input.pv || "",
          past_stress_experience: input.past_stress_experience || "",
          healing_seq: input.healing_seq || null,
          sex: input.sex || "미기재",
          age: input.age || "",
          residence: input.residence || "미기재",
          job: input.job || "",
          score1: input.score1 || "",
          score2: input.score2 || "",
          score3: input.score3 || "",
          score4: input.score4 || "",
          score5: input.score5 || "",
          score6: input.score6 || "",
          score7: input.score7 || "",
          score8: input.score8 || "",
          score9: input.score9 || "",
          score10: input.score10 || "",
          score11: input.score11 || "",
          score12: input.score12 || "",
          score13: input.score13 || "",
          score14: input.score14 || "",
          score15: input.score15 || "",
          score16: input.score16 || "",
          score17: input.score17 || "",
          score18: input.score18 || "",
          score19: input.score19 || "",
          score20: input.score20 || "",
          score21: input.score21 || "",
          score22: input.score22 || ""
        }
      });
      
      return form;
    } catch (error) {
      console.error('Error creating healing form:', error);
      throw new Error('Failed to create healing form');
    }
  },
  
  updateHealingForm: async (_, { id, input }) => {
    try {
      // Get existing form to verify it exists
      const existingForm = await prisma.healingForm.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!existingForm) {
        throw new Error(`Healing form with ID ${id} not found`);
      }
      
      // Update the form with all fields directly
      const updatedForm = await prisma.healingForm.update({
        where: { id: parseInt(id) },
        data: {
          agency: input.agency,
          agency_id: input.agency_id || null,
          name: input.name || "",
          openday: input.openday,
          eval_date: input.eval_date,
          ptcprogram: input.ptcprogram || "",
          pv: input.pv || "",
          past_stress_experience: input.past_stress_experience || "",
          healing_seq: input.healing_seq || null,
          sex: input.sex || "미기재",
          age: input.age || "",
          residence: input.residence || "미기재",
          job: input.job || "",
          score1: input.score1 || "",
          score2: input.score2 || "",
          score3: input.score3 || "",
          score4: input.score4 || "",
          score5: input.score5 || "",
          score6: input.score6 || "",
          score7: input.score7 || "",
          score8: input.score8 || "",
          score9: input.score9 || "",
          score10: input.score10 || "",
          score11: input.score11 || "",
          score12: input.score12 || "",
          score13: input.score13 || "",
          score14: input.score14 || "",
          score15: input.score15 || "",
          score16: input.score16 || "",
          score17: input.score17 || "",
          score18: input.score18 || "",
          score19: input.score19 || "",
          score20: input.score20 || "",
          score21: input.score21 || "",
          score22: input.score22 || ""
        }
      });
      
      return updatedForm;
    } catch (error) {
      console.error('Error updating healing form:', error);
      throw new Error('Failed to update healing form');
    }
  },
  
  deleteHealingForm: async (_, { id }) => {
    try {
      // Prisma will cascade delete the entries due to the relation
      await prisma.healingForm.delete({
        where: { id: parseInt(id) }
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting healing form:', error);
      throw new Error('Failed to delete healing form');
    }
  },
  
  // HRV Form mutations
  createHrvForm: async (_, { input }) => {
    try {
      // Create the form with all fields directly
      const form = await prisma.hrvForm.create({
        data: {
          agency: input.agency,
          agency_id: input.agency_id || null,
          name: input.name || "",
          openday: input.openday,
          eval_date: input.eval_date,
          ptcprogram: input.ptcprogram || "",
          pv: input.pv || "",
          identification_number: input.identification_number || "",
          hrv_seq: input.hrv_seq || null,
          sex: input.sex || "미기재",
          age: input.age || "",
          residence: input.residence || "미기재",
          job: input.job || "",
          score1: input.score1 || "",  // 자율신경활성도
          score2: input.score2 || "",  // 자율신경균형도
          score3: input.score3 || "",  // 스트레스저항도
          score4: input.score4 || "",  // 스트레스지수
          score5: input.score5 || "",  // 피로도지수
          score6: input.score6 || "",  // 평균심박동수
          score7: input.score7 || "",  // 심장안정도
          score8: input.score8 || "",  // 이상심박동수
        }
      });
      
      return form;
    } catch (error) {
      console.error('Error creating HRV form:', error);
      throw new Error('Failed to create HRV form');
    }
  },
  
  updateHrvForm: async (_, { id, input }) => {
    try {
      // Get existing form to verify it exists
      const existingForm = await prisma.hrvForm.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!existingForm) {
        throw new Error(`HRV form with ID ${id} not found`);
      }
      
      // Update the form with all fields directly
      const updatedForm = await prisma.hrvForm.update({
        where: { id: parseInt(id) },
        data: {
          agency: input.agency,
          agency_id: input.agency_id || null,
          name: input.name || "",
          openday: input.openday,
          eval_date: input.eval_date,
          ptcprogram: input.ptcprogram || "",
          pv: input.pv || "",
          identification_number: input.identification_number || "",
          hrv_seq: input.hrv_seq || null,
          sex: input.sex || "미기재",
          age: input.age || "",
          residence: input.residence || "미기재",
          job: input.job || "",
          score1: input.score1 || "",  // 자율신경활성도
          score2: input.score2 || "",  // 자율신경균형도
          score3: input.score3 || "",  // 스트레스저항도
          score4: input.score4 || "",  // 스트레스지수
          score5: input.score5 || "",  // 피로도지수
          score6: input.score6 || "",  // 평균심박동수
          score7: input.score7 || "",  // 심장안정도
          score8: input.score8 || "",  // 이상심박동수
        }
      });
      
      return updatedForm;
    } catch (error) {
      console.error('Error updating HRV form:', error);
      throw new Error('Failed to update HRV form');
    }
  },
  
  deleteHrvForm: async (_, { id }) => {
    try {
      // Prisma will cascade delete the entries due to the relation
      await prisma.hrvForm.delete({
        where: { id: parseInt(id) }
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting HRV form:', error);
      throw new Error('Failed to delete HRV form');
    }
  },
  
  // Vibra Form mutations
  createVibraForm: async (_, { input }) => {
    try {
      // Create the form with all fields directly
      const form = await prisma.vibraForm.create({
        data: {
          agency: input.agency,
          agency_id: input.agency_id || null,
          name: input.name || "",
          openday: input.openday,
          eval_date: input.eval_date,
          ptcprogram: input.ptcprogram || "",
          pv: input.pv || "",
          identification_number: input.identification_number || "",
          vibra_seq: input.vibra_seq || null,
          sex: input.sex || "미기재",
          age: input.age || "",
          residence: input.residence || "미기재",
          job: input.job || "",
          score1: input.score1 || "",  // 적극공격성
          score2: input.score2 || "",  // 스트레스
          score3: input.score3 || "",  // 불안
          score4: input.score4 || "",  // 의심
          score5: input.score5 || "",  // 밸런스
          score6: input.score6 || "",  // 카리스마
          score7: input.score7 || "",  // 에너지
          score8: input.score8 || "",  // 자기조절
          score9: input.score9 || "",  // 억제
          score10: input.score10 || "", // 신경증
        }
      });
      
      return form;
    } catch (error) {
      console.error('Error creating Vibra form:', error);
      throw new Error('Failed to create Vibra form');
    }
  },
  
  updateVibraForm: async (_, { id, input }) => {
    try {
      // Get existing form to verify it exists
      const existingForm = await prisma.vibraForm.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!existingForm) {
        throw new Error(`Vibra form with ID ${id} not found`);
      }
      
      // Update the form with all fields directly
      const updatedForm = await prisma.vibraForm.update({
        where: { id: parseInt(id) },
        data: {
          agency: input.agency,
          agency_id: input.agency_id || null,
          name: input.name || "",
          openday: input.openday,
          eval_date: input.eval_date,
          ptcprogram: input.ptcprogram || "",
          pv: input.pv || "",
          identification_number: input.identification_number || "",
          vibra_seq: input.vibra_seq || null,
          sex: input.sex || "미기재",
          age: input.age || "",
          residence: input.residence || "미기재",
          job: input.job || "",
          score1: input.score1 || "",  // 적극공격성
          score2: input.score2 || "",  // 스트레스
          score3: input.score3 || "",  // 불안
          score4: input.score4 || "",  // 의심
          score5: input.score5 || "",  // 밸런스
          score6: input.score6 || "",  // 카리스마
          score7: input.score7 || "",  // 에너지
          score8: input.score8 || "",  // 자기조절
          score9: input.score9 || "",  // 억제
          score10: input.score10 || "", // 신경증
        }
      });
      
      return updatedForm;
    } catch (error) {
      console.error('Error updating Vibra form:', error);
      throw new Error('Failed to update Vibra form');
    }
  },
  
  deleteVibraForm: async (_, { id }) => {
    try {
      // Prisma will cascade delete the entries due to the relation
      await prisma.vibraForm.delete({
        where: { id: parseInt(id) }
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting Vibra form:', error);
      throw new Error('Failed to delete Vibra form');
    }
  }
};

module.exports = resolvers; 