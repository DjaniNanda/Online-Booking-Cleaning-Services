import axios from 'axios';

// Create an axios instance with base URL
const AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000, // Request timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
    // Add any default headers here
  }
});
export default AxiosInstance