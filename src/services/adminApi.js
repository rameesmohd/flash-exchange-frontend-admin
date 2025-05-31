import { message } from 'antd';
import masterAxios from '../axios/masterAxios'
import { masterLogout } from '../redux/MasterSlice';
import { jwtDecode } from 'jwt-decode';
import { store } from '../redux/Store';
const axiosInstance = masterAxios()

const getToken = () => {
    const storedUser = localStorage.getItem("persist:Master");
    if (!storedUser) return null;
  
    try {
      const user = JSON.parse(storedUser);
  
      // Check if the token is valid and not the string "null"
      if (user.token && user.token !== "null") {
        const token = user.token.slice(1, -1); // Assuming the token is wrapped in quotes
        if (token !== "null") return token;
      }
  
      // If any condition above fails, return null
      return null;
    } catch (error) {
      console.error("Error parsing adminAuth from localStorage:", error);
      return null; // Return null if parsing fails
    }
  };

// Helper function to check if the token is expired
const isTokenExpired = (token) => {
    if (!token) return true; // If no token, consider it expired
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // convert to seconds
      console.log(decoded.exp, currentTime);
  
      return decoded.exp < currentTime;
    } catch (error) {
      console.error("Error decoding token:", error);
      return true; // Consider token expired if decoding fails
    }
  };

// Generic function to handle responses
const handleResponse = (response) => {
    if (response.data.msg) message.success(response.data.msg);
    if (response.data.errMsg) message.error(response.data.errMsg);
    if (response.data.info) message.info(response.data.info);
    if (response.headers["content-type"] === "application/pdf") return response;
    else return response.data;
  };

// Function to get error message based on status code
const getErrorMessage = (status) => {
    switch (status) {
      case 401:
        return "Unauthorized access. Please log in and try again.";
      case 402:
        return "Payment required. Please check your payment details.";
      case 403:
        return "Forbidden. You do not have permission to access this resource.";
      case 404:
        return "Resource not found. Please check the URL or contact support.";
      case 504:
        return "Gateway timeout. The server took too long to respond. Please try again later.";
      case 500:
        return "Internal server error. Something went wrong on our end. Please try again later.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };
  
// Generic function to handle errors
const handleError = (error) => {
    const status = error.response?.status;
    const errMsg = error.response?.data?.errMsg || getErrorMessage(status);
  
    if (error.response?.timeout) {
      logoutUser(); // Use the logout function if the status is 401
    } else {
      message.error(errMsg);
    }
  
    return Promise.reject(error);
  };
  

const adminGet = async (url, options = {}) => {
    try {
      const token = getToken();
      if (token && isTokenExpired(token)) {
        message.error("Session expired. Please log in again.");
        logoutUser();
        return;
      }
  
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axiosInstance.get(url, {
        ...options,
        headers: { ...headers, ...(options.headers || {}) },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  };
  
const adminPost = async (url, formData) => {
    try {
      const token = getToken();
      if (token && isTokenExpired(token)) {
        message.error("Session expired. Please log in again.");
        logoutUser();
        return;
      }
  
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axiosInstance.post(url, formData, { headers });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  };

const adminPatch = async (url, formData, img) => {
    try {
      const token = getToken();
      if (token && isTokenExpired(token)) {
        message.error("Session expired. Please log in again.");
        logoutUser();
        return;
      }
  
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": img ? "multipart/form-data" : "application/json",
      };
      const response = await axiosInstance.patch(url, formData, { headers });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  };
  
const adminDelete = async (url) => {
    try {
      const token = getToken();
      if (token && isTokenExpired(token)) {
        message.error("Session expired. Please log in again.");
        logoutUser();
        return;
      }
  
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axiosInstance.delete(url, { headers });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  };
  
//   // Custom logout function for user
  const logoutUser = () => {
    store.dispatch(adminLogout());
    localStorage.removeItem("persist:admin");
    window.location.href = "/admin/login"; // Uncomment if redirection is needed
  };

export { 
    adminGet,
    adminPost,
    adminPatch,
    adminDelete
}