import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

interface VerifiedUser {
  userId: string;
}

export interface EvionorQuestionnaireLead {
  car_brand: string;
  car_model: string;
  created_at: string | null;
  email: string;
  id: string;
  km_per_year: number;
  location: string;
  name: string;
  phases: string;
  phone: string;
  status: string | null;
  timeline: string;
}

async function verifyEvionorAccessToken(accessToken: string): Promise<VerifiedUser | null> {
  const evionorUrl = Deno.env.get("EVIONOR_SUPABASE_URL");
  const evionorAnonKey = Deno.env.get("EVIONOR_SUPABASE_ANON_KEY");

  if (!evionorUrl || !evionorAnonKey) {
    throw new Error("EVIONOR Supabase auth credentials are not configured");
  }

  const authClient = createClient(evionorUrl, evionorAnonKey, {
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(accessToken);

  if (error || !user) {
    return null;
  }

  return { userId: user.id };
}

async function hasEvionorAdminRole(userId: string): Promise<boolean> {
  const evionorUrl = Deno.env.get("EVIONOR_SUPABASE_URL");
  const evionorServiceKey = Deno.env.get("EVIONOR_SUPABASE_SERVICE_KEY");

  if (!evionorUrl || !evionorServiceKey) {
    throw new Error("EVIONOR Supabase service credentials are not configured");
  }

  const client = createClient(evionorUrl, evionorServiceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await client.rpc("has_role", {
    _role: "admin",
    _user_id: userId,
  });

  if (error) {
    return false;
  }

  return data === true;
}

export async function requireEvionorAdmin(accessToken: unknown): Promise<string> {
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    throw new Error("EVIONOR admin access token is required");
  }

  const verifiedUser = await verifyEvionorAccessToken(accessToken);
  if (!verifiedUser) {
    throw new Error("Invalid or expired EVIONOR access token");
  }

  const isAdmin = await hasEvionorAdminRole(verifiedUser.userId);
  if (!isAdmin) {
    throw new Error("EVIONOR admin access is required");
  }

  return verifiedUser.userId;
}
