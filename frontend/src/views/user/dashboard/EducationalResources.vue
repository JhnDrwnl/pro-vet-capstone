<!-- views/user/EducationalResources.vue -->
<template>
  <div class="p-6 bg-white rounded-2xl">
    <div class="edu-resources-container">
      <!-- Header with Back Button -->
      <header class="header-section">
        <h1 class="page-title">Educational Resources</h1>
        <router-link to="/vet/dashboard" class="back-button">
          <ArrowLeftIcon class="back-icon" />
          <span>Return to Dashboard</span>
        </router-link>
      </header>

      <!-- Loading State with Skeleton Cards -->
      <div v-if="isLoading" class="loading-container">
        <div class="skeleton-grid">
          <div v-for="i in 6" :key="i" class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
              <div class="skeleton-badge"></div>
              <div class="skeleton-title"></div>
              <div class="skeleton-text"></div>
              <div class="skeleton-meta"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="resources-content">
        <!-- Resource Categories Navigation -->
        <div class="categories-nav">
          <button 
            @click="selectedCategory = 'all'"
            :class="['category-tab', selectedCategory === 'all' ? 'active' : '']"
            :aria-pressed="selectedCategory === 'all'"
          >
            <LayersIcon class="category-icon" />
            <span>All Resources</span>
          </button>
          <button 
            v-for="category in resourceCategories" 
            :key="category.id"
            @click="selectedCategory = category.id"
            :class="['category-tab', selectedCategory === category.id ? 'active' : '']"
            :aria-pressed="selectedCategory === category.id"
          >
            <component :is="getCategoryIcon(category.name)" class="category-icon" />
            <span>{{ category.name }}</span>
          </button>
        </div>

        <!-- Search and Filter Bar -->
        <div class="search-filter-container">
          <div class="search-wrapper">
            <SearchIcon class="search-icon" />
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search resources..."
              class="search-input"
              aria-label="Search resources"
            />
            <span v-if="filteredResources.length > 0" class="results-count">
              {{ filteredResources.length }} result{{ filteredResources.length !== 1 ? 's' : '' }}
            </span>
          </div>
          
          <div class="filter-wrapper">
            <button class="filter-button">
              <FilterIcon class="filter-icon" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <!-- Resources Grid -->
        <div class="resources-grid">
          <div 
            v-for="resource in filteredResources" 
            :key="resource.id" 
            class="resource-card"
            @click="openResource(resource)"
            tabindex="0"
            @keydown.enter="openResource(resource)"
            role="button"
            :aria-label="`View ${resource.name}`"
          >
            <div class="card-media">
              <img 
                v-if="resource.coverPhoto" 
                :src="resource.coverPhoto" 
                :alt="resource.name" 
                class="card-image" 
              />
              <div v-else class="card-placeholder">
                <FileIcon class="placeholder-icon" />
              </div>
              
              <!-- Video Play Button Overlay -->
              <div v-if="resource.type === 'Video'" class="video-overlay">
                <PlayIcon class="play-icon" />
              </div>
            </div>
            
            <div class="card-content">
              <div class="card-meta-top">
                <span :class="['resource-badge', getTagClass(resource.type)]">
                  <component :is="getTypeIcon(resource.type)" class="badge-icon" />
                  {{ resource.type }}
                </span>
                <span class="read-time">
                  <ClockIcon class="time-icon" />
                  {{ getReadTime(resource.description) }}
                </span>
              </div>
              
              <h3 class="card-title">{{ resource.name }}</h3>
              
              <p v-if="resource.description" class="card-description">
                {{ getExcerpt(resource.description) }}
              </p>
              
              <div class="card-meta-bottom">
                <div class="category-info">
                  <div class="category-avatar">
                    <component :is="getCategoryIcon(getCategoryName(resource.categoryId))" class="category-avatar-icon" />
                  </div>
                  <div class="category-details">
                    <p class="category-name">{{ getCategoryName(resource.categoryId) }}</p>
                    <p class="publish-date">{{ formatDate(resource.createdAt) }}</p>
                  </div>
                </div>
                
                <button class="action-button">
                  {{ getActionButtonText(resource.type) }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredResources.length === 0" class="empty-state">
          <div class="empty-illustration">
            <SearchXIcon class="empty-icon" />
          </div>
          <h3 class="empty-title">No resources found</h3>
          <p class="empty-message">Try adjusting your search or filter criteria</p>
          <button @click="resetFilters" class="reset-button">Reset Filters</button>
        </div>
      </div>

      <!-- Resource Modal -->
      <!-- Using v-show instead of v-if with transition to avoid DOM manipulation issues -->
      <div v-show="selectedResource" class="modal-overlay" @click.self="closeResource">
        <div class="modal-container" role="dialog" aria-labelledby="resource-modal-title">
          <div class="modal-header">
            <div class="modal-meta">
              <span v-if="selectedResource" :class="['modal-badge', getTagClass(selectedResource.type)]">
                <component :is="getTypeIcon(selectedResource.type)" class="badge-icon" />
                {{ selectedResource.type }}
              </span>
              <span v-if="selectedResource" class="modal-time">
                <ClockIcon class="time-icon" />
                {{ getReadTime(selectedResource.description) }}
              </span>
            </div>
            <button @click="closeResource" class="modal-close" aria-label="Close modal">
              <XIcon class="close-icon" />
            </button>
          </div>
          
          <div v-if="selectedResource" class="modal-content">
            <div class="modal-media">
              <img 
                v-if="selectedResource.coverPhoto" 
                :src="selectedResource.coverPhoto" 
                :alt="selectedResource.name" 
                class="modal-image" 
              />
              <div v-else class="modal-placeholder">
                <FileIcon class="modal-placeholder-icon" />
              </div>
              
              <!-- Video Play Button Overlay for Modal -->
              <div v-if="selectedResource.type === 'Video'" class="modal-video-overlay">
                <PlayIcon class="modal-play-icon" />
              </div>
            </div>
            
            <h1 id="resource-modal-title" class="modal-title">{{ selectedResource.name }}</h1>
            
            <div class="modal-description">
              <div v-if="selectedResource.description" v-html="formatDescription(selectedResource.description)"></div>
              <p v-else class="no-description">No description available</p>
            </div>
            
            <div class="modal-footer">
              <div class="modal-author">
                <div class="author-avatar">
                  <component :is="getCategoryIcon(getCategoryName(selectedResource.categoryId))" class="author-icon" />
                </div>
                <div class="author-info">
                  <p class="author-category">{{ getCategoryName(selectedResource.categoryId) }}</p>
                  <p class="author-date">{{ formatDate(selectedResource.createdAt) }}</p>
                </div>
              </div>
              
              <div class="modal-actions">
                <button class="modal-action-button bookmark" aria-label="Bookmark">
                  <BookmarkIcon class="action-icon" />
                </button>
                <button class="modal-action-button share" aria-label="Share">
                  <ShareIcon class="action-icon" />
                </button>
              </div>
            </div>
            
            <!-- Related Resources -->
            <div v-if="relatedResources.length > 0" class="related-resources">
              <h3 class="related-title">Related Resources</h3>
              <div class="related-grid">
                <div 
                  v-for="resource in relatedResources" 
                  :key="resource.id" 
                  class="related-card"
                  @click="openResource(resource)"
                  tabindex="0"
                  @keydown.enter="openResource(resource)"
                  role="button"
                  :aria-label="`View related resource: ${resource.name}`"
                >
                  <div class="related-media">
                    <img 
                      v-if="resource.coverPhoto" 
                      :src="resource.coverPhoto" 
                      :alt="resource.name" 
                      class="related-image" 
                    />
                    <div v-else class="related-placeholder">
                      <FileIcon class="related-placeholder-icon" />
                    </div>
                    
                    <!-- Video Play Button Overlay for Related -->
                    <div v-if="resource.type === 'Video'" class="related-video-overlay">
                      <PlayIcon class="related-play-icon" />
                    </div>
                  </div>
                  
                  <div class="related-content">
                    <span :class="['related-badge', getTagClass(resource.type)]">
                      {{ resource.type }}
                    </span>
                    <h4 class="related-card-title">{{ resource.name }}</h4>
                    <span class="related-time">{{ getReadTime(resource.description) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useResourceCategoryStore } from '@/stores/modules/ResourceCategoryStore';
import { storeToRefs } from 'pinia';
import { 
  Clock as ClockIcon,
  User as UserIcon,
  X as XIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  Search as SearchIcon,
  ArrowLeft as ArrowLeftIcon,
  BookOpen as BookOpenIcon,
  File as FileIcon,
  Play as PlayIcon,
  Filter as FilterIcon,
  Layers as LayersIcon,
  FileText as FileTextIcon,
  Headphones as HeadphonesIcon,
  Image as ImageIcon,
  HelpCircle as HelpCircleIcon,
  Dog as DogIcon,
  Cat as CatIcon,
  Bird as BirdIcon,
  SearchX as SearchXIcon,
  Video as VideoIcon
} from 'lucide-vue-next';

const route = useRoute();
const resourceCategoryStore = useResourceCategoryStore();

// Use storeToRefs to maintain reactivity when destructuring store state
const { resourceCategories, resources, loading: storeLoading } = storeToRefs(resourceCategoryStore);

const selectedResource = ref(null);
const searchQuery = ref('');
const selectedCategory = ref('all');
const isLoading = ref(false);
const relatedResources = ref([]);

// Fetch data on component mount
onMounted(async () => {
  isLoading.value = true;
  try {
    // Fetch categories and resources from resourceCategories collection
    await resourceCategoryStore.fetchResourceCategories();
    await resourceCategoryStore.fetchResources();
    
    // Check if we have a resourceId param from the router
    if (route.params.resourceId) {
      const resourceId = route.params.resourceId;
      const resource = resources.value?.find(r => r.id === resourceId);
      if (resource) {
        openResource(resource);
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    isLoading.value = false;
  }
});

// Filter resources based on category and search query
const filteredResources = computed(() => {
  if (!resources.value) return [];
  
  let filteredItems = [...resources.value];
  
  // Filter by category
  if (selectedCategory.value !== 'all') {
    filteredItems = filteredItems.filter(resource => 
      resource.categoryId === selectedCategory.value
    );
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filteredItems = filteredItems.filter(resource => 
      resource.name.toLowerCase().includes(query) || 
      (resource.description && resource.description.toLowerCase().includes(query))
    );
  }
  
  return filteredItems;
});

// Helper functions
function getTagColor(type) {
  const typeColors = {
    'Document': 'bg-blue-100 text-blue-600',
    'Video': 'bg-red-100 text-red-600',
    'Audio': 'bg-purple-100 text-purple-600',
    'Image': 'bg-green-100 text-green-600',
    'Other': 'bg-gray-100 text-gray-600'
  };
  
  return typeColors[type] || 'bg-gray-100 text-gray-600';
}

function getTagClass(type) {
  const typeClasses = {
    'Document': 'document',
    'Video': 'video',
    'Audio': 'audio',
    'Image': 'image',
    'Other': 'other'
  };
  
  return typeClasses[type] || 'other';
}

function getTypeIcon(type) {
  const typeIcons = {
    'Document': FileTextIcon,
    'Video': VideoIcon,
    'Audio': HeadphonesIcon,
    'Image': ImageIcon,
    'Other': HelpCircleIcon
  };
  
  return typeIcons[type] || HelpCircleIcon;
}

function getCategoryIcon(categoryName) {
  const categoryIcons = {
    'Dogs': DogIcon,
    'Cats': CatIcon,
    'Birds': BirdIcon
  };
  
  // Default to BookOpenIcon if no match or for other categories
  return categoryIcons[categoryName] || BookOpenIcon;
}

function getActionButtonText(type) {
  if (type === 'Video') return 'Watch Now';
  if (type === 'Audio') return 'Listen Now';
  if (type === 'Image') return 'View Now';
  return 'Read More';
}

function getReadTime(text) {
  if (!text) return '1 min read';
  
  // Average reading speed: 200 words per minute
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  
  return `${minutes} min read`;
}

function getExcerpt(text) {
  if (!text) return '';
  
  // Return first 120 characters as excerpt
  return text.length > 120 ? text.substring(0, 120) + '...' : text;
}

function formatDate(timestamp) {
  if (!timestamp) return 'Unknown date';
  
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function formatDescription(description) {
  if (!description) return '';
  
  // Convert line breaks to paragraphs
  return description
    .split('\n')
    .filter(paragraph => paragraph.trim() !== '')
    .map(paragraph => `<p>${paragraph}</p>`)
    .join('');
}

function getCategoryName(categoryId) {
  if (!resourceCategories.value) return 'Unknown Category';
  
  const category = resourceCategories.value.find(c => c.id === categoryId);
  return category ? category.name : 'Unknown Category';
}

function openResource(resource) {
  // First update related resources
  if (resources.value) {
    relatedResources.value = resources.value
      .filter(r => r.categoryId === resource.categoryId && r.id !== resource.id)
      .slice(0, 4); // Show up to 4 related resources
  }
  
  // Then set the selected resource
  selectedResource.value = resource;
  document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
}

function closeResource() {
  document.body.style.overflow = ''; // Restore scrolling
  selectedResource.value = null;
}

function resetFilters() {
  searchQuery.value = '';
  selectedCategory.value = 'all';
}

// Reset pagination when filters change
watch([searchQuery, selectedCategory], () => {
  // If we had pagination, we would reset it here
});
</script>

<style scoped>
/* Import Google Font - Poppins */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

/* Base Styles */
:root {
  --primary-50: #f0f7ff;
  --primary-100: #e0eefe;
  --primary-200: #bae0fd;
  --primary-300: #7cc8fb;
  --primary-400: #36adf2;
  --primary-500: #0c96e6;
  --primary-600: #0078c2;
  --primary-700: #00639e;
  --primary-800: #065283;
  --primary-900: #0a446c;
  
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  --document-color: #3b82f6;
  --document-bg: #dbeafe;
  --video-color: #ef4444;
  --video-bg: #fee2e2;
  --audio-color: #8b5cf6;
  --audio-bg: #ede9fe;
  --image-color: #10b981;
  --image-bg: #d1fae5;
  --other-color: #6b7280;
  --other-bg: #f3f4f6;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 6px 16px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
  
  --radius-sm: 8px;
  --radius: 16px;
  --radius-lg: 24px;
}

/* Main Container */
.edu-resources-container {
  font-family: 'Poppins', sans-serif;
  max-width: 1280px;
  margin: 0 auto;
  color: var(--gray-800);
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gray-200);
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
}

.back-button {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: var(--primary-50);
  color: var(--primary-700);
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: var(--primary-100);
}

.back-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

/* Loading State */
.loading-container {
  padding: 2rem 0;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .skeleton-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .skeleton-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .skeleton-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.skeleton-card {
  border-radius: var(--radius);
  overflow: hidden;
  background-color: white;
  box-shadow: var(--shadow-sm);
}

.skeleton-image {
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  background-color: var(--gray-200);
  animation: pulse 1.5s infinite;
}

.skeleton-content {
  padding: 1rem;
}

.skeleton-badge {
  width: 80px;
  height: 24px;
  border-radius: 12px;
  background-color: var(--gray-200);
  margin-bottom: 0.75rem;
  animation: pulse 1.5s infinite;
}

.skeleton-title {
  width: 90%;
  height: 24px;
  border-radius: 4px;
  background-color: var(--gray-200);
  margin-bottom: 0.75rem;
  animation: pulse 1.5s infinite;
}

.skeleton-text {
  width: 100%;
  height: 16px;
  border-radius: 4px;
  background-color: var(--gray-200);
  margin-bottom: 1rem;
  animation: pulse 1.5s infinite;
}

.skeleton-meta {
  width: 60%;
  height: 16px;
  border-radius: 4px;
  background-color: var(--gray-200);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Categories Navigation */
.categories-nav {
  display: flex;
  overflow-x: auto;
  gap: 0.75rem;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  scrollbar-width: none; /* Firefox */
}

.categories-nav::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.category-tab {
  display: flex;
  align-items: center;
  padding: 0.625rem 1rem;
  background-color: var(--gray-100);
  color: var(--gray-700);
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 0.875rem;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.category-tab:hover {
  background-color: var(--gray-200);
}

.category-tab.active {
  background-color: var(--primary-600);
  color: white;
}

.category-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

/* Search and Filter Bar */
.search-filter-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-wrapper {
  position: relative;
  flex-grow: 1;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--gray-500);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--gray-300);
  background-color: white;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-400);
  box-shadow: 0 0 0 3px var(--primary-100);
}

.results-count {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: var(--gray-500);
}

.filter-wrapper {
  display: flex;
}

.filter-button {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--gray-100);
  color: var(--gray-700);
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.filter-button:hover {
  background-color: var(--gray-200);
}

.filter-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

/* Resources Grid */
.resources-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (min-width: 640px) {
  .resources-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .resources-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .resources-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.resource-card {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius);
  overflow: hidden;
  background-color: white;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  height: 100%;
}

.resource-card:hover, .resource-card:focus {
  transform: translateY(-4px) scale(1.01);
  box-shadow: var(--shadow-md);
}

.card-media {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  background-color: var(--gray-100);
  overflow: hidden;
}

.card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.resource-card:hover .card-image {
  transform: scale(1.05);
}

.card-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-100);
}

.placeholder-icon {
  width: 3rem;
  height: 3rem;
  color: var(--primary-500);
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.resource-card:hover .video-overlay {
  opacity: 1;
}

.play-icon {
  width: 3rem;
  height: 3rem;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 0.75rem;
}

.card-content {
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  flex-grow: 1;
}

.card-meta-top {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.resource-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-right: 0.75rem;
}

.resource-badge.document {
  background-color: var(--document-bg);
  color: var(--document-color);
}

.resource-badge.video {
  background-color: var(--video-bg);
  color: var(--video-color);
}

.resource-badge.audio {
  background-color: var(--audio-bg);
  color: var(--audio-color);
}

.resource-badge.image {
  background-color: var(--image-bg);
  color: var(--image-color);
}

.resource-badge.other {
  background-color: var(--other-bg);
  color: var(--other-color);
}

.badge-icon {
  width: 0.875rem;
  height: 0.875rem;
  margin-right: 0.25rem;
}

.read-time {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: var(--gray-500);
}

.time-icon {
  width: 0.875rem;
  height: 0.875rem;
  margin-right: 0.25rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.card-description {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  flex-grow: 1;
}

.card-meta-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.category-info {
  display: flex;
  align-items: center;
}

.category-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: var(--primary-100);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.category-avatar-icon {
  width: 1rem;
  height: 1rem;
  color: var(--primary-600);
}

.category-details {
  display: flex;
  flex-direction: column;
}

.category-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gray-800);
}

.publish-date {
  font-size: 0.625rem;
  color: var(--gray-500);
}

.action-button {
  padding: 0.5rem 1rem;
  background-color: var(--primary-600);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: var(--primary-700);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-illustration {
  width: 6rem;
  height: 6rem;
  background-color: var(--gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: var(--gray-400);
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
}

.empty-message {
  font-size: 0.875rem;
  color: var(--gray-500);
  margin-bottom: 1.5rem;
}

.reset-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-600);
  color: white;
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.2s ease;
}

.reset-button:hover {
  background-color: var(--primary-700);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-container {
  background-color: white;
  border-radius: var(--radius);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid var(--gray-200);
  background-color: white;
  z-index: 10;
}

.modal-meta {
  display: flex;
  align-items: center;
}

.modal-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-right: 0.75rem;
}

.modal-badge.document {
  background-color: var(--document-bg);
  color: var(--document-color);
}

.modal-badge.video {
  background-color: var(--video-bg);
  color: var(--video-color);
}

.modal-badge.audio {
  background-color: var(--audio-bg);
  color: var(--audio-color);
}

.modal-badge.image {
  background-color: var(--image-bg);
  color: var(--image-color);
}

.modal-badge.other {
  background-color: var(--other-bg);
  color: var(--other-color);
}

.modal-time {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: var(--gray-500);
}

.modal-close {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--gray-100);
  color: var(--gray-600);
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: var(--gray-200);
  color: var(--gray-800);
}

.close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.modal-content {
  padding: 1.5rem;
}

.modal-media {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  background-color: var(--gray-100);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.modal-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-100);
}

