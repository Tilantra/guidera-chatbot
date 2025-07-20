import { useState } from "react";
import { ComplianceChatBot } from "../components/ComplianceChatBot";
import { BrowserGuideraClient } from "../lib/guidera-browser-client";

function LoginForm({ onLogin, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const client = new BrowserGuideraClient();
      await client.login(email, password);
      onLogin(client);
    } catch (err) {
      onLogin(null, err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded shadow-card w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold mb-2">Login to Guidera Chatbot</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-primary text-white py-2 rounded" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <div className="text-destructive text-sm">{error}</div>}
      </form>
    </div>
  );
}

export default function Index() {
  const [client, setClient] = useState(null);
  const [loginError, setLoginError] = useState("");

  const handleLogin = (clientInstance, error) => {
    if (clientInstance) {
      setClient(clientInstance);
      setLoginError("");
    } else {
      setLoginError(error || "Login failed");
    }
  };

  if (!client) {
    return <LoginForm onLogin={handleLogin} error={loginError} />;
  }

  // Pass a generate function and the client to the chatbot
  const handleGenerate = async (prompt, cpValue, complianceEnabled, redactionEnabled) => {
    try {
      const result = await client.generate(prompt, {}, cpValue, complianceEnabled, redactionEnabled);
      return result;
    } catch (err) {
      throw err;
    }
  };

  return <ComplianceChatBot onGenerate={handleGenerate} client={client} />;
}