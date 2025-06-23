<template>
  <div class="p-6 bg-white rounded-2xl">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">
        <!-- <PawPrint class="w-5 h-5 inline mr-2 text-blue-500" /> -->
        Pet Health Risk Assessment
        <!-- <Info class="w-4 h-4 inline ml-2 text-blue-500 cursor-pointer" /> -->
      </h1>
      <div class="flex items-center gap-4 mt-1">
        <span class="text-sm font-medium text-blue-500">{{ formCompletionPercentage }}%</span>
        <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-blue-500 rounded-full" :style="{ width: `${formCompletionPercentage}%` }"></div>
        </div>
      </div>
    </div>

    <div v-if="connectionStatus === false" class="mb-6 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
      <AlertTriangle class="w-4 h-4 flex-shrink-0" />
      <span><strong>Connection Error:</strong> Cannot connect to the prediction server.</span>
      <button @click="reconnectWebSocket" class="ml-2 px-3 py-1 bg-red-500 text-white rounded-md text-xs flex items-center">
        <RefreshCw size="14" class="mr-1" />
        Reconnect
      </button>
    </div>
    
    <div v-if="!predictionResult" class="assessment-form">
      <div class="flex flex-col md:flex-row gap-6 sm:gap-8">
        <!-- Pet Information Section - Left Side -->
        <div class="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="p-4 sm:p-6">
            <div class="flex items-center gap-3 mb-6">
              <PawPrint class="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <div>
                <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Pet Information</h2>
                <p class="text-xs sm:text-sm text-gray-500">Enter your pet's basic information</p>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group required">
                <label for="pet-name" class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Pet Name</label>
                <input 
                  id="pet-name" 
                  v-model="patientData['Pet Name']" 
                  type="text" 
                  placeholder="Enter pet name" 
                  class="block w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
                />
              </div>
              
              <div class="form-group">
                <label for="species" class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Species</label>
                <div class="relative">
                  <select 
                    id="species" 
                    v-model="species"
                    class="block w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-200 appearance-none"
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="hamster">Hamster</option>
                    <option value="rabbit">Rabbit</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronRight class="w-4 h-4 text-gray-500 transform rotate-90" />
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="age" class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Age (years)</label>
                <input 
                  id="age" 
                  v-model.number="patientData['Age (years)']" 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  placeholder="Enter age" 
                  class="block w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
                />
              </div>
              
              <div class="form-group">
                <label for="weight" class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input 
                  id="weight" 
                  v-model.number="patientData['Weight (kg)']" 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  placeholder="Enter weight" 
                  class="block w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="breed" class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Breed</label>
              <div class="relative">
                <select 
                  id="breed" 
                  v-model="patientData.Breed"
                  class="block w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-200 appearance-none"
                >
                  <option value="">Select breed</option>
                  <option v-for="(breed, index) in breedOptions" :key="index" :value="breed">
                    {{ breed }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronRight class="w-4 h-4 text-gray-500 transform rotate-90" />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="vaccination-status" class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Vaccination Status</label>
              <div class="relative">
                <select 
                  id="vaccination-status" 
                  v-model="patientData['Vaccination_Status']"
                  class="block w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-200 appearance-none"
                >
                  <option value="up-to-date">Fully Vaccinated</option>
                  <option value="partial">Partially Vaccinated </option>
                  <option value="none">Unvaccinated</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronRight class="w-4 h-4 text-gray-500 transform rotate-90" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Symptoms & Health History Section - Right Side -->
        <div class="bg-white rounded-xl border border-red-100 overflow-hidden">
          <div class="p-4 sm:p-6">
            <div class="flex items-center gap-3 mb-4 sm:mb-6">
              <Stethoscope class="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <div>
                <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Symptoms & Health History</h2>
                <p class="text-xs sm:text-sm text-gray-500">Record symptoms and medical history</p>
              </div>
            </div>
            
            <div class="space-y-4">
              <div class="form-group">
                <label for="past-diagnosis" class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Past Diagnosis</label>
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    id="past-diagnosis" 
                    v-model="diagnosisSearch" 
                    @input="filterDiagnoses"
                    @keydown.enter="addDiagnosisFromSearch"
                    @focus="showDiagnosisDropdown = true"
                    @blur="handleDiagnosisBlur"
                    type="text" 
                    placeholder="Search for past diagnoses..." 
                    class="block w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
                  />
                  
                  <!-- Diagnosis dropdown -->
                  <div v-if="showDiagnosisDropdown && filteredDiagnoses.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    <div 
                      v-for="(diagnosis, index) in filteredDiagnoses" 
                      :key="index"
                      @mousedown.prevent="addDiagnosis(diagnosis)"
                      class="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                      :class="{ 'bg-gray-50': diagnosisHighlightedIndex === index }"
                    >
                      {{ diagnosis }}
                    </div>
                  </div>
                </div>
                
                <!-- Selected diagnoses badges -->
                <div v-if="selectedDiagnoses.length > 0" class="flex flex-wrap gap-2 mt-3">
                  <div 
                    v-for="(diagnosis, index) in selectedDiagnoses" 
                    :key="index"
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {{ diagnosis }}
                    <button 
                      @click="removeDiagnosis(index)" 
                      class="ml-1.5 text-indigo-600 hover:text-indigo-900 focus:outline-none"
                      type="button"
                    >
                      <X size="14" />
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Symptoms Section with Tabular Format -->
              <div class="form-group">
                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                <div class="border border-gray-200 rounded-xl overflow-hidden">
                  <div class="grid grid-cols-12 gap-2 bg-gray-50 p-3 text-xs font-medium text-gray-500">
                    <div class="col-span-5">Symptom</div>
                    <div class="col-span-3">Duration</div>
                    <div class="col-span-3">Severity</div>
                    <div class="col-span-1"></div>
                  </div>
                  
                  <div v-for="(symptom, index) in symptomEntries" :key="index" class="grid grid-cols-12 gap-2 p-3 border-t border-gray-200">
                    <div class="col-span-5 relative">
                      <input 
                        v-model="symptom.name"
                        @focus="showSymptomDropdown(index)"
                        @blur="handleSymptomRowBlur(index)"
                        type="text" 
                        placeholder="Select symptom" 
                        class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-200"
                      />
                      
                      <!-- Symptom dropdown -->
                      <div v-if="symptom.showDropdown && commonSymptoms.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        <div 
                          v-for="(option, optIndex) in commonSymptoms" 
                          :key="optIndex"
                          @mousedown.prevent="selectSymptomForRow(option, index)"
                          class="px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs"
                        >
                          {{ option }}
                        </div>
                      </div>
                    </div>
                    
                    <div class="col-span-3">
                      <select 
                        v-model="symptom.duration"
                        class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-200 appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="< 24 hours">24 hours</option>
                        <option value="1-3 days">1-3 days</option>
                        <option value="3-7 days">3-7 days</option>
                        <option value="1-2 weeks">1-2 weeks</option>
                        <option value="2-4 weeks">2-4 weeks</option>
                        <option value="> 1 month">> 1 month</option>
                      </select>
                    </div>
                    
                    <div class="col-span-3">
                      <select 
                        v-model="symptom.severity"
                        class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-200 appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="Mild">Mild</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Severe">Severe</option>
                      </select>
                    </div>
                    
                    <div class="col-span-1 flex justify-center items-center">
                      <button 
                        @click="removeSymptomRow(index)" 
                        class="text-gray-400 hover:text-red-500 focus:outline-none"
                        type="button"
                      >
                        <X size="14" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <button 
                  @click="addSymptomRow" 
                  class="mt-3 w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-lg text-blue-500 hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm"
                >
                  <Plus size="14" class="mr-1" />
                  Add Symptom
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        @click="submitPrediction" 
        :disabled="isLoading || connectionStatus === false"
        class="mt-6 w-full px-4 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ActivityIcon v-if="isLoading" class="w-4 h-4 animate-spin" />
        <Zap v-else class="w-4 h-4" />
        <span>{{ isLoading ? 'Processing...' : 'Predict Disease' }}</span>
      </button>
      
      <div v-if="error" class="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
        <AlertTriangle class="w-4 h-4 flex-shrink-0" />
        <span>{{ error }}</span>
      </div>
    </div>
    
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden p-4 sm:p-6">
      <div class="flex items-center gap-3 mb-4">
        <ClipboardCheck class="w-5 h-5 text-green-500" />
        <div>
          <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Prediction Results for {{ patientData['Pet Name'] }}</h2>
          <p class="text-xs sm:text-sm text-gray-500 flex flex-wrap gap-2 mt-1">
            <span>{{ species.charAt(0).toUpperCase() + species.slice(1) }}</span>
            <span v-if="patientData.Breed">• {{ patientData.Breed }}</span>
            <span v-if="patientData['Age (years)']">• {{ patientData['Age (years)'] }} years</span>
            <span v-if="patientData['Weight (kg)']">• {{ patientData['Weight (kg)'] }} kg</span>
          </p>
        </div>
      </div>
      
      <div class="space-y-6">
        <div class="p-4 bg-gray-50 rounded-xl">
          <h3 class="flex items-center text-sm font-medium text-gray-900 mb-3">
            <AlertCircle class="w-4 h-4 text-blue-500 mr-2" />
            Predicted Diseases
          </h3>
          <div class="space-y-3">
            <div 
              v-for="(prediction, index) in predictionResult.predictions" 
              :key="index"
              class="p-3 bg-white rounded-lg border"
              :class="{'border-blue-200 bg-blue-50': index === 0, 'border-gray-200': index !== 0}"
            >
              <div class="font-medium text-sm mb-2">{{ prediction.disease }}</div>
              <div class="h-5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full rounded-full flex items-center justify-end pr-2 text-xs font-medium text-white"
                  :class="index === 0 ? 'bg-blue-500' : 'bg-gray-400'"
                  :style="{ width: `${prediction.probability * 100}%` }"
                >
                  {{ (prediction.probability * 100).toFixed(1) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-4 bg-gray-50 rounded-xl">
          <h3 class="flex items-center text-sm font-medium text-gray-900 mb-3">
            <Stethoscope class="w-4 h-4 text-blue-500 mr-2" />
            Recommended Diagnostics
          </h3>
          <ul class="space-y-2">
            <li 
              v-for="(diagnostic, index) in predictionResult.report.diagnostics" 
              :key="index"
              class="flex items-start gap-2 p-3 bg-white rounded-lg border border-gray-200"
            >
              <CheckCircle class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span class="text-sm">{{ diagnostic }}</span>
            </li>
          </ul>
        </div>
      </div>
      
      <button 
        @click="resetForm" 
        class="mt-6 w-full px-4 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
      >
        <RefreshCw class="w-4 h-4" />
        <span>New Prediction</span>
      </button>
    </div>
  </div>
</template>

<script>
import WebSocketService from '@/services/WebSocketService';
import { 
  Info, PawPrint, ChevronRight, Stethoscope, Search, X, 
  AlertTriangle, RefreshCw, Plus, Zap, ActivityIcon,
  ClipboardCheck, AlertCircle, CheckCircle
} from 'lucide-vue-next';

export default {
  name: 'VetHealthRiskAssessment',
  components: {
    Info,
    PawPrint,
    ChevronRight,
    Stethoscope,
    Search,
    X,
    AlertTriangle,
    RefreshCw,
    Plus,
    Zap,
    ActivityIcon,
    ClipboardCheck,
    AlertCircle,
    CheckCircle
  },
  
  data() {
    return {
      // Use the exact field names expected by the server
      patientData: {
        'Pet Name': '',
        'Age (years)': null,
        'Weight (kg)': null,
        'Breed': '',
        'Past Diagnosis': '',
        'Symptoms': '',
        'Vaccination_Status': 'unknown'
      },
      species: 'dog',
      isLoading: false,
      connectionStatus: null,
      error: null,
      predictionResult: null,
      messageListener: null,
      
      // Symptoms selection
      symptomSearch: '',
      selectedSymptoms: [],
      showSymptomsDropdown: false,
      
      // Symptom entries for tabular format
      symptomEntries: [
        { name: '', duration: '', severity: '', showDropdown: false }
      ],
      
      // Diagnosis selection
      diagnosisSearch: '',
      selectedDiagnoses: [],
      showDiagnosisDropdown: false,
      diagnosisHighlightedIndex: -1,
      
      // Common symptoms database
      commonSymptoms: [
        'Vomiting', 'Diarrhea', 'Lethargy', 'Loss of appetite', 'Weight loss',
        'Increased thirst', 'Increased urination', 'Coughing', 'Sneezing',
        'Difficulty breathing', 'Coughing', 'Itching', 'Hair loss', 'Fever',
        'Swelling', 'Discharge from eyes', 'Discharge from nose', 'Bad breath',
        'Seizures', 'Bleeding', 'Pale gums', 'Fever', 'Aggression',
        'Lameness', 'Depression', 'Excessive barking/meowing', 'Drooling'
      ],
      
      // Common diagnoses database - updated to include diagnoses for supported species only
      commonDiagnoses: [
        // Dog diagnoses
        'Canine Distemper', 'Canine Parvovirus', 'Kennel Cough', 'Canine Coronavirus',
        'Heartworm Disease', 'Ehrlichiosis', 'Leptospirosis', 'Mange', 'Patellar Luxation', 'Rabies',
        
        // Cat diagnoses
        'Feline Calicivirus', 'Feline Distemper', 'Feline Herpesvirus',
        'Feline Immunodeficiency Virus', 'Feline Infectious Peritonitis',
        'Feline Leukemia Virus', 'Feline Lower Urinary Tract Disease',
        'Feline Upper Respiratory Infection', 'Ringworm', 'Scabies',
        
        // Rabbit diagnoses
        'Coccidiosis', 'Flystrike', 'Gastrointestinal (GI) Stasis',
        'Malocclusion', 'Myxomatosis', 'Pasteurellosis', 'Pododermatitis',
        'Psoroptes cuniculi', 'Rabbit Hemorrhagic Disease', 'Uterine Adenocarcinoma',
        
        // Hamster diagnoses
        'Abscesses', 'Conjunctivitis', 'Diarrhea', 'Ectoparasitosis',
        'Heat Stroke', 'Malocclusion', 'Mange', 'Proliferative Ileitis',
        'Ringworm', 'Tyzzers Disease'
      ],
      // Breed lists by species
      dogBreeds: [
        'Aspin',
        'Shih Tzu',
        'Siberian Husky',
        'Chihuahua',
        'Labrador',
        'Beagle',
        'Golden Retriever',
        'Poodle',
        'German Shepherd',
        'Bulldog'
      ],
      catBreeds: [
        'Philippine Shorthair',
        'Persian Cat',
        'Siamese Cat',
        'Himalayan Cat',
        'Russian Blue Cat',
        'American Shorthair',
        'Exotic Shorthair',
        'Bengal Cat',
        'British Shorthair',
        'Maine Coon'
      ],
      hamsterBreeds: [
        'Syrian Hamster',
        'Dwarf Campbell Russian Hamster',
        'Winter White Russian Dwarf Hamster',
        'Roborovski Hamster',
        'Chinese Hamster',
        'Teddy Bear Hamster',
        'Black Bear Hamster',
        'European Hamster',
        'Robust Hamster',
        'Mangolian Hamster'
      ],
      rabbitBreeds: [
        'Mini Rex',
        'Holland Lop',
        'Dutch Rabbit',
        'Angora Rabbit',
        'Lionhead',
        'Miniature Lop',
        'Flemish Giant',
        'English Angora',
        'New Zealand Rabbit',
        'Himalayan Rabbit'
      ],
      filteredDiagnoses: [],
      
      // Form field weights for progress calculation
      formFieldWeights: {
        'petName': 20,
        'age': 15,
        'weight': 15,
        'breed': 10,
        'vaccinationStatus': 10,
        'symptoms': 30
      }
    };
  },
  computed: {
    breedOptions() {
      switch(this.species) {
        case 'dog':
          return this.dogBreeds;
        case 'cat':
          return this.catBreeds;
        case 'hamster':
          return this.hamsterBreeds;
        case 'rabbit':
          return this.rabbitBreeds;
        default:
          return [];
      }
    },
    
    // Calculate form completion percentage
    formCompletionPercentage() {
      let completionScore = 0;
      
      // Pet name (required)
      if (this.patientData['Pet Name']) {
        completionScore += this.formFieldWeights.petName;
      }
      
      // Age
      if (this.patientData['Age (years)'] !== null && this.patientData['Age (years)'] >= 0) {
        completionScore += this.formFieldWeights.age;
      }
      
      // Weight
      if (this.patientData['Weight (kg)'] !== null && this.patientData['Weight (kg)'] >= 0) {
        completionScore += this.formFieldWeights.weight;
      }
      
      // Breed
      if (this.patientData.Breed) {
        completionScore += this.formFieldWeights.breed;
      }
      
      // Vaccination status
      if (this.patientData['Vaccination_Status'] && this.patientData['Vaccination_Status'] !== 'unknown') {
        completionScore += this.formFieldWeights.vaccinationStatus;
      }
      
      // Symptoms (at least one symptom is required)
      const hasSymptom = this.symptomEntries.some(entry => entry.name.trim() !== '');
      const hasSymptomText = this.patientData.Symptoms.trim() !== '';
      const hasPastDiagnosis = this.selectedDiagnoses.length > 0;
      
      if (hasSymptom || hasSymptomText || hasPastDiagnosis) {
        // Calculate symptom completeness
        let symptomScore = 0;
        
        // Check for valid symptom entries
        const validSymptoms = this.symptomEntries.filter(entry => entry.name.trim() !== '');
        if (validSymptoms.length > 0) {
          // Calculate how many symptoms have duration and severity
          const completeSymptoms = validSymptoms.filter(entry => entry.duration && entry.severity);
          const partialSymptoms = validSymptoms.filter(entry => (entry.duration || entry.severity) && !(entry.duration && entry.severity));
          
          // Complete symptoms count more than partial ones
          symptomScore = (completeSymptoms.length * 1.0 + partialSymptoms.length * 0.5) / validSymptoms.length;
        }
        
        // Additional symptom text adds value
        if (hasSymptomText) {
          symptomScore = Math.max(symptomScore, 0.5);
        }
        
        // Past diagnosis adds value
        if (hasPastDiagnosis) {
          symptomScore = Math.max(symptomScore, 0.7);
        }
        
        // Apply the symptom weight
        completionScore += this.formFieldWeights.symptoms * symptomScore;
      }
      
      // Round to nearest integer
      return Math.round(completionScore);
    }
  },
  
  watch: {
    // Sync symptom entries with symptoms text area
    symptomEntries: {
      handler(newEntries) {
        const validEntries = newEntries.filter(entry => entry.name && (entry.duration || entry.severity));
        if (validEntries.length > 0) {
          const symptomText = validEntries.map(entry => {
            let text = entry.name;
            if (entry.duration) text += ` (Duration: ${entry.duration})`;
            if (entry.severity) text += ` (Severity: ${entry.severity})`;
            return text;
          }).join('; ');
          
          // Update the symptoms field while preserving any additional text
          const additionalText = this.patientData.Symptoms.replace(
            this.symptomEntries.map(e => e.name).filter(Boolean).join(', '), 
            ''
          ).trim();
          
          this.patientData.Symptoms = symptomText + (additionalText ? '. ' + additionalText : '');
        }
      },
      deep: true
    },
    
    // Sync selected diagnoses with past diagnosis field
    selectedDiagnoses: {
      handler(newDiagnoses) {
        if (newDiagnoses.length > 0) {
          this.patientData['Past Diagnosis'] = newDiagnoses.join(', ');
        } else {
          this.patientData['Past Diagnosis'] = '';
        }
      },
      deep: true
    },
    species: {
      handler() {
        // Reset breed when species changes
        this.patientData.Breed = '';
      }
    }
  },
  
  created() {
    // Connect to WebSocket when component is created
    this.connectWebSocket();
    
    // Listen for connection changes
    this.unsubscribeConnection = WebSocketService.onConnectionChange((status) => {
      console.log('WebSocket connection status changed:', status);
      this.connectionStatus = status;
    });
    
    // Initialize filtered diagnoses
    this.filteredDiagnoses = [...this.commonDiagnoses];
  },
  
  beforeUnmount() {
    // Clean up WebSocket connection
    if (this.unsubscribeConnection) {
      this.unsubscribeConnection();
    }
    
    // Remove message listener if exists
    if (this.messageListener) {
      this.messageListener();
    }
  },
  
  methods: {
    // Symptom table methods
    addSymptomRow() {
      this.symptomEntries.push({ name: '', duration: '', severity: '', showDropdown: false });
    },
    
    removeSymptomRow(index) {
      this.symptomEntries.splice(index, 1);
      if (this.symptomEntries.length === 0) {
        this.addSymptomRow();
      }
    },
    
    showSymptomDropdown(index) {
      this.symptomEntries = this.symptomEntries.map((entry, i) => ({
        ...entry,
        showDropdown: i === index
      }));
    },
    
    handleSymptomRowBlur(index) {
      setTimeout(() => {
        if (this.symptomEntries[index]) {
          this.symptomEntries[index].showDropdown = false;
        }
      }, 200);
    },
    
    selectSymptomForRow(symptom, index) {
      this.symptomEntries[index].name = symptom;
      this.symptomEntries[index].showDropdown = false;
    },
    
    // Diagnosis selection methods
    filterDiagnoses() {
      if (!this.diagnosisSearch.trim()) {
        this.filteredDiagnoses = [...this.commonDiagnoses];
        return;
      }
      
      const search = this.diagnosisSearch.toLowerCase();
      this.filteredDiagnoses = this.commonDiagnoses.filter(
        diagnosis => diagnosis.toLowerCase().includes(search)
      );
      
      this.diagnosisHighlightedIndex = this.filteredDiagnoses.length > 0 ? 0 : -1;
    },
    
    addDiagnosis(diagnosis) {
      if (!this.selectedDiagnoses.includes(diagnosis)) {
        this.selectedDiagnoses.push(diagnosis);
        this.diagnosisSearch = '';
        this.filterDiagnoses();
      }
    },
    
    addDiagnosisFromSearch(event) {
      event.preventDefault();
      
      if (this.diagnosisHighlightedIndex >= 0 && this.filteredDiagnoses.length > 0) {
        this.addDiagnosis(this.filteredDiagnoses[this.diagnosisHighlightedIndex]);
      } else if (this.diagnosisSearch.trim() && !this.selectedDiagnoses.includes(this.diagnosisSearch.trim())) {
        // Add custom diagnosis if it doesn't exist in the list
        this.selectedDiagnoses.push(this.diagnosisSearch.trim());
        this.diagnosisSearch = '';
        this.filterDiagnoses();
      }
    },
    
    removeDiagnosis(index) {
      this.selectedDiagnoses.splice(index, 1);
    },
    
    handleDiagnosisBlur() {
      // Delay hiding dropdown to allow click events to complete
      setTimeout(() => {
        this.showDiagnosisDropdown = false;
      }, 200);
    },
    
    // Legacy symptom selection methods (kept for compatibility)
    showAllSymptoms() {
      this.showSymptomsDropdown = true;
    },
    
    addSymptom(symptom) {
      if (!this.selectedSymptoms.includes(symptom)) {
        this.selectedSymptoms.push(symptom);
        this.symptomSearch = '';
      }
    },
    
    removeSymptom(index) {
      this.selectedSymptoms.splice(index, 1);
    },
    
    handleSymptomBlur() {
      // Delay hiding dropdown to allow click events to complete
      setTimeout(() => {
        this.showSymptomsDropdown = false;
      }, 200);
    },
    
    async connectWebSocket() {
      try {
        await WebSocketService.connect();
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        this.error = 'Failed to connect to the prediction server. Please try again later.';
      }
    },
    
    async reconnectWebSocket() {
      this.error = null;
      try {
        await WebSocketService.connect();
      } catch (error) {
        this.error = 'Failed to reconnect. Please try again later.';
      }
    },
    
    async submitPrediction() {
      if (!this.validateForm()) {
        return;
      }
      
      this.isLoading = true;
      this.error = null;
      
      // Format symptom data for the backend
      const symptomData = {};
      this.symptomEntries.forEach((entry, index) => {
        if (entry.name) {
          const num = index + 1;
          symptomData[`Symptom ${num}`] = entry.name;
          symptomData[`Symptom ${num}_Duration`] = entry.duration || '';
          symptomData[`Symptom ${num}_Severity`] = entry.severity || '';
        }
      });
      
      // Format patient data for the backend - use the exact field names expected by the server
      const formattedData = {
        patient_data: {
          'Pet Name': this.patientData['Pet Name'],
          'Age (years)': this.patientData['Age (years)'],
          'Weight (kg)': this.patientData['Weight (kg)'],
          'Breed': this.patientData.Breed,
          'Past Diagnosis': this.patientData['Past Diagnosis'],
          'Symptoms': this.patientData.Symptoms,
          'Treatment': this.patientData.Treatment,
          'Vaccination_Status': this.patientData['Vaccination_Status'],
          ...symptomData
        },
        species: this.species
      };
      
      console.log('Sending prediction request:', formattedData);
      
      // Set up message listener
      if (this.messageListener) {
        this.messageListener(); // Remove previous listener
      }
      
      this.messageListener = WebSocketService.onMessage((data) => {
        this.isLoading = false;
        
        if (data.error) {
          this.error = data.error;
        } else {
          this.predictionResult = data;
        }
      });
      
      try {
        // Send the message
        await WebSocketService.sendMessage(formattedData);
      } catch (error) {
        this.isLoading = false;
        this.error = `Error: ${error.message}`;
        console.error('Error sending prediction request:', error);
      }
    },
    
    validateForm() {
      // Reset previous errors
      this.error = null;
      
      // Basic validation
      if (!this.patientData['Pet Name']) {
        this.error = 'Please enter a pet name';
        return false;
      }
      
      if (this.patientData['Age (years)'] === null || this.patientData['Age (years)'] < 0) {
        this.error = 'Please enter a valid age';
        return false;
      }
      
      if (this.patientData['Weight (kg)'] === null || this.patientData['Weight (kg)'] < 0) {
        this.error = 'Please enter a valid weight';
        return false;
      }
      
      // Check if at least one symptom is entered
      const hasSymptom = this.symptomEntries.some(entry => entry.name.trim() !== '');
      if (!hasSymptom && !this.patientData.Symptoms) {
        this.error = 'Please enter at least one symptom';
        return false;
      }
      
      return true;
    },
    
    resetForm() {
      this.predictionResult = null;
      this.error = null;
      this.selectedSymptoms = [];
      this.symptomSearch = '';
      this.selectedDiagnoses = [];
      this.diagnosisSearch = '';
      this.symptomEntries = [{ name: '', duration: '', severity: '', showDropdown: false }];
      
      // Reset form fields but keep the species selection
      this.patientData = {
        'Pet Name': '',
        'Age (years)': null,
        'Weight (kg)': null,
        'Breed': '',
        'Past Diagnosis': '',
        'Symptoms': '',
        'Treatment': '',
        'Vaccination_Status': 'unknown'
      };
    }
  }
};
</script>

<style scoped>
.health-assessment-container {
  max-width: 1000px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: #1e293b;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
}

.title-icon {
  margin-right: 10px;
  color: #0ea5e9;
}

.info-icon {
  margin-left: 8px;
  color: #0ea5e9;
  cursor: pointer;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-text {
  color: #0ea5e9;
  font-weight: 600;
}

.progress-bar {
  width: 100px;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 100%;
  background-color: #0ea5e9;
  border-radius: 4px;
  transition: width 0.3s ease-in-out;
}

/* Side-by-side sections with pet info on left */
.sections-container {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  flex-direction: row;
}

.pet-info-section {
  flex: 0 0 40%; /* Fixed width for left side */
  order: 1; /* Ensure it's always first */
  min-width: 300px; /* Minimum width to maintain usability */
}

.symptoms-section {
  flex: 1; /* Take remaining space */
  order: 2;
}

.section {
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 20px;
  height: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.section-icon {
  margin-right: 8px;
  color: #0ea5e9;
}

.section h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #0f172a;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 16px;
  text-align: left;
}

.form-group.required label::after {
  content: " *";
  color: #0ea5e9;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
}

input, select, textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background-color: #f8fafc;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  background-color: #fff;
}

.select-wrapper {
  position: relative;
}

.select-wrapper::after {
  content: "›";
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  color: #64748b;
  pointer-events: none;
}

select {
  appearance: none;
  padding-right: 30px;
}

.input-with-icon {
  position: relative;
}

.chevron-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.search-input {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.search-input input {
  padding-left: 36px;
}

/* Dropdown styling (for both symptoms and diagnoses) */
.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 10;
  margin-top: 4px;
}

.dropdown-option {
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f1f5f9;
}

.dropdown-option:last-child {
  border-bottom: none;
}

.dropdown-option:hover, .dropdown-option.active {
  background-color: #f1f5f9;
}

/* Selected items badges (for both symptoms and diagnoses) */
.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.item-badge {
  display: flex;
  align-items: center;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.symptom-badge {
  background-color: #e0f2fe;
  color: #0369a1;
}

.diagnosis-badge {
  background-color: #e0e7ff;
  color: #4338ca;
}

.remove-item {
  background: none;
  border: none;
  margin-left: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2px;
}

.symptom-badge .remove-item {
  color: #0369a1;
}

.symptom-badge .remove-item:hover {
  color: #0284c7;
}

.diagnosis-badge .remove-item {
  color: #4338ca;
}

.diagnosis-badge .remove-item:hover {
  color: #4f46e5;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.helper-text {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

/* Symptoms Table Styling */
.symptoms-table {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.symptoms-table-header {
  display: flex;
  background-color: #f8fafc;
  padding: 10px;
  font-weight: 600;
  font-size: 13px;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.symptoms-table-row {
  display: flex;
  padding: 8px 10px;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;
}

.symptoms-table-row:last-child {
  border-bottom: none;
}

.symptom-name-col {
  flex: 2;
  position: relative;
}

.symptom-duration-col, .symptom-severity-col {
  flex: 1;
  padding: 0 5px;
}

.symptom-actions-col {
  width: 40px;
  display: flex;
  justify-content: center;
}

.remove-symptom-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
}

.remove-symptom-btn:hover {
  color: #ef4444;
  background-color: #fee2e2;
}

.add-symptom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 8px;
  background-color: #f1f5f9;
  color: #0ea5e9;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s;
}

.add-symptom-btn:hover {
  background-color: #e0f2fe;
  border-color: #0ea5e9;
}

.mr-1 {
  margin-right: 4px;
}

.mr-2 {
  margin-right: 8px;
}

.predict-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 14px;
  background-color: #0ea5e9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.2), 0 2px 4px -1px rgba(14, 165, 233, 0.1);
}

.predict-button:hover {
  background-color: #0284c7;
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(14, 165, 233, 0.2), 0 4px 6px -1px rgba(14, 165, 233, 0.1);
}

.predict-button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.button-icon {
  margin-left: 8px;
}

.error-message {
  padding: 12px;
  background-color: #fee2e2;
  color: #b91c1c;
  border-radius: 8px;
  margin-top: 16px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.error-icon {
  flex-shrink: 0;
}

.connection-error {
  margin-bottom: 16px;
}

.reconnect-button {
  margin-left: 10px;
  padding: 6px 12px;
  background-color: #0ea5e9;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
}

.reconnect-button:hover {
  background-color: #0284c7;
}

/* Results styling */
.prediction-results {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  text-align: left;
}

.results-header {
  margin-bottom: 20px;
}

.results-header h3 {
  font-size: 22px;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 8px;
  color: #0f172a;
  display: flex;
  align-items: center;
}

.pet-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
}

.results-section {
  margin-bottom: 24px;
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.results-section h4 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  text-align: left;
  display: flex;
  align-items: center;
}

.prediction-list {
  margin-top: 16px;
}

.prediction-item {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.prediction-item:last-child {
  margin-bottom: 0;
}

.primary-prediction {
  background-color: #f0f9ff;
  border-left: 4px solid #0ea5e9;
}

.disease-name {
  font-weight: 600;
  font-size: 16px;
  color: #0f172a;
  margin-bottom: 8px;
}

.probability-container {
  position: relative;
  height: 24px;
  background-color: #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.probability-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #0ea5e9;
  border-radius: 12px;
  transition: width 0.5s ease-out;
}

.probability {
  position: absolute;
  right: 10px;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
  color: #0f172a;
}

.diagnostics-list {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.diagnostics-list li {
  margin-bottom: 10px;
  padding: 12px 16px;
  background-color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.list-icon {
  color: #10b981;
  flex-shrink: 0;
}

.reset-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 14px;
  background-color: #0ea5e9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.2), 0 2px 4px -1px rgba(14, 165, 233, 0.1);
  margin-top: 20px;
}

.reset-button:hover {
  background-color: #0284c7;
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(14, 165, 233, 0.2), 0 4px 6px -1px rgba(14, 165, 233, 0.1);
}

.mt-3 {
  margin-top: 16px;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .sections-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .pet-info-section, 
  .symptoms-section {
    width: 100%;
    min-width: unset;
    flex: 1 1 auto;
  }
  
  .pet-info-section {
    order: 1; /* Keep pet info first on mobile */
  }
  
  .symptoms-section {
    order: 2;
  }
  
  .symptoms-table-header, .symptoms-table-row {
    flex-wrap: wrap;
  }
  
  .symptom-name-col {
    flex: 1 1 100%;
    margin-bottom: 8px;
  }
  
  .symptom-duration-col, .symptom-severity-col {
    flex: 1 1 45%;
  }
  
  .symptom-actions-col {
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
  }
}

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .progress-container {
    align-self: flex-end;
  }
  
  .selected-items {
    gap: 6px;
  }
  
  .prediction-item {
    padding: 12px;
  }
  
  .disease-name {
    font-size: 14px;
  }
  
  .probability {
    font-size: 12px;
  }
}
</style>
