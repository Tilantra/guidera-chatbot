import axios from 'axios';
import type {
  CreateCapsuleRequest,
  CreateCapsuleResponse,
  CreateVersionRequest,
  CreateVersionResponse,
  SearchCapsuleRequest,
  SearchResponse,
  CapsuleMetadata,
  CapsuleVersion,
  VersionListResponse,
} from './capsule-types';

// Local development backend
const BASE_URL = 'http://localhost:8000';

export class BrowserGuideraClient {
  private apiBaseUrl: string;
  private authToken?: string;
  private tokenExp?: number;

  constructor(options: { apiBaseUrl?: string } = {}) {
    this.apiBaseUrl = (options.apiBaseUrl || BASE_URL).replace(/\/$/, '');
    this.authToken = localStorage.getItem('guidera_jwt') || undefined;
    this.tokenExp = Number(localStorage.getItem('guidera_jwt_exp')) || undefined;
  }

  private saveJwt(token: string, exp: number) {
    localStorage.setItem('guidera_jwt', token);
    localStorage.setItem('guidera_jwt_exp', exp.toString());
    this.authToken = token;
    this.tokenExp = exp;
  }

  private clearJwt() {
    localStorage.removeItem('guidera_jwt');
    localStorage.removeItem('guidera_jwt_exp');
    this.authToken = undefined;
    this.tokenExp = undefined;
  }

  private tokenValid(): boolean {
    // Only check if token exists; let backend handle 401s for expiration
    return !!this.authToken;
  }

  private saveSessionId(sessionId: string) {
    const expirationTime = Date.now() + 30 * 60 * 1000;
    localStorage.setItem("guidera_session_id", sessionId);
    localStorage.setItem("guidera_session_exp", expirationTime.toString());
  }
  private getSessionId(): string | undefined {
    const sessionId = localStorage.getItem("guidera_session_id");
    const sessionExp = Number(localStorage.getItem("guidera_session_exp") || "0");
    if (!sessionId || Date.now() > sessionExp) {
      this.clearSessionId();
      return undefined;
    }
    return sessionId;
  }
  private clearSessionId() {
    localStorage.removeItem("guidera_session_id");
    localStorage.removeItem("guidera_session_exp");
  }

  async login(email: string, password: string): Promise<string> {
    const loginUrl = `${this.apiBaseUrl}/users/login`;
    const loginData = { email, password };
    const response = await axios.post(loginUrl, loginData);
    if (response.status === 200) {
      const result = response.data;
      const token = result.token;
      const exp = result.exp || Math.floor(Date.now() / 1000) + 2 * 3600;
      if (token) {
        this.saveJwt(token, exp);
        return token;
      } else {
        throw new Error('Login failed: No token in response');
      }
    } else {
      throw new Error(`Login failed with status ${response.status}: ${response.statusText}`);
    }
  }

