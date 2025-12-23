import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";
import { Button } from "./components/ui/Button";
import Profile from "./pages/Profile";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Auth />;
  }

  if (session) {
    return <Profile session={session} />;
  }

  return (
    <div>
      <h1>Welcome</h1>
      <p>{session.user.email}</p>

      <input type="png" />
      <Button onClick={handleLogout}>Sign Out</Button>
    </div>
  );
}

export default App;
