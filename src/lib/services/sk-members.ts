export interface SKMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: 'Active' | 'Inactive' | 'Pending'
  lastActive: string
  avatar: string
  profileImage?: string
  department: string
  position: string
  joinDate: string
  location: string
  skills: string[]
  performance: number
  projects: number
  achievements: number
}

export interface CreateSKMemberData {
  name: string
  email: string
  phone: string
  role: string
  department: string
  position: string
  location: string
  skills?: string[]
  profileImage?: string
}

export interface UpdateSKMemberData extends Partial<CreateSKMemberData> {
  status?: string
  performance?: number
  projects?: number
  achievements?: number
}

class SKMembersService {
  private baseUrl = '/api/sk-members'

  async getMembers(params?: {
    search?: string
    status?: string
    role?: string
  }): Promise<SKMember[]> {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.role) searchParams.append('role', params.role)

    const url = `${this.baseUrl}?${searchParams.toString()}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch SK members')
    }
    
    return response.json()
  }

  async getMember(id: string): Promise<SKMember> {
    const response = await fetch(`${this.baseUrl}/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch SK member')
    }
    
    return response.json()
  }

  async createMember(data: CreateSKMemberData): Promise<SKMember> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create SK member')
    }
    
    return response.json()
  }

  async updateMember(id: string, data: UpdateSKMemberData): Promise<SKMember> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update SK member')
    }
    
    return response.json()
  }

  async deleteMember(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete SK member')
    }
  }

  async getStats() {
    const members = await this.getMembers()
    
    return {
      total: members.length,
      active: members.filter(m => m.status === 'Active').length,
      inactive: members.filter(m => m.status === 'Inactive').length,
      pending: members.filter(m => m.status === 'Pending').length
    }
  }
}

export const skMembersService = new SKMembersService() 