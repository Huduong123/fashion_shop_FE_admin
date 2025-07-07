import api from './api'

const accountService = {
  // Get all accounts
  getAllAccounts: async () => {
    try {
      const response = await api.get('/admin/accounts')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch accounts'
      }
    }
  },

  // Get accounts with pagination
  getAccountsWithPagination: async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
    try {
      const response = await api.get('/admin/accounts/paginated', {
        params: {
          page,
          size,
          sortBy,
          sortDir
        }
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error fetching paginated accounts:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch paginated accounts'
      }
    }
  },

  // Search accounts with filters
  searchAccounts: async (searchParams = {}) => {
    try {
      const params = new URLSearchParams()
      
      // Add search parameters if they exist and are not empty
      if (searchParams.username && searchParams.username.trim()) {
        params.append('username', searchParams.username.trim())
      }
      if (searchParams.email && searchParams.email.trim()) {
        params.append('email', searchParams.email.trim())
      }
      if (searchParams.enabled !== null && searchParams.enabled !== undefined && searchParams.enabled !== '') {
        params.append('enabled', searchParams.enabled)
      }
      if (searchParams.role && searchParams.role.trim()) {
        params.append('role', searchParams.role.trim())
      }
      if (searchParams.createdAt) {
        params.append('createdAt', searchParams.createdAt)
      }

      const queryString = params.toString()
      const url = queryString ? `/admin/accounts/search?${queryString}` : '/admin/accounts'
      
      const response = await api.get(url)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error searching accounts:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search accounts'
      }
    }
  },

  // Get single account
  getAccount: async (accountId) => {
    try {
      const response = await api.get(`/admin/accounts/${accountId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error fetching account:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch account'
      }
    }
  },

  // Create account
  createAccount: async (accountData) => {
    try {
      const response = await api.post('/admin/accounts', accountData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error creating account:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create account'
      }
    }
  },

  // Update account
  updateAccount: async (accountId, accountData) => {
    try {
      // Ensure id is included in the request body
      const dataWithId = {
        ...accountData,
        id: accountId
      }
      const response = await api.put('/admin/accounts', dataWithId)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error updating account:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update account'
      }
    }
  },

  // Delete account
  deleteAccount: async (accountId) => {
    try {
      await api.delete(`/admin/accounts/${accountId}`)
      return {
        success: true
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete account'
      }
    }
  },

  // Enable/Disable account
  toggleAccountStatus: async (accountId, enabled) => {
    try {
      const response = await api.patch(`/admin/accounts/${accountId}/status`, {
        enabled
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to toggle account status'
      }
    }
  },

  // Add role to user
  addRoleToUser: async (userId, roleName) => {
    try {
      const response = await api.post(`/admin/accounts/${userId}/roles`, {
        roleName
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error adding role to user:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add role to user'
      }
    }
  },

  // Remove role from user
  removeRoleFromUser: async (userId, roleName) => {
    try {
      const response = await api.delete(`/admin/accounts/${userId}/roles/${roleName}`)
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error removing role from user:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove role from user'
      }
    }
  }
}

// Add alias for convenience
accountService.getAccountById = accountService.getAccount

export default accountService 