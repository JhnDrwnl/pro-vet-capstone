// services/vaccinationSeriesService.js
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '@shared/firebase'

/**
 * Vaccination series templates for different pet types and ages
 */
export const VACCINATION_SERIES_TEMPLATES = {
  // Puppy series (starting at 6-8 weeks)
  puppy: {
    name: 'Puppy Core Vaccination Series',
    description: 'Complete puppy vaccination series for optimal protection',
    vaccines: [
      {
        name: 'DHPP/DHPPi (Core)',
        ageWeeks: 6,
        intervalWeeks: 4,
        doses: 3,
        description: 'Distemper, Hepatitis, Parvovirus, Parainfluenza',
        isCore: true,
        nextDueCalculation: 'months',
        nextDueValue: 12
      },
      {
        name: 'Bordetella (Kennel Cough)',
        ageWeeks: 8,
        intervalWeeks: 4,
        doses: 2,
        description: 'Bordetella bronchiseptica vaccine',
        isCore: false,
        nextDueCalculation: 'months',
        nextDueValue: 6
      },
      {
        name: 'Rabies',
        ageWeeks: 12,
        intervalWeeks: 0,
        doses: 1,
        description: 'Rabies virus vaccine (required by law)',
        isCore: true,
        nextDueCalculation: 'months',
        nextDueValue: 12
      }
    ]
  },
  
  // Kitten series (starting at 6-8 weeks)
  kitten: {
    name: 'Kitten Core Vaccination Series',
    description: 'Complete kitten vaccination series for optimal protection',
    vaccines: [
      {
        name: 'FVRCP (Core)',
        ageWeeks: 6,
        intervalWeeks: 4,
        doses: 3,
        description: 'Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia',
        isCore: true,
        nextDueCalculation: 'months',
        nextDueValue: 12
      },
      {
        name: 'FIV (Optional)',
        ageWeeks: 8,
        intervalWeeks: 4,
        doses: 2,
        description: 'Feline Immunodeficiency Virus vaccine',
        isCore: false,
        nextDueCalculation: 'months',
        nextDueValue: 12
      },
      {
        name: 'Rabies',
        ageWeeks: 12,
        intervalWeeks: 0,
        doses: 1,
        description: 'Rabies virus vaccine (required by law)',
        isCore: true,
        nextDueCalculation: 'months',
        nextDueValue: 12
      }
    ]
  },
  
  // Adult dog boosters
  adultDog: {
    name: 'Adult Dog Booster Series',
    description: 'Annual and triennial booster vaccinations for adult dogs',
    vaccines: [
      {
        name: 'DHPP/DHPPi Booster',
        intervalMonths: 12,
        description: 'Annual core vaccine booster',
        isCore: true,
        nextDueCalculation: 'months',
        nextDueValue: 12
      },
      {
        name: 'Bordetella Booster',
        intervalMonths: 6,
        description: 'Semi-annual kennel cough vaccine',
        isCore: false,
        nextDueCalculation: 'months',
        nextDueValue: 6
      },
      {
        name: 'Rabies Booster',
        intervalMonths: 36,
        description: 'Triennial rabies vaccine (varies by state)',
        isCore: true,
        nextDueCalculation: 'months',
        nextDueValue: 36
      }
    ]
  },
  
  // Adult cat boosters
  adultCat: {
    name: 'Adult Cat Booster Series',
    description: 'Annual and triennial booster vaccinations for adult cats',
    vaccines: [
      {
        name: 'FVRCP Booster',
        intervalMonths: 12,
        description: 'Annual core vaccine booster',
        isCore: true,
        nextDueCalculation: 'months',
        nextDueValue: 12
      },
      {
        name: 'FIV Booster',
        intervalMonths: 12,
        description: 'Annual FIV vaccine for outdoor cats',
        isCore: false,
        nextDueCalculation: 'months',
        nextDueValue: 12
      },
      {
        name: 'Rabies Booster',
        intervalMonths: 36,
        description: 'Triennial rabies vaccine (varies by state)',
        isCore: true,
        nextDueCalculation: 'months',
        nextDueValue: 36
      }
    ]
  }
}

/**
 * Calculate pet's age in weeks
 * @param {Date} birthDate - Pet's birth date
 * @returns {number} Age in weeks
 */
