import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";
import { User } from "@supabase/supabase-js";
import { createUser } from "../api/users";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (
          event === "SIGNED_IN" &&
          session?.user?.app_metadata?.provider !== "email"
        ) {
          try {
            // Check if user already exists in our users table
            const { data: existingUser } = await supabase
              .from("users")
              .select("*")
              .eq("auth_id", session.user.id)
              .single();
  
            // If user doesn't exist, create one
            if (!existingUser) {
              await createUser({
                auth_id: session.user.id,
                email: session.user.email || "",
                name: session.user.user_metadata?.full_name || "",
                role: "User", // Default role
                status: "Active",
              });
            }
          } catch (error) {
            console.error("Error creating user record:", error);
          }
        }
        else if (event === "SIGNED_OUT") {
          setUser(null); // Clear user state
          window.location.href = "/login"; // Redirect to login
        } else {
          setUser(session?.user ?? null);
        }
        setLoading(false);
      }
    );
  
    return () => subscription?.subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name || "",
        },
      },
    });

    if (error) throw error;

    // Create a user record in our users table
    if (data.user) {
      try {
        await createUser({
          auth_id: data.user.id,
          email: email,
          name: name || "",
          role: "User", // Default role
          status: "Active",
        });
      } catch (err) {
        console.error("Error creating user record:", err);
        // Consider whether to throw this error or handle it silently
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Clear any local storage items if needed
    localStorage.removeItem("supabase.auth.token");
    // Force redirect to login page
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        signUp,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