  async googleAuth(
    token: string,
    defaults?: {
      company?: string;
      teams?: string[];
      models?: string[];
      full_name?: string;
      username?: string;
      email?: string;
      tier?: string;
    }
  ): Promise<string> {
    const authUrl = `${this.apiBaseUrl}/users/auth/google`;

    try {
      const response = await axios.post(authUrl, { token, ...defaults });

      if (response.status === 200) {
        const result = response.data;
        // Check for 'token' OR 'access_token' to be robust
        const authToken = result.token || result.access_token;
        const exp = result.exp || Math.floor(Date.now() / 1000) + 2 * 3600;

        if (authToken) {
          this.saveJwt(authToken, exp);
          return authToken;
        } else {
          throw new Error('Google authentication failed: No token in response body');
        }
      } else {
        throw new Error(`Google authentication failed with status ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      throw error;
    }
  }

  async register(data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    company: string;
    models: string[];
    teams: string[];
    tier?: string;
  }): Promise<any> {
    const registerUrl = `${this.apiBaseUrl}/users/register`;
    const response = await axios.post(registerUrl, data);
    if (response.status === 200 || response.status === 201) {
      return response.data;
    } else {
      throw new Error(`Registration failed with status ${response.status}: ${response.statusText}`);
    }
  }

  async generate(
    prompt: string,
    cpTradeoffParameter: number = 0.7,
    complianceEnabled: boolean = true,
    redactionEnabled: boolean = false,
    controlgrid: number = 0.5,
    usePreferredModel: boolean = true
  ): Promise<any> {
    if (!this.tokenValid()) throw new Error('Not authenticated');

    // Check session expiration explicitly using UTC milliseconds
    const sessionId = localStorage.getItem("guidera_session_id");
    const sessionExpStr = localStorage.getItem("guidera_session_exp");
    const sessionExp = sessionExpStr ? Number(sessionExpStr) : 0;
    let currentSessionId = "";

    if (sessionId && Date.now() < sessionExp) {
      // Session is still valid
      currentSessionId = sessionId;
    } else {
      // Session expired or missing - clear storage to force new session
      this.clearSessionId();
    }

    const generateUrl = `${this.apiBaseUrl}/generate`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const requestData = {
      prompt,
      session_id: currentSessionId,
      cp_tradeoff_parameter: cpTradeoffParameter,
      controlgrid: controlgrid,
      compliance_enabled: complianceEnabled,
      redaction_enabled: redactionEnabled,
      use_preferred_model: usePreferredModel,
    };

    const response = await axios.post(generateUrl, requestData, { headers });
    if (response.status === 200) {
      if (response.data.session_id) {
        // Update session_id and reset expiration for 30 mins from now
        this.saveSessionId(response.data.session_id);
      }
      return response.data;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }


  async getSuggestions(prompt: string): Promise<string[]> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    const url = `${this.apiBaseUrl}/suggestion`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const payload = { prompt };
    const response = await axios.post(url, payload, { headers });
    if (response.status === 200) {
      const data = response.data;
      const suggestions: string[] = data.suggestions || [];
      return suggestions;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }

  async addPolicy(policyType: string, description: string): Promise<any> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    // Accept 'Input'/'Output' and convert to lowercase
    const policy_type = policyType.toLowerCase();
    const url = `${this.apiBaseUrl}/users/add_policy`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const payload = { policy_type, description };
    const response = await axios.post(url, payload, { headers });
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }

  async removePolicy(policyType: string, description: string): Promise<any> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    const policy_type = policyType.toLowerCase();
    const url = `${this.apiBaseUrl}/users/remove_policy`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const payload = { policy_type, description };
    const response = await axios.post(url, payload, { headers });
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }

  // CLEAR SESSION & CHAT
  async clearChat(): Promise<void> {
    const sessionId = this.getSessionId();
    if (!sessionId) {
      this.clearSessionId();
      return;
    }
    const deleteUrl = `${this.apiBaseUrl}/sessions/${sessionId}`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    };
    try {
      await axios.delete(deleteUrl, { headers });
    } catch (error) { }
    this.clearSessionId();
  }

  async getAnalytics(params?: { granularity?: string; time_range?: string }): Promise<any> {
    if (!this.tokenValid()) {
      throw new Error("Not authenticated");
    }

    const url = `${this.apiBaseUrl}/users/analytics`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get(url, {
      headers,
      params, // <-- pass granularity + time_range
    });

    return response.data;
  }


  async getPolicies(): Promise<{ input_policies: string[]; output_policies: string[] }> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    const url = `${this.apiBaseUrl}/users/get_policies`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }

  async getSingleUser(email?: string, username?: string): Promise<{ username: string; email: string; full_name: string; company: string; teams?: string[] }> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    
    // If no email/username provided, try to extract from JWT token
    if (!email && !username && this.authToken) {
      try {
        // Decode JWT token (format: header.payload.signature)
        const tokenParts = this.authToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          email = payload.email;
          username = payload.sub; // 'sub' typically contains username
        }
      } catch (err) {
        // Token decode failed
      }
    }
    
    // Build query parameters
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (username) params.append('username', username);
    
    if (!params.toString()) {
      throw new Error('Either email or username must be provided or extractable from token');
    }
    
    const url = `${this.apiBaseUrl}/users/getsingleUser?${params.toString()}`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }

  // Model Preference Methods
  async getPreferredModel(): Promise<{ preferred_model: string | null; accessible_models: string[]; preference_updated_at?: string }> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }

    // Use updated getUsermodels endpoint with enhanced response (models + preferences)

    const url = `${this.apiBaseUrl}/users/getUsermodels`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.get(url, { headers });

      if (response.status === 200) {
        // Backend now returns enhanced response with both legacy and new formats
        return {
          preferred_model: response.data.preferred_model || null,
          accessible_models: response.data.accessible_models || response.data.models || [],
          preference_updated_at: response.data.preference_updated_at
        };
      } else if (response.status === 401) {
        this.clearJwt();
        throw new Error('Session expired or invalid. Please log in again.');
      } else {
        throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error("Error fetching user models:", error);
      throw error;
    }
  }

  async setPreferredModel(modelId: string): Promise<{ message: string; preferred_model: string }> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    const url = `${this.apiBaseUrl}/users/preferences/model`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const payload = { model_id: modelId };
    const response = await axios.post(url, payload, { headers });
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }

  async clearPreferredModel(): Promise<{ message: string }> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    const url = `${this.apiBaseUrl}/users/preferences/model`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const response = await axios.delete(url, { headers });
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }

  // ============================================
  // CAPSULE METHODS
  // ============================================

  /**
   * Create a new capsule with initial content
   * @param request - Capsule creation request containing messages, tag, team
   * @returns Created capsule metadata
   */
  async createCapsule(request: CreateCapsuleRequest): Promise<CreateCapsuleResponse> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    const url = `${this.apiBaseUrl}/capsules`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const response = await axios.post(url, request, { headers });
    if (response.status === 200 || response.status === 201) {
      return response.data;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Create a new version for an existing capsule
   * @param capsuleId - ID of the capsule to add version to
   * @param request - Version creation request containing new messages
   * @returns Created version metadata
   */
  async createCapsuleVersion(
    capsuleId: string,
    request: CreateVersionRequest
  ): Promise<CreateVersionResponse> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    const url = `${this.apiBaseUrl}/capsules/${capsuleId}/versions`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const response = await axios.post(url, request, { headers });
    if (response.status === 200 || response.status === 201) {
      return response.data;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Get capsule metadata by ID
   * @param capsuleId - ID of the capsule
   * @returns Capsule metadata
   */
  async getCapsuleMetadata(capsuleId: string): Promise<CapsuleMetadata> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    const url = `${this.apiBaseUrl}/capsules/${capsuleId}`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Get full version content (includes all messages)
   * @param capsuleId - ID of the capsule
   * @param versionId - ID of the version
   * @returns Full version with content
   */
  async getCapsuleVersion(capsuleId: string, versionId: string): Promise<CapsuleVersion> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    const url = `${this.apiBaseUrl}/capsules/${capsuleId}/versions/${versionId}`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * List all versions of a capsule (metadata only, no full content)
   * @param capsuleId - ID of the capsule
   * @returns List of version metadata
   */
  async getCapsuleVersions(capsuleId: string): Promise<VersionListResponse> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    const url = `${this.apiBaseUrl}/capsules/${capsuleId}/versions`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Search capsules by tag, summary, or other criteria
   * @param request - Search parameters
   * @returns Search results with capsule metadata
   */
  async searchCapsules(request: SearchCapsuleRequest = {}): Promise<SearchResponse> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    const url = `${this.apiBaseUrl}/capsules/search`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const response = await axios.post(url, request, { headers });
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Get all capsules created by the current user
   * @param limit - Maximum number of results
   * @param offset - Pagination offset
   * @returns User's capsules
   */
  async getUserCapsules(limit: number = 20, offset: number = 0): Promise<SearchResponse> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    const url = `${this.apiBaseUrl}/capsules/user?limit=${limit}&offset=${offset}`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Delete a capsule and all its versions
   * @param capsuleId - Capsule ID to delete
   */
  async deleteCapsule(capsuleId: string): Promise<void> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    const url = `${this.apiBaseUrl}/capsules/${capsuleId}`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const response = await axios.delete(url, { headers });
    if (response.status === 204 || response.status === 200) {
      return;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Get capsules from all teams the user belongs to
   * @param limit - Maximum number of results
   * @param offset - Pagination offset
   * @returns Team capsules
   */
  async getUserTeamCapsules(limit: number = 20, offset: number = 0): Promise<SearchResponse> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    const url = `${this.apiBaseUrl}/capsules/user/all-teams-collection?limit=${limit}&offset=${offset}`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Get capsules for a specific team
   * @param team - Team name
   * @param limit - Maximum number of results
   * @param offset - Pagination offset
   * @returns Team capsules
   */
  async getTeamCapsules(
    team: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<SearchResponse> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    const url = `${this.apiBaseUrl}/capsules/team/${encodeURIComponent(team)}?limit=${limit}&offset=${offset}`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 401) {
      this.clearJwt();
      throw new Error('Session expired or invalid. Please log in again.');
    } else {
      throw new Error(`Error: HTTP ${response.status}: ${response.statusText}`);
    }
  }

  logout() {
    this.clearJwt();
  }
} 