import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gayrwoogdrsbygcpjafk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdheXJ3b29nZHJzYnlnY3BqYWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODQzNDgsImV4cCI6MjA3OTI2MDM0OH0.ouJkD_3vC-lpH5HWU9cF7vMWd_QhX6zyb_imwtFq46Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteRegistration() {
    console.log('='.repeat(60));
    console.log('TESTE COMPLETO DE REGISTRO');
    console.log('='.repeat(60));

    const testEmail = `test_${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';
    const testName = 'Usuário Teste';

    try {
        // PASSO 1: Testar signin de Auth
        console.log('\n[1/5] Testando criação de usuário no Supabase Auth...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    name: testName,
                    role: 'CLIENT',
                    avatar_url: null
                }
            }
        });

        if (authError) {
            console.error('❌ ERRO no Auth:', authError.message);
            console.error('Código:', authError.status);
            console.error('Detalhes:', JSON.stringify(authError, null, 2));
            return;
        }

        console.log('✅ Usuário Auth criado!');
        console.log(`   ID: ${authData.user.id}`);
        console.log(`   Email: ${authData.user.email}`);

        // PASSO 2: Aguardar trigger
        console.log('\n[2/5] Aguardando trigger criar perfil no banco...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // PASSO 3: Verificar se o perfil foi criado
        console.log('\n[3/5] Verificando se o perfil foi criado na tabela users...');
        const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError) {
            console.error('❌ ERRO ao buscar perfil:', profileError.message);
            console.error('Código:', profileError.code);
            console.error('Detalhes:', JSON.stringify(profileError, null, 2));

            console.log('\n🔍 DIAGNÓSTICO:');
            if (profileError.code === 'PGRST116') {
                console.log('   -> O perfil NÃO foi criado. O trigger pode não estar funcionando.');
            } else if (profileError.code === '42501') {
                console.log('   -> Permissão negada. RLS pode estar bloqueando.');
            }

            return;
        }

        console.log('✅ Perfil encontrado!');
        console.log('   Dados:', JSON.stringify(profileData, null, 2));

        // PASSO 4: Testar login
        console.log('\n[4/5] Testando login com as credenciais...');

        // Primeiro fazer logout
        await supabase.auth.signOut();

        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });

        if (loginError) {
            console.error('❌ ERRO no login:', loginError.message);
            return;
        }

        console.log('✅ Login bem-sucedido!');

        // PASSO 5: Verificar sessão
        console.log('\n[5/5] Verificando sessão atual...');
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            console.log('✅ Sessão ativa!');
            console.log(`   User ID: ${session.user.id}`);
        } else {
            console.log('❌ Nenhuma sessão ativa');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ TODOS OS TESTES PASSARAM!');
        console.log('='.repeat(60));
        console.log('\n📝 Credenciais de teste:');
        console.log(`   Email: ${testEmail}`);
        console.log(`   Senha: ${testPassword}`);

    } catch (error) {
        console.error('\n💥 ERRO INESPERADO:', error);
    }
}

testCompleteRegistration();
