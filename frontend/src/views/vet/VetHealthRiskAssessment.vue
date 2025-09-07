<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Gradient Header Background -->
    <div class="h-48 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
    
    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-6 -mt-24">
      <!-- Health Assessment Card -->
      <div class="bg-white rounded-xl shadow-sm mb-6">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Pet Health Risk Assessment</h1>
              <p class="text-gray-600 mt-1">AI-powered disease prediction and diagnostic support</p>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm font-medium text-blue-600">{{ formCompletionPercentage }}% Complete</span>
              <div class="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300" :style="{ width: `${formCompletionPercentage}%` }"></div>
              </div>
        </div>
      </div>
    </div>

        <!-- Connection Error Alert -->
        <div v-if="connectionStatus === false" class="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertTriangle class="w-5 h-5 text-red-500 flex-shrink-0" />
          <div class="flex-1">
            <span class="text-red-700 font-medium">Connection Error:</span>
            <span class="text-red-600 ml-1">Cannot connect to the prediction server.</span>
          </div>
          <button @click="reconnectWebSocket" class="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2">
            <RefreshCw size="16" />
        Reconnect
      </button>
    </div>
    
        <!-- Form Content -->
        <div v-if="!predictionResult" class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Pet Information Section -->
            <div class="space-y-6">
            <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <PawPrint class="w-5 h-5 text-blue-600" />
                </div>
              <div>
                  <h2 class="text-xl font-semibold text-gray-900">Pet Information</h2>
                  <p class="text-sm text-gray-500">Enter your pet's basic information</p>
              </div>
            </div>
            
              <!-- Pet Name -->
              <div>
                <label for="pet-name" class="block text-sm font-medium text-gray-700 mb-2">Pet Name <span class="text-red-500">*</span></label>
                <input 
                  id="pet-name" 
                  v-model="patientData['Pet Name']" 
                  type="text" 
                  placeholder="Enter pet name" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                />
              </div>
              
              <!-- Species -->
              <div>
                <label for="species" class="block text-sm font-medium text-gray-700 mb-2">Species</label>
                  <select 
                    id="species" 
                    v-model="species"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all appearance-none"
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="hamster">Hamster</option>
                    <option value="rabbit">Rabbit</option>
                  </select>
            </div>
            
              <!-- Age and Weight -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="age" class="block text-sm font-medium text-gray-700 mb-2">Age (years)</label>
                <input 
                  id="age" 
                  v-model.number="patientData['Age (years)']" 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  placeholder="Enter age" 
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                />
              </div>
              
                <div>
                  <label for="weight" class="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input 
                  id="weight" 
                  v-model.number="patientData['Weight (kg)']" 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  placeholder="Enter weight" 
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                />
              </div>
            </div>
            
              <!-- Breed -->
              <div>
                <label for="breed" class="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                <select 
                  id="breed" 
                  v-model="patientData.Breed"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all appearance-none"
                >
                  <option value="">Select breed</option>
                  <option v-for="(breed, index) in breedOptions" :key="index" :value="breed">
                    {{ breed }}
                  </option>
                </select>
            </div>

              <!-- Vaccination Status -->
              <div>
                <label for="vaccination-status" class="block text-sm font-medium text-gray-700 mb-2">Vaccination Status</label>
                <select 
                  id="vaccination-status" 
                  v-model="patientData['Vaccination_Status']"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all appearance-none"
                >
                  <option value="up-to-date">Fully Vaccinated</option>
                  <option value="partial">Partially Vaccinated</option>
                  <option value="none">Unvaccinated</option>
                </select>
          </div>
        </div>
        
            <!-- Symptoms & Health History Section -->
            <div class="space-y-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Stethoscope class="w-5 h-5 text-red-600" />
                </div>
              <div>
                  <h2 class="text-xl font-semibold text-gray-900">Symptoms & Health History</h2>
                  <p class="text-sm text-gray-500">Record symptoms and medical history</p>
              </div>
            </div>
            
              <!-- Past Diagnosis -->
              <div>
                <label for="past-diagnosis" class="block text-sm font-medium text-gray-700 mb-2">Past Diagnosis</label>
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
                    class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                  />
                  
                  <!-- Diagnosis dropdown -->
                  <div v-if="showDiagnosisDropdown && filteredDiagnoses.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    <div 
                      v-for="(diagnosis, index) in filteredDiagnoses" 
                      :key="index"
                      @mousedown.prevent="addDiagnosis(diagnosis)"
                      class="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm transition-colors"
                      :class="{ 'bg-blue-50': diagnosisHighlightedIndex === index }"
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
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {{ diagnosis }}
                    <button 
                      @click="removeDiagnosis(index)" 
                      class="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                      type="button"
                    >
                      <X size="16" />
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Symptoms Section -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">Symptoms</label>
                <div class="border border-gray-200 rounded-lg">
                  <div class="grid grid-cols-12 gap-2 bg-gray-50 p-4 text-sm font-medium text-gray-600">
                    <div class="col-span-5">Symptom</div>
                    <div class="col-span-3">Duration</div>
                    <div class="col-span-3">Severity</div>
                    <div class="col-span-1"></div>
                  </div>
                  
                  <div v-for="(symptom, index) in symptomEntries" :key="index" class="grid grid-cols-12 gap-2 p-4 border-t border-gray-200">
                    <div class="col-span-5 relative">
                      <input 
                        v-model="symptom.name"
                        @focus="showSymptomDropdown(index)"
                        @blur="handleSymptomRowBlur(index)"
                        @input="showSymptomDropdown(index)"
                        type="text" 
                        placeholder="Select symptom" 
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                      />
                      
                      <!-- Symptom dropdown -->
                      <div v-if="symptom.showDropdown && getFilteredSymptoms(symptom.name).length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                        <div 
                          v-for="(option, optIndex) in getFilteredSymptoms(symptom.name)" 
                          :key="optIndex"
                          @mousedown.prevent="selectSymptomForRow(option, index)"
                          class="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm transition-colors"
                        >
                          {{ option }}
                        </div>
                      </div>
                    </div>
                    
                    <div class="col-span-3">
                      <select 
                        v-model="symptom.duration"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all appearance-none"
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
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all appearance-none"
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
                        class="text-gray-400 hover:text-red-500 focus:outline-none p-1 rounded transition-colors"
                        type="button"
                      >
                        <X size="16" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <button 
                  @click="addSymptomRow" 
                  class="mt-4 w-full flex items-center justify-center px-4 py-3 border border-dashed border-gray-300 rounded-lg text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors text-sm font-medium"
                >
                  <Plus size="16" class="mr-2" />
                  Add Symptom
                </button>
            </div>
          </div>
        </div>
      </div>
      
          <!-- Submit Button -->
          <div class="mt-8 p-6 border-t border-gray-200">
      <button 
        @click="submitPrediction" 
        :disabled="isLoading || connectionStatus === false"
              class="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:from-blue-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center space-x-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
              <ActivityIcon v-if="isLoading" class="w-5 h-5 animate-spin" />
              <Zap v-else class="w-5 h-5" />
        <span>{{ isLoading ? 'Processing...' : 'Predict Disease' }}</span>
      </button>
      
      </div>
    </div>
    
        <!-- Error Display -->
        <div v-if="error" class="mx-6 mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
          <AlertTriangle class="w-5 h-5 flex-shrink-0" />
          <span class="font-medium">{{ error }}</span>
        </div>
        
        <div v-else class="bg-white rounded-xl shadow-sm">
          <!-- Results Header -->
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ClipboardCheck class="w-6 h-6 text-green-600" />
              </div>
        <div>
                <h2 class="text-2xl font-bold text-gray-900">Prediction Results</h2>
                <p class="text-gray-600 mt-1">AI analysis for {{ patientData['Pet Name'] }}</p>
                <div class="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                  <span class="px-2 py-1 bg-gray-100 rounded-full">{{ species.charAt(0).toUpperCase() + species.slice(1) }}</span>
                  <span v-if="patientData.Breed" class="px-2 py-1 bg-gray-100 rounded-full">{{ patientData.Breed }}</span>
                  <span v-if="patientData['Age (years)']" class="px-2 py-1 bg-gray-100 rounded-full">{{ patientData['Age (years)'] }} years</span>
                  <span v-if="patientData['Weight (kg)']" class="px-2 py-1 bg-gray-100 rounded-full">{{ patientData['Weight (kg)'] }} kg</span>
                </div>
              </div>
        </div>
      </div>
      
          <!-- Results Content -->
          <div class="p-6 space-y-6">
            <!-- Predicted Diseases -->
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <h3 class="flex items-center text-lg font-semibold text-gray-900 mb-4">
                <AlertCircle class="w-5 h-5 text-blue-600 mr-3" />
            Predicted Diseases
          </h3>
              <div class="space-y-4">
            <div 
                  v-for="(prediction, index) in predictionResult?.predictions || []" 
              :key="index"
                  class="p-4 bg-white rounded-lg border shadow-sm"
                  :class="{'border-blue-300 bg-blue-50': index === 0, 'border-gray-200': index !== 0}"
            >
                  <div class="font-semibold text-gray-900 mb-3">{{ prediction.disease }}</div>
                  <div class="h-6 bg-gray-200 rounded-full overflow-hidden">
                <div 
                      class="h-full rounded-full flex items-center justify-end pr-3 text-sm font-medium text-white"
                      :class="index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-400'"
                  :style="{ width: `${prediction.probability * 100}%` }"
                >
                  {{ (prediction.probability * 100).toFixed(1) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
        
            <!-- Recommended Diagnostics -->
            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <h3 class="flex items-center text-lg font-semibold text-gray-900 mb-4">
                <Stethoscope class="w-5 h-5 text-green-600 mr-3" />
            Recommended Diagnostics
          </h3>
              <div class="space-y-3">
                <div 
                  v-for="(diagnostic, index) in predictionResult?.report?.diagnostics || []" 
              :key="index"
                  class="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <CheckCircle class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span class="text-gray-700">{{ diagnostic }}</span>
                </div>
              </div>
        </div>
      </div>
      
          <!-- Reset Button -->
          <div class="p-6 border-t border-gray-200">
      <button 
        @click="resetForm" 
              class="w-full px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex items-center justify-center space-x-3 text-lg font-semibold shadow-lg hover:shadow-xl"
      >
              <RefreshCw class="w-5 h-5" />
        <span>New Prediction</span>
      </button>
          </div>
        </div>
    </div>
  </div>
</template>

<script>
import MLInferenceService from '@/services/MLInferenceService';
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
    this.unsubscribeConnection = MLInferenceService.onConnectionChange((status) => {
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
    
    getFilteredSymptoms(searchTerm) {
      if (!searchTerm || searchTerm.trim() === '') {
        return this.commonSymptoms;
      }
      
      const search = searchTerm.toLowerCase();
      return this.commonSymptoms.filter(symptom => 
        symptom.toLowerCase().includes(search)
      );
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
        await MLInferenceService.connect();
      } catch (error) {
        console.error('Failed to connect to ML service:', error);
        this.error = 'Failed to connect to the prediction server. Please try again later.';
      }
    },
    
    async reconnectWebSocket() {
      this.error = null;
      try {
        await MLInferenceService.connect();
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
      
      
      
      // Set up message listener
      if (this.messageListener) {
        this.messageListener(); // Remove previous listener
      }
      
      this.messageListener = MLInferenceService.onMessage((data) => {
        this.isLoading = false;
        
        if (data.error) {
          this.error = data.error;
        } else {
          this.predictionResult = data;
        }
      });
      
      try {
        // Send the message
        await MLInferenceService.sendMessage(formattedData);
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
/* Minimal custom styles - most styling now handled by Tailwind classes */
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
</style>
