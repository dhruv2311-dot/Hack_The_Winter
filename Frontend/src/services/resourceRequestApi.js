import axios from "axios";

// Base URL handling similar to other services
const API_URL = "http://localhost:5000/api/resource-requests";
const BLOOD_BANK_API_URL = "http://localhost:5000/api/blood-banks";

// Helper to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const createResourceRequest = async (data) => {
    return axios.post(API_URL, data, getAuthHeader());
};

export const getNgoRequests = async (campId = "") => {
    const url = campId ? `${API_URL}/ngo?campId=${campId}` : `${API_URL}/ngo`;
    return axios.get(url, getAuthHeader());
};

export const getAllRequests = async () => {
    return axios.get(`${API_URL}/all`, getAuthHeader());
};

export const updateRequestStatus = async (id, status, reason = null) => {
    return axios.put(`${API_URL}/${id}/status`, { status, rejectionReason: reason }, getAuthHeader());
};

// New function to get verified blood banks
export const getVerifiedBloodBanks = async () => {
    return axios.get(`${BLOOD_BANK_API_URL}/verified`, getAuthHeader());
};
