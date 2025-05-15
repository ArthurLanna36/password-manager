// constants/supabase.ts
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } =
  Constants.expoConfig?.extra!;

// Crie estas variables no seu app.json / eas.json / .env e carregue via extra
export const supabase = createClient(
  EXPO_PUBLIC_SUPABASE_URL!,
  EXPO_PUBLIC_SUPABASE_ANON_KEY!
);
