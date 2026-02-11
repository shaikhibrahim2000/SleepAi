import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../services/supabase.js";

export default function AuthPanel() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-lg font-semibold">Sign in</h2>
      <p className="text-sm text-slate-400">
        Use email login to access your sleep sessions.
      </p>
      <div className="mt-4">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          magicLink
        />
      </div>
    </section>
  );
}
