const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ssdp-api.dr-mf-12298.workers.dev/api'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string
  private defaultHeaders: HeadersInit

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Dashboard endpoints
  async getDashboardData() {
    return this.request('/analytics/dashboard')
  }

  // Products endpoints
  async getProducts(params?: { category?: string; brand?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.append('category', params.category)
    if (params?.brand) searchParams.append('brand', params.brand)
    
    const query = searchParams.toString()
    return this.request(`/products${query ? `?${query}` : ''}`)
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`)
  }

  async createProduct(product: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    })
  }

  // Outlets endpoints
  async getOutlets(params?: { city?: string; status?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.city) searchParams.append('city', params.city)
    if (params?.status) searchParams.append('status', params.status)
    
    const query = searchParams.toString()
    return this.request(`/outlets${query ? `?${query}` : ''}`)
  }

  async verifyOutlet(crNumber: string) {
    return this.request(`/outlets/verify/${crNumber}`)
  }

  async registerOutlet(outlet: any) {
    return this.request('/outlets/register', {
      method: 'POST',
      body: JSON.stringify(outlet),
    })
  }

  // Orders endpoints
  async getOrders(params?: { status?: string; outlet_id?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.outlet_id) searchParams.append('outlet_id', params.outlet_id)
    
    const query = searchParams.toString()
    return this.request(`/orders${query ? `?${query}` : ''}`)
  }

  async createOrder(order: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    })
  }

  async updateOrder(id: string, updates: any) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // Analytics endpoints
  async getSalesAnalytics(params?: { period?: string; region?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.append('period', params.period)
    if (params?.region) searchParams.append('region', params.region)
    
    const query = searchParams.toString()
    return this.request(`/analytics/sales${query ? `?${query}` : ''}`)
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export individual functions for convenience
export const {
  getDashboardData,
  getProducts,
  getProduct,
  createProduct,
  getOutlets,
  verifyOutlet,
  registerOutlet,
  getOrders,
  createOrder,
  updateOrder,
  getSalesAnalytics,
} = apiClient
