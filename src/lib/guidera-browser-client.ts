import axios from 'axios';

const BASE_URL = 'https://139.59.5.84';

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
    return !!this.authToken && !!this.tokenExp && this.tokenExp > Date.now() / 1000;
  }

  async login(email: string, password: string): Promise<string> {
    const loginUrl = `${this.apiBaseUrl}/users/login`;
    const loginData = { email, password };
    const response = await axios.post(loginUrl, loginData);
    if (response.status === 200) {
      const result = response.data;
      const token = result.token;
      const exp = result.exp || Math.floor(Date.now() / 1000) + 2 * 3600;
      console.log(result);
      console.log(token);
      console.log(exp);
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

  async generate(
    prompt: string,
    cpTradeoffParameter: number = 0.7,
    complianceEnabled: boolean = true,
    redactionEnabled: boolean = false,
    controlgrid: number = 0.5,
    usePreferredModel: boolean = true
  ): Promise<any> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    const generateUrl = `${this.apiBaseUrl}/generate`;
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
    const requestData = {
      prompt,
      cp_tradeoff_parameter: cpTradeoffParameter,
      controlgrid: controlgrid,
      compliance_enabled: complianceEnabled,
      redaction_enabled: redactionEnabled,
                  use_preferred_model: usePreferredModel,
    };
    const response = await axios.post(generateUrl, requestData, { headers });
    if (response.status === 200) {
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

  async getAnalytics(): Promise<any> {
    if (!this.tokenValid()) {
      throw new Error('Not authenticated');
    }
    const url = `${this.apiBaseUrl}/users/analytics`;
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

  logout() {
    this.clearJwt();
  }
} 