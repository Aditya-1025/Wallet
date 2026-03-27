import axios from 'axios';

// Create an Axios instance configured to talk to the backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
});

export const authService = {
  register: async (name, email, password, mobileNumber) => {
    const response = await api.post('/auth/register', { name, email, password, mobileNumber });
    return response.data;
  },
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  verifyEmail: async (email, otp) => {
    const response = await api.post(`/auth/verify-email?email=${email}&otp=${otp}`);
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await api.post(`/auth/forgot-password?email=${email}`);
    return response.data;
  },
  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post(`/auth/reset-password?email=${email}&otp=${otp}&newPassword=${newPassword}`);
    return response.data;
  },
  getProfile: async (userId) => {
    const response = await api.get(`/auth/me/${userId}`);
    return response.data;
  }
};

export const panService = {
  submitPan: async (panName, panNumber, dob) => {
    const response = await api.post('/v1/pan-screen/details', { panName, panNumber, dob });
    return response.data;
  }
};

export const vkycService = {
  // 1️⃣ Initiate VKYC
  initiate: async (userId) => {
    const response = await api.post(`/v1/vkyc/start/${userId}`);
    return response.data;
  },

  // 2️⃣ Verify OTP
  verifyOtp: async (vkycId, otp) => {
    const response = await api.post(`/v1/vkyc/${vkycId}/verify-otp?otp=${otp}`);
    return response.data;
  },

  // 4️⃣ Submit Video
  submitVideo: async (vkycId, videoData, fileName, fileSize) => {
    const response = await api.post(`/v1/vkyc/${vkycId}/submit`, {
      videoData,
      fileName,
      fileSize
    });
    return response.data;
  },

  // Get Admin Stats
  getAdminStats: async () => {
    const response = await api.get('/v1/vkyc/admin/stats');
    return response.data;
  },

  // Get Pending Vkycs
  getPending: async () => {
    const response = await api.get('/v1/vkyc/admin/pending');
    return response.data;
  },

  // Get User VKYC Status
  getStatus: async (userId) => {
    const response = await api.get(`/v1/vkyc/status/${userId}`);
    return response.data;
  },

  // Admin Action: Approve
  approve: async (vkycId, adminId) => {
    const response = await api.put(`/v1/vkyc/${vkycId}/approve`, {
      adminId: adminId || 'admin'
    });
    return response.data;
  },

  // Admin Action: Reject
  reject: async (vkycId, adminId, reason) => {
    const response = await api.put(`/v1/vkyc/${vkycId}/reject`, {
      adminId: adminId || 'admin',
      rejectionReason: reason
    });
    return response.data;
  }
};

export const walletService = {
  // Get wallet details
  getDetails: async (userId) => {
    const response = await api.get(`/v1/wallet/${userId}`);
    return response.data;
  },

  // Link a bank account (Mock)
  linkBank: async (userId, bankData) => {
    const response = await api.post(`/v1/bank/link/${userId}`, bankData);
    return response.data;
  },

  // Get user's linked banks
  getLinkedBanks: async (userId) => {
    const response = await api.get(`/v1/bank/${userId}`);
    return response.data;
  }
};

export const transactionService = {
  // Deposit from bank
  deposit: async (userId, amount, description) => {
    const response = await api.post(`/v1/transaction/deposit/${userId}`, {
      amount,
      description: description || 'Wallet Top-up'
    });
    return response.data;
  },

  // Transfer money (Scan & Pay / Peer-to-Peer)
  transfer: async (senderUserId, receiverUserId, amount, description) => {
    const response = await api.post('/v1/transaction/transfer', {
      senderUserId,
      receiverUserId,
      amount,
      description: description || 'P2P Transfer'
    });
    return response.data;
  },

  // Get full transaction history
  getHistory: async (userId) => {
    const response = await api.get(`/v1/transaction/history/${userId}`);
    return response.data;
  }
};

export default api;
