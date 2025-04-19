// Import your telehealth component
import TelehealthView from "../views/user/Telehealth.vue"
import VetTelehealth from "../views/vet/VetTelehealth.vue"
// Define telehealth routes
export const telehealthRoutes = [
  {
    path: "/telehealth",
    name: "Telehealth",
    component: TelehealthView,
    meta: {
      requiresAuth: true,
      title: "Telehealth",
    },
  },
  {
    path: "/telehealth/vet",
    name: "VetTelehealth",
    component: VetTelehealth,
    meta: {
      requiresAuth: true,
      role: "veterinary",
      title: "Vet Telehealth",
    },
  },
  // {
  //   path: "/telehealth/patient",
  //   name: "PatientTelehealth",
  //   component: PatientTelehealth,
  //   meta: {
  //     requiresAuth: true,
  //     role: "patient",
  //     title: "Patient Telehealth",
  //   },
  // },
]
