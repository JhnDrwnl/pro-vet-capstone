// src/router/veterinary.routes.js
import VeterinaryLayout from '@/layouts/VeterinaryLayout.vue';
import VetDashboard from '@/views/vet/VetDashboard.vue';
import VetClientPets from '@/views/vet/VetClientPets.vue';
import VetAppointments from '@/views/vet/VetAppointments.vue';
import VetFeedback from '@/views/vet/VetFeedback.vue';
import VetHealthRiskAssessment from '@/views/vet/VetHealthRiskAssessment.vue';
import VetTelehealth from '@/views/vet/VetTelehealth.vue';
import MedicalRecords from '@/views/vet/MedicalRecords.vue';
import Settings from '@/views/vet/Settings.vue';
import VetAppointmentApproval from '@/views/vet/appointments/VetAppointmentApproval.vue';
import VetCalendar from '@/views/vet/appointments/VetCalendar.vue';

export default [
  {
    path: '/vet',
    component: VeterinaryLayout,
    meta: { requiresAuth: true, roles: ['veterinary'] }, 
    children: [
        {
            path: 'dashboard',
            name: 'VetDashboard',
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
              path: '/vet/appointments',
              children: [
                {
                  path: 'vetappointmentapproval',
                  name: 'vetappointmentapproval',
                  component: VetAppointmentApproval,
                },
                {
                  path: 'vetcalendar',
                  name: 'vetcalendar',
                  component: VetCalendar,
                },
              ],
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
      {
        path: 'settings',
        name: 'settings',
        component: Settings,
      },
    ],
  }
]
