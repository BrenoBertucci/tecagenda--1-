import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gayrwoogdrsbygcpjafk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdheXJ3b29nZHJzYnlnY3BqYWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODQzNDgsImV4cCI6MjA3OTI2MDM0OH0.ouJkD_3vC-lpH5HWU9cF7vMWd_QhX6zyb_imwtFq46Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDiagnostic() {
    console.log('--- INICIANDO DIAGNÓSTICO SUPABASE ---');
    console.log(`URL: ${supabaseUrl}`);

    // 1. Testar Tabela 'users'
    console.log('\n1. Testando acesso à tabela "users"...');
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });

    if (usersError) {
        console.error('❌ ERRO ao acessar "users":');
        console.error(JSON.stringify(usersError, null, 2));
    } else {
        console.log('✅ Tabela "users" acessível.');
    }

    // 2. Testar View 'appointment_details'
    console.log('\n2. Testando acesso à view "appointment_details"...');
    const { data: view, error: viewError } = await supabase
        .from('appointment_details')
        .select('*')
        .limit(1);

    if (viewError) {
        console.error('❌ ERRO ao acessar "appointment_details":');
        console.error(JSON.stringify(viewError, null, 2));
        if (viewError.code === '42P01') {
            console.error('   -> DICA: A view não existe. Você rodou o script security_improvements.sql?');
        }
    } else {
        console.log('✅ View "appointment_details" acessível.');
    }

    // 3. Testar Coluna 'deleted_at' em 'users'
    console.log('\n3. Testando coluna "deleted_at" em "users"...');
    const { data: colCheck, error: colError } = await supabase
        .from('users')
        .select('deleted_at')
        .limit(1);

    if (colError) {
        console.error('❌ ERRO ao acessar coluna "deleted_at":');
        console.error(JSON.stringify(colError, null, 2));
        if (colError.code === '42703') {
            console.error('   -> DICA: A coluna não existe. Você rodou a parte 1 do script security_improvements.sql?');
        }
    } else {
        console.log('✅ Coluna "deleted_at" existe.');
    }

    console.log('\n--- FIM DO DIAGNÓSTICO ---');
}

runDiagnostic();
