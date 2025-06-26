import { defineStore } from "pinia"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "@shared/firebase"
import { useArchivesStore } from "./archivesStore"

export const useResourceStore = defineStore("resourceStore", {
  state: () => ({
    resources: [],
    loading: false,
    error: null,
    lastFetch: null,
    // Cache for better performance
    resourcesCache: new Map(),
    // Pagination state
    currentPage: 1,
    itemsPerPage: 10,
    totalResources: 0,
  }),

  getters: {
    /**
     * Get all active resources
     */
    activeResources: (state) => {
      return state.resources.filter((resource) => resource.status !== "Archived")
    },

    /**
     * Get resources by category
     */
    getResourcesByCategory: (state) => {
      return (categoryId) => {
        return state.resources.filter((resource) => resource.categoryId === categoryId)
      }
    },

    /**
     * Get resources by status
     */
    getResourcesByStatus: (state) => {
      return (status) => {
        return state.resources.filter((resource) => resource.status === status)
      }
    },

    /**
     * Get resources by type
     */
    getResourcesByType: (state) => {
      return (type) => {
        return state.resources.filter((resource) => resource.type === type)
      }
    },

    /**
     * Search resources by name or description
     */
    searchResources: (state) => {
      return (searchTerm) => {
        if (!searchTerm) return state.resources
        const term = searchTerm.toLowerCase()
        return state.resources.filter(
          (resource) =>
            resource.name.toLowerCase().includes(term) ||
            (resource.description && resource.description.toLowerCase().includes(term)) ||
            (resource.tags && resource.tags.some((tag) => tag.toLowerCase().includes(term))),
        )
      }
    },

    /**
     * Get resource by ID
     */
    getResourceById: (state) => {
      return (id) => {
        return state.resources.find((resource) => resource.id === id)
      }
    },

    /**
     * Get paginated resources
     */
    paginatedResources: (state) => {
      const start = (state.currentPage - 1) * state.itemsPerPage
      const end = start + state.itemsPerPage
      return state.resources.slice(start, end)
    },

    /**
     * Get total pages for pagination
     */
    totalPages: (state) => {
      return Math.ceil(state.resources.length / state.itemsPerPage)
    },

    /**
     * Check if data needs refresh (older than 5 minutes)
     */
    needsRefresh: (state) => {
      if (!state.lastFetch) return true
      const fiveMinutes = 5 * 60 * 1000
      return Date.now() - state.lastFetch > fiveMinutes
    },
  },

  actions: {
    /**
     * Fetch all resources from Firestore
     * @param {boolean} forceRefresh - Force refresh even if data is cached
     * @returns {Promise<Array>} - Array of resources
     */
    async fetchResources(forceRefresh = false) {
      // Return cached data if available and not forcing refresh
      if (!forceRefresh && this.resources.length > 0 && !this.needsRefresh) {
        return this.resources
      }

      this.loading = true
      this.error = null

      try {
        const resourcesRef = collection(db, "resources")
        const q = query(resourcesRef, orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)

        this.resources = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        }))

        this.totalResources = this.resources.length
        this.lastFetch = Date.now()

        // Update cache
        this.resources.forEach((resource) => {
          this.resourcesCache.set(resource.id, resource)
        })

        console.log("Resources fetched successfully:", this.resources.length)
        return this.resources
      } catch (error) {
        console.error("Error fetching resources:", error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch resources by category ID
     * @param {string} categoryId - The category ID to filter by
     * @returns {Promise<Array>} - Array of resources in the category
     */
    async fetchResourcesByCategory(categoryId) {
      this.loading = true
      this.error = null

      try {
        const resourcesRef = collection(db, "resources")
        const q = query(resourcesRef, where("categoryId", "==", categoryId), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)

        const categoryResources = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        }))

        console.log(`Resources fetched for category ${categoryId}:`, categoryResources.length)
        return categoryResources
      } catch (error) {
        console.error("Error fetching resources by category:", error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Create a new resource
     * @param {Object} resourceData - The resource data
     * @returns {Promise<Object>} - The created resource with ID
     */
    async createResource(resourceData) {
      this.loading = true
      this.error = null

      try {
        // Validate required fields
        if (!resourceData.name || !resourceData.categoryId) {
          throw new Error("Resource name and category are required")
        }

        // Handle file upload if present
        let coverPhotoUrl = null
        if (resourceData.file) {
          coverPhotoUrl = await this.uploadFile(resourceData.file, "resources")
        }

        // Prepare resource data
        const newResourceData = {
          name: resourceData.name.trim(),
          categoryId: resourceData.categoryId,
          type: resourceData.type || "Document",
          status: resourceData.status || "Active",
          description: resourceData.description?.trim() || "",
          coverPhoto: coverPhotoUrl || resourceData.coverPhoto || null,
          tags: resourceData.tags?.filter((tag) => tag.trim()) || [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // Additional metadata
          createdBy: resourceData.createdBy || null,
          fileSize: resourceData.file?.size || null,
          fileType: resourceData.file?.type || null,
        }

        // Add to Firestore
        const resourcesRef = collection(db, "resources")
        const docRef = await addDoc(resourcesRef, newResourceData)

        // Create the resource object with the new ID
        const newResource = {
          id: docRef.id,
          ...newResourceData,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // Update local state
        this.resources.unshift(newResource)
        this.totalResources = this.resources.length

        // Update cache
        this.resourcesCache.set(newResource.id, newResource)

        console.log("Resource created successfully:", newResource.id)
        return newResource
      } catch (error) {
        console.error("Error creating resource:", error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update an existing resource
     * @param {string} resourceId - The ID of the resource to update
     * @param {Object} updateData - The data to update
     * @returns {Promise<boolean>} - Success status
     */
    async updateResource(resourceId, updateData) {
      this.loading = true
      this.error = null

      try {
        const resourceRef = doc(db, "resources", resourceId)

        // Check if resource exists
        const resourceDoc = await getDoc(resourceRef)
        if (!resourceDoc.exists()) {
          throw new Error("Resource not found")
        }

        const currentData = resourceDoc.data()

        // Handle file upload if new file is provided
        let coverPhotoUrl = currentData.coverPhoto
        if (updateData.file) {
          // Delete old file if it exists
          if (currentData.coverPhoto) {
            await this.deleteFile(currentData.coverPhoto)
          }
          // Upload new file
          coverPhotoUrl = await this.uploadFile(updateData.file, "resources")
        }

        // Prepare update data
        const updatedData = {
          updatedAt: serverTimestamp(),
        }

        // Only update fields that are provided
        if (updateData.name !== undefined) {
          updatedData.name = updateData.name.trim()
        }
        if (updateData.categoryId !== undefined) {
          updatedData.categoryId = updateData.categoryId
        }
        if (updateData.type !== undefined) {
          updatedData.type = updateData.type
        }
        if (updateData.status !== undefined) {
          updatedData.status = updateData.status
        }
        if (updateData.description !== undefined) {
          updatedData.description = updateData.description?.trim() || ""
        }
        if (updateData.tags !== undefined) {
          updatedData.tags = updateData.tags.filter((tag) => tag.trim())
        }
        if (coverPhotoUrl !== currentData.coverPhoto) {
          updatedData.coverPhoto = coverPhotoUrl
        }
        if (updateData.file) {
          updatedData.fileSize = updateData.file.size
          updatedData.fileType = updateData.file.type
        }

        // Update in Firestore
        await updateDoc(resourceRef, updatedData)

        // Update local state
        const resourceIndex = this.resources.findIndex((r) => r.id === resourceId)
        if (resourceIndex !== -1) {
          this.resources[resourceIndex] = {
            ...this.resources[resourceIndex],
            ...updatedData,
            updatedAt: new Date(),
          }

          // Update cache
          this.resourcesCache.set(resourceId, this.resources[resourceIndex])
        }

        console.log("Resource updated successfully:", resourceId)
        return true
      } catch (error) {
        console.error("Error updating resource:", error)
        this.error = error.message
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * Archive a resource (move to archives collection)
     * @param {string} resourceId - The ID of the resource to archive
     * @returns {Promise<boolean>} - Success status
     */
    async archiveResource(resourceId) {
      const archivesStore = useArchivesStore() // Moved to top level

      this.loading = true
      this.error = null

      try {
        const resourceRef = doc(db, "resources", resourceId)

        // Check if resource exists
        const resourceDoc = await getDoc(resourceRef)
        if (!resourceDoc.exists()) {
          throw new Error("Resource not found")
        }

        const resourceData = resourceDoc.data()

        // Add to archives collection with explicit itemType and originalId
        await archivesStore.saveToArchivesCollection({
          ...resourceData,
          originalId: resourceId,
          itemType: "resource",
          archivedAt: new Date(),
        })

        // Delete from resources collection
        await deleteDoc(resourceRef)

        // Update local state
        this.resources = this.resources.filter((r) => r.id !== resourceId)
        this.totalResources = this.resources.length

        // Remove from cache
        this.resourcesCache.delete(resourceId)

        console.log("Resource archived successfully:", resourceId)
        return true
      } catch (error) {
        console.error("Error archiving resource:", error)
        this.error = error.message
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * Permanently delete a resource (use with caution)
     * @param {string} resourceId - The ID of the resource to delete
     * @returns {Promise<boolean>} - Success status
     */
    async deleteResource(resourceId) {
      this.loading = true
      this.error = null

      try {
        const resourceRef = doc(db, "resources", resourceId)

        // Check if resource exists and get its data
        const resourceDoc = await getDoc(resourceRef)
        if (!resourceDoc.exists()) {
          throw new Error("Resource not found")
        }

        const resourceData = resourceDoc.data()

        // Delete associated file if it exists
        if (resourceData.coverPhoto) {
          await this.deleteFile(resourceData.coverPhoto)
        }

        // Delete from Firestore
        await deleteDoc(resourceRef)

        // Update local state
        this.resources = this.resources.filter((r) => r.id !== resourceId)
        this.totalResources = this.resources.length

        // Remove from cache
        this.resourcesCache.delete(resourceId)

        console.log("Resource deleted permanently:", resourceId)
        return true
      } catch (error) {
        console.error("Error deleting resource:", error)
        this.error = error.message
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * Restore a resource from archives
     * @param {string} archiveId - The ID of the archived resource
     * @returns {Promise<boolean>} - Success status
     */
    async restoreResource(archiveId) {
      const archivesStore = useArchivesStore() // Moved to top level

      this.loading = true
      this.error = null

      try {
        // Get the archived resource
        const archivedResource = await archivesStore.getArchivedItemById(archiveId)
        if (!archivedResource || archivedResource.itemType !== "resource") {
          throw new Error("Archived resource not found")
        }

        // Prepare resource data for restoration
        const { originalId, itemType, archivedAt, ...resourceData } = archivedResource

        // Add back to resources collection using the original ID
        const resourceRef = doc(db, "resources", originalId)

        await setDoc(resourceRef, {
          ...resourceData,
          id: originalId, // Preserve the original ID
          status: "Active", // Reset status to active
          updatedAt: serverTimestamp(),
        })

        // Create restored resource object
        const restoredResource = {
          id: originalId, // Use original ID
          ...resourceData,
          status: "Active",
          updatedAt: new Date(),
        }

        // Remove from archives
        await archivesStore.permanentlyDeleteArchivedItem(archiveId)

        // Update local state
        this.resources.unshift(restoredResource)
        this.totalResources = this.resources.length

        // Update cache
        this.resourcesCache.set(restoredResource.id, restoredResource)

        console.log("Resource restored successfully:", originalId)
        return true
      } catch (error) {
        console.error("Error restoring resource:", error)
        this.error = error.message
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * Bulk archive multiple resources
     * @param {Array<string>} resourceIds - Array of resource IDs to archive
     * @returns {Promise<Object>} - Results object with success and failed arrays
     */
    async bulkArchiveResources(resourceIds) {
      this.loading = true
      this.error = null

      const results = {
        success: [],
        failed: [],
      }

      try {
        for (const resourceId of resourceIds) {
          try {
            const success = await this.archiveResource(resourceId)
            if (success) {
              results.success.push(resourceId)
            } else {
              results.failed.push(resourceId)
            }
          } catch (error) {
            console.error(`Failed to archive resource ${resourceId}:`, error)
            results.failed.push(resourceId)
          }
        }

        console.log("Bulk archive completed:", results)
        return results
      } catch (error) {
        console.error("Error in bulk archive:", error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Upload file to Firebase Storage
     * @param {File} file - The file to upload
     * @param {string} folder - The storage folder
     * @returns {Promise<string>} - The download URL
     */
    async uploadFile(file, folder = "resources") {
      try {
        const timestamp = Date.now()
        const fileName = `${timestamp}_${file.name}`
        const fileRef = storageRef(storage, `${folder}/${fileName}`)

        const snapshot = await uploadBytes(fileRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)

        console.log("File uploaded successfully:", downloadURL)
        return downloadURL
      } catch (error) {
        console.error("Error uploading file:", error)
        throw new Error("Failed to upload file")
      }
    },

    /**
     * Delete file from Firebase Storage
     * @param {string} fileUrl - The file URL to delete
     * @returns {Promise<boolean>} - Success status
     */
    async deleteFile(fileUrl) {
      try {
        if (!fileUrl) return true

        // Extract file path from URL
        const url = new URL(fileUrl)
        const pathStart = url.pathname.indexOf("/o/") + 3
        const pathEnd = url.pathname.indexOf("?")
        const filePath = decodeURIComponent(url.pathname.substring(pathStart, pathEnd))

        const fileRef = storageRef(storage, filePath)
        await deleteObject(fileRef)

        console.log("File deleted successfully:", filePath)
        return true
      } catch (error) {
        console.error("Error deleting file:", error)
        // Don't throw error for file deletion failures
        return false
      }
    },

    /**
     * Export resources to CSV format
     * @param {Array} resources - Resources to export (optional, uses all if not provided)
     * @returns {string} - CSV content
     */
    exportResourcesToCSV(resources = null) {
      const dataToExport = resources || this.resources

      if (!dataToExport || dataToExport.length === 0) {
        return null
      }

      const headers = [
        "ID",
        "Name",
        "Category ID",
        "Type",
        "Status",
        "Description",
        "Tags",
        "Created At",
        "Updated At",
        "File Size",
        "File Type",
      ]

      const rows = dataToExport.map((resource) => [
        resource.id || "",
        resource.name || "",
        resource.categoryId || "",
        resource.type || "",
        resource.status || "",
        resource.description || "",
        (resource.tags || []).join("; "),
        resource.createdAt ? new Date(resource.createdAt).toLocaleString() : "",
        resource.updatedAt ? new Date(resource.updatedAt).toLocaleString() : "",
        resource.fileSize || "",
        resource.fileType || "",
      ])

      return [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n")
    },

    /**
     * Get resource statistics
     * @returns {Object} - Statistics object
     */
    getResourceStatistics() {
      const stats = {
        total: this.resources.length,
        active: 0,
        draft: 0,
        archived: 0,
        byType: {},
        byCategory: {},
        recentlyCreated: 0, // Last 7 days
      }

      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      this.resources.forEach((resource) => {
        // Count by status
        const status = resource.status || "Unknown"
        if (status === "Active") stats.active++
        else if (status === "Draft") stats.draft++
        else if (status === "Archived") stats.archived++

        // Count by type
        const type = resource.type || "Unknown"
        stats.byType[type] = (stats.byType[type] || 0) + 1

        // Count by category
        const categoryId = resource.categoryId || "Unknown"
        stats.byCategory[categoryId] = (stats.byCategory[categoryId] || 0) + 1

        // Count recently created
        if (resource.createdAt && new Date(resource.createdAt) > oneWeekAgo) {
          stats.recentlyCreated++
        }
      })

      return stats
    },

    /**
     * Set pagination parameters
     * @param {number} page - Current page number
     * @param {number} itemsPerPage - Items per page
     */
    setPagination(page, itemsPerPage) {
      this.currentPage = page
      this.itemsPerPage = itemsPerPage
    },

    /**
     * Clear all resources from state (useful for logout)
     */
    clearResources() {
      this.resources = []
      this.resourcesCache.clear()
      this.loading = false
      this.error = null
      this.lastFetch = null
      this.currentPage = 1
      this.totalResources = 0
    },

    /**
     * Refresh resources data
     */
    async refreshResources() {
      return await this.fetchResources(true)
    },
  },
})
