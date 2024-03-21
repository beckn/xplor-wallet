import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

// Interface defining the implementation of REST methods
export interface ApiImplementation {
  get: (url: string, config?: AxiosRequestConfig) => Promise<any>
  post: (url: string, data?: any, config?: AxiosRequestConfig) => Promise<any>
  put: (url: string, data?: any, config?: AxiosRequestConfig) => Promise<any>
  delete: (url: string, config?: AxiosRequestConfig) => Promise<any>
}

export class ApiClient implements ApiImplementation {
  private readonly axiosInstance: AxiosInstance

  constructor(baseURL?: string) {
    this.axiosInstance = axios.create({ baseURL })
  }

  async get(url: string, config?: AxiosRequestConfig): Promise<any> {
    try {
      const response = await this.axiosInstance.get(url, config)
      return response.data
    } catch (error) {
      console.error('Error in GET request:', error)
    }
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    try {
      const response = await this.axiosInstance.post(url, data, config)
      return response.data
    } catch (error) {
      console.error('Error in POST request:', error)
    }
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    try {
      const response = await this.axiosInstance.put(url, data, config)
      return response.data
    } catch (error) {
      console.error('Error in PUT request:', error)
    }
  }

  async delete(url: string, config?: AxiosRequestConfig): Promise<any> {
    try {
      const response = await this.axiosInstance.delete(url, config)
      return response.data
    } catch (error) {
      console.error('Error in DELETE request:', error)
    }
  }
}
