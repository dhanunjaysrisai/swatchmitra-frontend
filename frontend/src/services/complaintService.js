import { getApiBaseUrl } from '../config/apiBase';

class ComplaintService {
  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Get headers with auth token
  getHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Get headers for file upload
  getFileUploadHeaders() {
    const token = this.getAuthToken();
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  // Submit a new complaint
  async submitComplaint(complaintData) {
    try {
      console.log('Submitting complaint with data:', complaintData);
      
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', complaintData.title);
      formData.append('description', complaintData.description);
      formData.append('location', complaintData.location);
      formData.append('category', complaintData.category);
      
      // Add image if provided
      if (complaintData.image) {
        formData.append('image', complaintData.image);
      }

      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await fetch(`${getApiBaseUrl()}/complaints`, {
        method: 'POST',
        headers: this.getFileUploadHeaders(),
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to submit complaint');
      }

      const result = await response.json();
      console.log('Success response:', result);
      return result;
    } catch (error) {
      console.error('Error submitting complaint:', error);
      throw error;
    }
  }

  // Get user's complaints
  async getMyComplaints(page = 1, limit = 10, status = null) {
    try {
      let url = `${getApiBaseUrl()}/complaints/my-complaints?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch complaints');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching complaints:', error);
      throw error;
    }
  }

  // Get a single complaint
  async getComplaint(complaintId) {
    try {
      const response = await fetch(`${getApiBaseUrl()}/complaints/${complaintId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch complaint');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching complaint:', error);
      throw error;
    }
  }

  // Update complaint status (admin only)
  async updateComplaintStatus(complaintId, statusData) {
    try {
      const response = await fetch(`${getApiBaseUrl()}/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(statusData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update complaint status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating complaint status:', error);
      throw error;
    }
  }

  // Get all complaints (admin only)
  async getAllComplaints(page = 1, limit = 10, filters = {}) {
    try {
      let url = `${getApiBaseUrl()}/complaints?page=${page}&limit=${limit}`;
      
      // Add filters to URL
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          url += `&${key}=${filters[key]}`;
        }
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch complaints');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching all complaints:', error);
      throw error;
    }
  }

  // Get complaint statistics (admin only)
  async getComplaintStats() {
    try {
      const response = await fetch(`${getApiBaseUrl()}/complaints/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch complaint statistics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching complaint statistics:', error);
      throw error;
    }
  }
}

export default new ComplaintService();
