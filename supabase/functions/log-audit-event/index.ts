import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface LogPayload {
  log_type: string;
  credential_id?: string;
  details?: string;
  device_id?: string;
  location_lat?: string;
  location_lon?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: LogPayload = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error("User not found.");
    }

    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip_address = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

    const logEntry = {
      user_id: user.id,
      log_date: new Date().toISOString(),
      log_type: payload.log_type,
      credential_id: payload.credential_id || null,
      details: payload.details || null,
      ip_address: ip_address,
      device_id: payload.device_id || null,
      location_lat: payload.location_lat || null,
      location_lon: payload.location_lon || null,
    };
    
    const { error } = await supabaseAdmin.from('audit_log').insert([logEntry]);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true, message: 'Log event recorded' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});