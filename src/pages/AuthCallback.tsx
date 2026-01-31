import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * OAuth callback route. After Google/GitHub redirects back, Supabase
 * parses the URL hash and restores the session. This page creates a
 * user profile if needed, then redirects to the right dashboard.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setError(sessionError.message);
        return;
      }
      if (!session?.user) {
        navigate("/auth", { replace: true });
        return;
      }

      try {
        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (!existing) {
          const meta = session.user.user_metadata;
          const fullName = meta?.full_name || meta?.name || meta?.user_name || "";
          const [firstName = "User", ...rest] = fullName.trim().split(/\s+/);
          const lastName = rest.join(" ") || "User";

          await supabase.from("users").insert({
            id: session.user.id,
            first_name: firstName,
            last_name: lastName,
            email: session.user.email!,
            ward_number: 1,
            role: "citizen",
          });
        }

        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        const role = (profile as { role: "citizen" | "admin" } | null)?.role ?? "citizen";
        navigate(role === "admin" ? "/authority" : "/citizen", { replace: true });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to complete sign in");
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-destructive text-sm">{error}</p>
        <button
          type="button"
          onClick={() => navigate("/auth", { replace: true })}
          className="text-sm text-primary underline"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Completing sign in…</p>
    </div>
  );
};

export default AuthCallback;
