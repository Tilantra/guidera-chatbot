import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ComplianceChatBot } from "../components/ComplianceChatBot";
import { BrowserGuideraClient } from "../lib/guidera-browser-client";

export default function Index() {
  const [client, setClient] = useState<BrowserGuideraClient | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const clientInstance = new BrowserGuideraClient();
      const token = localStorage.getItem('guidera_jwt');
      const exp = Number(localStorage.getItem('guidera_jwt_exp'));

      if (token) {
        setClient(clientInstance);
      } else {
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  if (!client) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Pass a generate function and the client to the chatbot
  const handleGenerate = async (prompt, cpValue, complianceEnabled, redactionEnabled, controlgrid) => {
    try {
      const result = await client.generate(prompt, cpValue, complianceEnabled, redactionEnabled, controlgrid);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('guidera_jwt');
    localStorage.removeItem('guidera_jwt_exp');
    setClient(null);
    navigate("/login");
  };

  return <ComplianceChatBot onGenerate={handleGenerate} client={client} onLogout={handleLogout} />;
}