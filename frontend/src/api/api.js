const BASE_URL = "http://127.0.0.1:8000";

export const api = {
    // UPDATED: Added .then(res => res.json()) for consistency
    login: (email, password) => 
        fetch(`${BASE_URL}/login?email=${email}&password=${password}`, { method: 'POST' })
        .then(res => res.json()),

    register: (username, email, password) => 
        fetch(`${BASE_URL}/register?username=${username}&email=${email}&password=${password}`, { method: 'POST' })
        .then(res => res.json()),

    sendOtp: (username) => 
        fetch(`${BASE_URL}/send-otp?username=${username}`, { method: 'POST' })
        .then(res => res.json()),

    verifyOtp: (username, otp) => 
        fetch(`${BASE_URL}/verify-otp?username=${username}&otp=${otp}`, { method: 'POST' })
        .then(res => res.json()),

    forgotPassword: (username) => 
        fetch(`${BASE_URL}/forgot-password?username=${username}`, { method: 'POST' })
        .then(res => res.json()),

    resetPassword: (username, otp, newPassword) => 
        fetch(`${BASE_URL}/reset-password?username=${username}&otp=${otp}&new_password=${newPassword}`, { method: 'POST' })
        .then(res => res.json()), // Added missing comma here! 👈

    // Matches main.py chat(question, user_id)
// Matches main.py chat(request: ChatRequest)
    async sendChat(question, userId = 1) {
        const res = await fetch(`${BASE_URL}/chat`, { 
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json' // Tell the backend we are sending JSON
            },
            body: JSON.stringify({
                question: question,
                user_id: Number(userId) // Ensure it's an integer
            }) 
        });
        return res.json();
    },

    // Matches main.py analyze_waste(file, user_id)
    async analyzeImage(file, userId = 1) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("user_id", userId);
        const res = await fetch(`${BASE_URL}/image-analysis`, { method: 'POST', body: formData });
        return res.json();
    }
};