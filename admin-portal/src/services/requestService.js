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

const getRequestById = async (id) => {
    const config = { withCredentials: true };
    const response = await axios.get(`${API_BASE_URL}/requests/${id}`, config);
    return response;
};

const sendAdminReply = async (id, message) => {
    const config = { withCredentials: true };
    const response = await axios.post(`${API_BASE_URL}/requests/${id}/admin-reply`, { message }, config);
    return response;
};

const sendQuotation = async (id, formData) => {
    const config = { 
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true 
    };
    const response = await axios.post(`${API_BASE_URL}/requests/${id}/send-quotation`, formData, config);
    return response;
};

const requestService = {
    getRequests,
    getRequestById,
    updateRequestStatus,
    sendAdminReply,
    sendQuotation
};

export default requestService;
