import api from './api';

const createRequest = async (formData) => {
    return await api.post('/requests', formData);
};

const getMyRequests = async () => {
    return await api.get('/requests/my');
};

const getRequestById = async (id) => {
    return await api.get(`/requests/${id}`);
};

const updateRequestAction = async (id, actionType) => {
    return await api.post(`/requests/${id}/${actionType}`);
};

const requestService = {
    createRequest,
    getMyRequests,
    getRequestById,
    updateRequestAction,
};

export default requestService;
