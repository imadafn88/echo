import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { supabase } from "./supabaseClient";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Auth from "./components/Auth";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const ensureProfile = async (user) => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!data) {
      await supabase.from("profiles").insert({
        id: user.id,
        username: user.email.split("@")[0], // temp username
        avatar_url: null,
      });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (session?.user) {
        ensureProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ⏳ While checking auth
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-sm">
        Loading…
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Not logged in */}
        {!session && <Route path="*" element={<Auth />} />}

        {/* Logged in */}
        {session && (
          <>
            <Route path="/" element={<Home session={session} />} />
            <Route path="/profile" element={<Profile session={session} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