export function calculateAgeInWeeks(birthDate) {
  if (!birthDate) return 0
  
  const birth = new Date(birthDate)
  const now = new Date()
  const diffTime = Math.abs(now - birth)
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
  
  return diffWeeks
}

/**
 * Calculate pet's age in months
 * @param {Date} birthDate - Pet's birth date
 * @returns {number} Age in months
 */
export function calculateAgeInMonths(birthDate) {
  if (!birthDate) return 0
  
  const birth = new Date(birthDate)
  const now = new Date()
  const diffTime = Math.abs(now - birth)
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44))
  
  return diffMonths
}

/**
 * Determine appropriate vaccination series for a pet
 * @param {Object} pet - Pet object with species and birthDate
 * @returns {Object} Vaccination series template
 */
export function getVaccinationSeriesForPet(pet) {
  if (!pet.species || !pet.birthDate) {
    return null
  }
  
  const species = pet.species.toLowerCase()
  const ageWeeks = calculateAgeInWeeks(pet.birthDate)
  const ageMonths = calculateAgeInMonths(pet.birthDate)
  
  if (species.includes('dog') || species.includes('puppy')) {
    if (ageWeeks <= 16) {
      return VACCINATION_SERIES_TEMPLATES.puppy
    } else {
      return VACCINATION_SERIES_TEMPLATES.adultDog
    }
  } else if (species.includes('cat') || species.includes('kitten')) {
    if (ageWeeks <= 16) {
      return VACCINATION_SERIES_TEMPLATES.kitten
    } else {
      return VACCINATION_SERIES_TEMPLATES.adultCat
    }
  }
  
  return null
}

/**
 * Calculate next vaccination due dates for a pet
 * @param {Object} pet - Pet object
 * @param {Array} existingVaccinations - Array of existing vaccination records
 * @returns {Array} Array of upcoming vaccinations with due dates
 */
export function calculateUpcomingVaccinations(pet, existingVaccinations = []) {
  const series = getVaccinationSeriesForPet(pet)
  if (!series) return []
  
  const upcomingVaccinations = []
  const now = new Date()
  
  // Handle puppy/kitten series
  if (series.vaccines[0].ageWeeks) {
    const ageWeeks = calculateAgeInWeeks(pet.birthDate)
    
    series.vaccines.forEach(vaccine => {
      if (ageWeeks >= vaccine.ageWeeks) {
        // Check if this vaccine has been given
        const existingVaccine = existingVaccinations.find(v => 
          v.name.toLowerCase().includes(vaccine.name.toLowerCase().split(' ')[0])
        )
        
        if (!existingVaccine) {
          // First dose
          upcomingVaccinations.push({
            name: vaccine.name,
            description: vaccine.description,
            isCore: vaccine.isCore,
            dueDate: new Date(pet.birthDate.getTime() + (vaccine.ageWeeks * 7 * 24 * 60 * 60 * 1000)),
            dose: 1,
            totalDoses: vaccine.doses,
            series: series.name,
            priority: 'high'
          })
        } else if (existingVaccine.dose < vaccine.doses) {
          // Subsequent doses
          const lastDoseDate = new Date(existingVaccine.date)
          const nextDoseDate = new Date(lastDoseDate.getTime() + (vaccine.intervalWeeks * 7 * 24 * 60 * 60 * 1000))
          
          if (nextDoseDate > now) {
            upcomingVaccinations.push({
              name: vaccine.name,
              description: vaccine.description,
              isCore: vaccine.isCore,
              dueDate: nextDoseDate,
              dose: existingVaccine.dose + 1,
              totalDoses: vaccine.doses,
              series: series.name,
              priority: 'medium'
            })
          }
        }
      }
    })
  } else {
    // Handle adult boosters
    series.vaccines.forEach(vaccine => {
      const lastVaccine = existingVaccinations.find(v => 
        v.name.toLowerCase().includes(vaccine.name.toLowerCase().split(' ')[0])
      )
      
      if (lastVaccine) {
        const lastDoseDate = new Date(lastVaccine.date)
        let nextDueDate
        
        if (vaccine.nextDueCalculation === 'months') {
          nextDueDate = new Date(lastDoseDate.getTime() + (vaccine.nextDueValue * 30.44 * 24 * 60 * 60 * 1000))
        } else if (vaccine.nextDueCalculation === 'weeks') {
          nextDueDate = new Date(lastDoseDate.getTime() + (vaccine.nextDueValue * 7 * 24 * 60 * 60 * 1000))
        }
        
        if (nextDueDate > now) {
          upcomingVaccinations.push({
            name: vaccine.name,
            description: vaccine.description,
            isCore: vaccine.isCore,
            dueDate: nextDueDate,
            dose: 'booster',
            totalDoses: 1,
            series: series.name,
            priority: 'medium'
          })
        }
      } else {
        // First time vaccine for adult pet
        upcomingVaccinations.push({
          name: vaccine.name,
          description: vaccine.description,
          isCore: vaccine.isCore,
          dueDate: now,
          dose: 1,
          totalDoses: 1,
          series: series.name,
          priority: 'high'
        })
      }
    })
  }
  
  // Sort by due date and priority
  return upcomingVaccinations.sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1
    if (b.priority === 'high' && a.priority !== 'high') return 1
    return new Date(a.dueDate) - new Date(b.dueDate)
  })
}

