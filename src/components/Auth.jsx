import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for the magic link!");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin} style={{ maxWidth: 400 }}>
      <h2>Sign in</h2>

      <Input
        type="email"
        placeholder="Your email"
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button disabled={loading} style={{ marginTop: 10 }}>
        {loading ? "Sending..." : "Send magic link"}
      </Button>
    </form>
  );
}
