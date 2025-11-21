import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gayrwoogdrsbygcpjafk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdheXJ3b29nZHJzYnlnY3BqYWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODQzNDgsImV4cCI6MjA3OTI2MDM0OH0.ouJkD_3vC-lpH5HWU9cF7vMWd_QhX6zyb_imwtFq46Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAuthDiagnostic() {
    console.log('--- INICIANDO DIAGNÓSTICO DE AUTH ---');

    const testEmail = `test_user_${Date.now()}@gmail.com`;
    const testPassword = 'password123';

    console.log(`\n1. Tentando criar usuário Auth: ${testEmail}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
            data: {
                name: 'Test User',
                role: 'CLIENT'
            }
        }
    });

    if (authError) {
        console.error('❌ ERRO no Supabase Auth SignUp:');
        console.error(JSON.stringify(authError, null, 2));
        return;
    }

    console.log('✅ Usuário Auth criado com sucesso.');
    console.log(`   ID: ${authData.user.id}`);

    console.log('\n2. Tentando inserir perfil na tabela "users"...');

    const newUser = {
        id: authData.user.id,
        email: testEmail,
        name: 'Test User',
        role: 'CLIENT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const { data: dbData, error: dbError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

    if (dbError) {
        console.error('❌ ERRO ao inserir na tabela "users":');
        console.error(JSON.stringify(dbError, null, 2));
        console.error('\n🔍 ANÁLISE DO ERRO:');
        if (dbError.code === '42501') {
            console.error('   -> PERMISSÃO NEGADA (RLS). A política de INSERT ainda não está funcionando.');
        } else if (dbError.code === '23505') {
            console.error('   -> VIOLAÇÃO DE UNICIDADE. O usuário já existe.');
        }
    } else {
        console.log('✅ Perfil criado com sucesso na tabela "users".');
    }

    console.log('\n--- FIM DO DIAGNÓSTICO ---');
}

runAuthDiagnostic();
