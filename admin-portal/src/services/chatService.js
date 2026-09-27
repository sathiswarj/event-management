import axios from 'axios';
import { API_BASE_URL } from './api';

const sendMessage = async (message, sessionId) => {
    const config = {
        withCredentials: true,
    };
    const response = await axios.post(`${API_BASE_URL}/admin/chat`, { message, sessionId }, config);
    return response;
};

const getChatHistory = async (sessionId) => {
    const config = {
        withCredentials: true,
    };
    const response = await axios.get(`${API_BASE_URL}/admin/chat/${sessionId}`, config);
    return response;
};

const chatService = {
    sendMessage,
    getChatHistory,
};

export default chatService;
