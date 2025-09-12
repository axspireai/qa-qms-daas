import axios from "axios";

const BASE_URL =
  window._env_?.REACT_APP_BACKEND_URL || "http://localhost:5000";

export const getDocuments = async () => {
  const response = await axios.get(`${BASE_URL}/documents`);
  return response.data;
};

export const reviewDocument = async (docId, action, reviewerEmail, reviewerName) => {
  const response = await axios.post(`${BASE_URL}/documents/${docId}/review`, {
    action,
    reviewer_email: reviewerEmail,
    reviewer_name: reviewerName,
  });
  return response.data;
};
