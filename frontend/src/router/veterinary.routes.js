import VeterinaryLayout from '@/layouts/VeterinaryLayout.vue';
import VetDashboard from '@/views/vet/VetDashboard.vue';
import VetClientPets from '@/views/vet/VetClientPets.vue';
import VetAppointments from '@/views/vet/VetAppointments.vue';
import VetFeedback from '@/views/vet/VetFeedback.vue';
import VetHealthRiskAssessment from '@/views/vet/VetHealthRiskAssessment.vue';
import VetTelehealth from '@/views/vet/VetTelehealth.vue';
import MedicalRecords from '@/views/vet/MedicalRecords.vue';

export default [
  {
    path: '/vet',
    component: VeterinaryLayout,
    children: [
        {
            path: 'vetdashboard',
            name: 'vetdashboard',
            component: VetDashboard,
        },
        {
          path: 'vetclientpets',
          name: 'vetclientpets',
          component: VetClientPets,
       },
       {
        path: 'vetappointments',
        name: 'vetappointments',
        component: VetAppointments,
      },
      {
        path: 'vetfeedback',
        name: 'vetfeedback',
        component: VetFeedback,
      },
      {
        path: 'vettelehealth',
        name: 'vettelehealth',
        component: VetTelehealth,
      },
      {
        path: 'medicalrecords',
        name: 'medicalrecords',
        component: MedicalRecords,
      },
      {
        path: 'vethealthriskassessment',
        name: 'vethealthriskassessment',
        component: VetHealthRiskAssessment,
      },
    ],
  }
]
