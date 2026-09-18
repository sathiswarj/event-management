import axios from 'axios';
import { API_BASE_URL } from './api';

const getRequests = async () => {
    const config = {
        withCredentials: true,
    };
    const response = await axios.get(`${API_BASE_URL}/requests`, config);
    return response;
};

const updateRequestStatus = async (id, status) => {
    const config = {
        withCredentials: true,
    };
    const response = await axios.put(`${API_BASE_URL}/requests/${id}`, { status }, config);
    return response;
};

const requestService = {
    getRequests,
    updateRequestStatus,
};

export default requestService;