.modal-placeholder-icon {
  width: 4rem;
  height: 4rem;
  color: var(--primary-500);
}

.modal-video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-play-icon {
  width: 4rem;
  height: 4rem;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 1rem;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 1.5rem;
  line-height: 1.3;
}

.modal-description {
  color: var(--gray-700);
  font-size: 1rem;
  line-height: 1.75;
  margin-bottom: 2rem;
}

.modal-description p {
  margin-bottom: 1rem;
}

.no-description {
  font-style: italic;
  color: var(--gray-500);
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid var(--gray-200);
}

.modal-author {
  display: flex;
  align-items: center;
}

.author-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: var(--primary-100);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.author-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--primary-600);
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-category {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-800);
}

.author-date {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.modal-action-button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--gray-100);
  color: var(--gray-600);
  transition: all 0.2s ease;
}

.modal-action-button:hover {
  background-color: var(--gray-200);
  color: var(--gray-800);
}

.modal-action-button.bookmark:hover {
  background-color: var(--primary-100);
  color: var(--primary-600);
}

.modal-action-button.share:hover {
  background-color: var(--primary-100);
  color: var(--primary-600);
}

.action-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Related Resources */
.related-resources {
  margin-top: 2.5rem;
}

.related-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 1rem;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

@media (min-width: 640px) {
  .related-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.related-card {
  display: flex;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background-color: white;
  border: 1px solid var(--gray-200);
  transition: all 0.2s ease;
}

.related-card:hover {
  border-color: var(--primary-300);
  box-shadow: var(--shadow);
}

.related-media {
  position: relative;
  width: 5rem;
  height: 5rem;
  background-color: var(--gray-100);
  flex-shrink: 0;
}

.related-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-100);
}

.related-placeholder-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--primary-500);
}

.related-video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.related-play-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 0.25rem;
}

.related-content {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
}

.related-badge {
  font-size: 0.625rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.related-badge.document {
  background-color: var(--document-bg);
  color: var(--document-color);
}

.related-badge.video {
  background-color: var(--video-bg);
  color: var(--video-color);
}

.related-badge.audio {
  background-color: var(--audio-bg);
  color: var(--audio-color);
}

.related-badge.image {
  background-color: var(--image-bg);
  color: var(--image-color);
}

.related-badge.other {
  background-color: var(--other-bg);
  color: var(--other-color);
}

.related-card-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-800);
  margin-bottom: 0.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.related-time {
  font-size: 0.625rem;
  color: var(--gray-500);
}
</style>