import axios from "axios";

export const API_ORIGIN = "http://localhost:8000";

const API = axios.create({
    baseURL: `${API_ORIGIN}/api/v1`,
    withCredentials: true // MANDATORY: Allows your browser to send/receive secure HTTP-Only authentication cookies
});

// Let the browser set the multipart boundary when uploading files
API.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
        if (config.headers?.delete) {
            config.headers.delete("Content-Type");
        } else if (config.headers) {
            delete config.headers["Content-Type"];
        }
    }
    return config;
});

export default API;