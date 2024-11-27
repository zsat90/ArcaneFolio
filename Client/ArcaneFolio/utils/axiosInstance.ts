import axios from "axios";
import * as SecureStore from 'expo-secure-store'


const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('token')
        if(token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)



export default axiosInstance