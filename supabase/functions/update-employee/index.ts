import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Не авторизован' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Проверяем что вызывающий — админ
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user: caller } } = await supabaseUser.auth.getUser()
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Не авторизован' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: callerEmployee } = await supabaseUser
      .from('employees')
      .select('role')
      .eq('id', caller.id)
      .single()

    if (!callerEmployee || callerEmployee.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Только админ может редактировать сотрудников' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { user_id, full_name, role, password } = await req.json()

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id обязателен' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Обновляем employees
    const employeeUpdates: Record<string, string> = {}
    if (full_name) employeeUpdates.full_name = full_name
    if (role) employeeUpdates.role = role

    if (Object.keys(employeeUpdates).length > 0) {
      const { error: empError } = await supabaseAdmin
        .from('employees')
        .update(employeeUpdates)
        .eq('id', user_id)

      if (empError) {
        return new Response(JSON.stringify({ error: empError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Обновляем пароль в auth.users (если передан)
    if (password) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { password }
      )

      if (authError) {
        return new Response(JSON.stringify({ error: authError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
