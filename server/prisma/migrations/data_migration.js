const prisma = require('../../../prisma/prismaClient');

/**
 * Migration script to convert data from the old form+entries schema
 * to the new consolidated form models
 */
async function migrateServiceForms() {
  console.log('Starting migration of service form data...');
  
  try {
    // Get all service forms with their entries
    const serviceForms = await prisma.$queryRaw`
      SELECT f.*, e.*
      FROM service_forms f
      LEFT JOIN service_form_entries e ON f.id = e.service_form_id
    `;
    
    console.log(`Found ${serviceForms.length} service form entries to migrate`);
    
    // Process each service form entry and create a new consolidated record
    for (const form of serviceForms) {
      await prisma.serviceForm.create({
        data: {
          agency: form.agency,
          agency_id: form.agency_id,
          openday: form.openday,
          eval_date: form.eval_date,
          ptcprogram: form.ptcprogram,
          service_seq: form.service_seq,
          sex: form.sex,
          age: form.age,
          residence: form.residence,
          job: form.job,
          score1: form.score1,
          score2: form.score2,
          score3: form.score3,
          score4: form.score4,
          score5: form.score5,
          score6: form.score6,
          score7: form.score7,
          score8: form.score8,
          score9: form.score9,
          score10: form.score10,
          facility_opinion: form.facility_opinion,
          score11: form.score11,
          score12: form.score12,
          score13: form.score13,
          score14: form.score14,
          score15: form.score15,
          score16: form.score16,
          operation_opinion: form.operation_opinion,
          score17: form.score17,
          score18: form.score18,
          created_at: form.created_at,
          updated_at: form.updated_at
        }
      });
    }
    
    console.log('Service form migration completed');
  } catch (error) {
    console.error('Error migrating service forms:', error);
  }
}

async function migrateProgramForms() {
  console.log('Starting migration of program form data...');
  
  try {
    // Get all program forms with their entries
    const programForms = await prisma.$queryRaw`
      SELECT f.*, e.*
      FROM program_forms f
      LEFT JOIN program_form_entries e ON f.id = e.program_form_id
    `;
    
    console.log(`Found ${programForms.length} program form entries to migrate`);
    
    // Process each program form entry and create a new consolidated record
    for (const form of programForms) {
      await prisma.programForm.create({
        data: {
          agency: form.agency,
          agency_id: form.agency_id,
          openday: form.openday,
          eval_date: form.eval_date,
          ptcprogram: form.ptcprogram,
          program_id: form.program_id,
          program_category_id: form.program_category_id,
          teacher_id: form.teacher_id,
          place: form.place,
          program_seq: form.program_seq,
          sex: form.sex,
          age: form.age,
          residence: form.residence,
          job: form.job,
          type: form.type,
          score1: form.score1,
          score2: form.score2,
          score3: form.score3,
          score4: form.score4,
          score5: form.score5,
          score6: form.score6,
          score7: form.score7,
          score8: form.score8,
          score9: form.score9,
          score10: form.score10,
          score11: form.score11,
          score12: form.score12,
          expectation: form.expectation,
          improvement: form.improvement,
          created_at: form.created_at,
          updated_at: form.updated_at
        }
      });
    }
    
    console.log('Program form migration completed');
  } catch (error) {
    console.error('Error migrating program forms:', error);
  }
}

async function migrateCounselTherapyForms() {
  console.log('Starting migration of counsel therapy form data...');
  
  try {
    // Get all counsel therapy forms with their entries
    const counselTherapyForms = await prisma.$queryRaw`
      SELECT f.*, e.*
      FROM counsel_therapy_forms f
      LEFT JOIN counsel_therapy_form_entries e ON f.id = e.counsel_therapy_form_id
    `;
    
    console.log(`Found ${counselTherapyForms.length} counsel therapy form entries to migrate`);
    
    // Process each counsel therapy form entry and create a new consolidated record
    for (const form of counselTherapyForms) {
      await prisma.counselTherapyForm.create({
        data: {
          agency: form.agency,
          agency_id: form.agency_id,
          name: form.name,
          openday: form.openday,
          eval_date: form.eval_date,
          ptcprogram: form.ptcprogram,
          counsel_contents: form.counsel_contents,
          session1: form.session1,
          session2: form.session2,
          pv: form.pv,
          past_stress_experience: form.past_stress_experience,
          counsel_therapy_seq: form.counsel_therapy_seq,
          sex: form.sex,
          age: form.age,
          residence: form.residence,
          job: form.job,
          past_experience: form.past_experience,
          score1: form.score1,
          score2: form.score2,
          score3: form.score3,
          // ... add remaining scores 4-62
          created_at: form.created_at,
          updated_at: form.updated_at
        }
      });
    }
    
    console.log('Counsel therapy form migration completed');
  } catch (error) {
    console.error('Error migrating counsel therapy forms:', error);
  }
}

// Similar functions for other form types:
// - migratePreventForms()
// - migrateHealingForms()
// - migrateHrvForms()
// - migrateVibraForms()

async function main() {
  console.log('Starting data migration...');
  
  try {
    await migrateServiceForms();
    await migrateProgramForms();
    await migrateCounselTherapyForms();
    // Add other form migrations as needed
    
    console.log('Data migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 