/**
 * Generate automatic vaccination appointment suggestions
 * @param {Object} pet - Pet object
 * @param {Array} existingVaccinations - Array of existing vaccination records
 * @returns {Array} Array of appointment suggestions
 */
export function generateVaccinationAppointments(pet, existingVaccinations = []) {
  console.log('🔬 Generating vaccination appointments for pet:', pet.name, 'with data:', {
    species: pet.species,
    birthDate: pet.birthDate,
    ageWeeks: pet.ageWeeks,
    ageMonths: pet.ageMonths,
    ageYears: pet.ageYears
  })
  
  const upcomingVaccinations = calculateUpcomingVaccinations(pet, existingVaccinations)
  console.log('📅 Calculated upcoming vaccinations:', upcomingVaccinations.length, upcomingVaccinations)
  
  const appointments = upcomingVaccinations.map(vaccination => ({
    serviceName: vaccination.name,
    description: vaccination.description,
    suggestedDate: vaccination.dueDate,
    priority: vaccination.priority,
    series: vaccination.series,
    dose: vaccination.dose,
    totalDoses: vaccination.totalDoses,
    isCore: vaccination.isCore,
    estimatedDuration: 30, // 30 minutes for vaccination
    notes: `Automatic vaccination appointment for ${vaccination.name} - ${vaccination.description}`
  }))
  
  console.log('🎯 Generated appointment objects:', appointments.length, appointments)
  return appointments
}

/**
 * Save vaccination series template to Firestore
 * @param {Object} template - Vaccination series template
 * @returns {Promise} Save result
 */
export async function saveVaccinationSeriesTemplate(template) {
  try {
    const templateRef = doc(db, 'vaccinationSeriesTemplates', template.id || `template_${Date.now()}`)
    
    await setDoc(templateRef, {
      ...template,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return { success: true, id: templateRef.id }
  } catch (error) {
    console.error('Error saving vaccination series template:', error)
    throw new Error('Failed to save vaccination series template')
  }
}

/**
 * Get all vaccination series templates
 * @returns {Promise<Array>} Array of templates
 */
export async function getVaccinationSeriesTemplates() {
  try {
    const templatesRef = collection(db, 'vaccinationSeriesTemplates')
    const snapshot = await getDocs(templatesRef)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching vaccination series templates:', error)
    return []
  }
}

/**
 * Update pet's vaccination series progress
 * @param {string} petId - Pet ID
 * @param {Object} vaccinationRecord - New vaccination record
 * @returns {Promise} Update result
 */
export async function updatePetVaccinationProgress(petId, vaccinationRecord) {
  try {
    const petRef = doc(db, 'pets', petId)
    
    await updateDoc(petRef, {
      vaccinationProgress: arrayUnion({
        vaccineName: vaccinationRecord.name,
        completedAt: vaccinationRecord.date,
        dose: vaccinationRecord.dose || 1,
        series: vaccinationRecord.series || 'Standard',
        updatedAt: new Date()
      }),
      updatedAt: new Date()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error updating pet vaccination progress:', error)
    throw new Error('Failed to update vaccination progress')
  }
}
