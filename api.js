class AlumniConnectAPI {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.token = localStorage.getItem('token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            
            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error('Authentication required');
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    handleUnauthorized() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    // Auth methods
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (data.success) {
            this.token = data.token;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    }

    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (data.success) {
            this.token = data.token;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    }

    async getCurrentUser() {
        return await this.request('/auth/me');
    }

    async updateProfile(profileData) {
        return await this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // Events methods
    async getEvents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/events?${queryString}`);
    }

    async createEvent(eventData) {
        return await this.request('/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
    }

    async registerForEvent(eventId) {
        return await this.request(`/events/${eventId}/register`, {
            method: 'POST'
        });
    }

    // Jobs methods
    async getJobs(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/jobs?${queryString}`);
    }

    async applyForJob(jobId, applicationData) {
        return await this.request(`/jobs/${jobId}/apply`, {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
    }

    // Users methods
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/users?${queryString}`);
    }

    async connectUser(userId) {
        return await this.request(`/users/${userId}/connect`, {
            method: 'POST'
        });
    }

    // Messaging methods
    async getConversations() {
        return await this.request('/messages/conversations');
    }

    async sendMessage(conversationId, message) {
        return await this.request(`/messages/conversations/${conversationId}`, {
            method: 'POST',
            body: JSON.stringify({ message })
        });
    }
}

// Create global API instance
window.API = new AlumniConnectAPI();