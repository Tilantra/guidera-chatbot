import axios from 'axios';

const BASE_URL = 'http://139.59.5.84';

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
    prefs: Record<string, any> = {},
    cpTradeoffParameter: number = 0.7,
    complianceEnabled: boolean = true
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
      prefs,
      cp_tradeoff_parameter: cpTradeoffParameter,
      compliance_enabled: complianceEnabled,
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

  logout() {
    this.clearJwt();
  }
} 