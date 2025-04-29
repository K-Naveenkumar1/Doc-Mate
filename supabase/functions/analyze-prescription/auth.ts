import { createClient } from '@supabase/supabase-js';

interface AuthResponse {
  user: any;
  error: Error | null;
}

export async function authenticateUser(token: string): Promise<AuthResponse> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      return { user: null, error };
    }

    // Check if user exists in our users table
    const { data: existingUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError) {
      return { user: null, error: dbError };
    }

    // If user doesn't exist, create them
    if (!existingUser) {
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email
        });

      if (createError) {
        return { user: null, error: createError };
      }
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
}

export function getAuthToken(req: Request): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;

  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer') return null;

  return token;
} 