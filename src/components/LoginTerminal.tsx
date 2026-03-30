import { useState } from "react";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type Tab = "login" | "register";

const LoginTerminal = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRole, setLoginRole] = useState("admin");

  // Register state
  const [regName, setRegName] = useState("");
  const [regOperatorId, setRegOperatorId] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!loginEmail.trim()) { setError("OPERATOR ID REQUIRED"); return; }
    if (!loginPassword.trim()) { setError("PASSCODE REQUIRED"); return; }
    if (loginPassword.length < 6) { setError("PASSCODE MUST BE AT LEAST 6 CHARACTERS"); return; }

    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoading(false);

    if (authError) {
      setError(authError.message.toUpperCase());
    } else {
      navigate("/dashboard");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!regName.trim()) { setError("FULL NAME REQUIRED"); return; }
    if (!regOperatorId.trim()) { setError("OPERATOR ID REQUIRED"); return; }
    if (!regPassword.trim()) { setError("MASTER PASSCODE REQUIRED"); return; }
    if (regPassword.length < 6) { setError("PASSCODE MUST BE AT LEAST 6 CHARACTERS"); return; }

    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email: regOperatorId,
      password: regPassword,
      options: {
        data: { full_name: regName, operator_id: regOperatorId },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);

    if (authError) {
      setError(authError.message.toUpperCase());
    } else {
      setSuccess("REGISTRATION SUBMITTED — CHECK EMAIL TO VERIFY");
    }
  };

  const inputClass =
    "w-full bg-input border border-border rounded px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground font-mono-terminal focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow";

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="sentinel-border-glow rounded-lg bg-card overflow-hidden">
        {/* Top accent bar */}
        <div className="sentinel-top-bar h-1" />

        <div className="px-8 pt-10 pb-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="font-display text-2xl font-bold tracking-[0.2em] text-foreground">
                SENTINEL
              </h1>
            </div>
            <p className="font-display text-xs tracking-[0.3em] text-accent uppercase">
              Restricted Access Terminal
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border mb-8">
            <button
              type="button"
              onClick={() => { setTab("login"); setError(""); setSuccess(""); }}
              className={`flex-1 py-3 text-xs font-display tracking-[0.2em] uppercase transition-colors ${
                tab === "login"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              System Login
            </button>
            <button
              type="button"
              onClick={() => { setTab("register"); setError(""); setSuccess(""); }}
              className={`flex-1 py-3 text-xs font-display tracking-[0.2em] uppercase transition-colors ${
                tab === "register"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register Admin
            </button>
          </div>

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs tracking-[0.2em] text-muted-foreground uppercase font-mono-terminal">
                  Username / Email
                </label>
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter Operator ID"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs tracking-[0.2em] text-muted-foreground uppercase font-mono-terminal">
                  Passcode
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter Passcode"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs tracking-[0.2em] text-muted-foreground uppercase font-mono-terminal">
                  Clearance Level
                </label>
                <select
                  value={loginRole}
                  onChange={(e) => setLoginRole(e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="admin">Admin</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>

              {error && (
                <div className="bg-accent/10 border border-accent/30 rounded px-4 py-3 text-xs tracking-wider text-accent text-center font-mono-terminal">
                  ⚠ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full sentinel-btn-glow border border-primary/40 rounded py-3.5 text-xs font-display tracking-[0.25em] text-primary uppercase transition-all duration-300 hover:bg-primary/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "AUTHENTICATING..." : "AUTHORIZE ACCESS"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-xs tracking-wider text-muted-foreground hover:text-primary transition-colors font-mono-terminal"
                >
                  Forgot Passcode?
                </button>
              </div>
            </form>
          )}

          {/* Register Form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs tracking-[0.2em] text-muted-foreground uppercase font-mono-terminal">
                  Full Name
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Enter Full Name"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs tracking-[0.2em] text-muted-foreground uppercase font-mono-terminal">
                  Assign Operator ID
                </label>
                <input
                  type="email"
                  value={regOperatorId}
                  onChange={(e) => setRegOperatorId(e.target.value)}
                  placeholder="Create Badge No."
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs tracking-[0.2em] text-muted-foreground uppercase font-mono-terminal">
                  Master Passcode
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create Password"
                  className={inputClass}
                />
              </div>

              {error && (
                <div className="bg-accent/10 border border-accent/30 rounded px-4 py-3 text-xs tracking-wider text-accent text-center font-mono-terminal">
                  ⚠ {error}
                </div>
              )}
              {success && (
                <div className="bg-primary/10 border border-primary/30 rounded px-4 py-3 text-xs tracking-wider text-primary text-center font-mono-terminal">
                  ✓ {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full sentinel-btn-glow border border-primary/40 rounded py-3.5 text-xs font-display tracking-[0.25em] text-primary uppercase transition-all duration-300 hover:bg-primary/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "PROCESSING..." : "AUTHORIZE NEW ADMIN"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginTerminal;
