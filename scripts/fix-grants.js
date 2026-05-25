#!/usr/bin/env node
// Aplica GRANTs nas tabelas categorias e servicos via service_role
// Requer que o usuário forneça a DB password via arg ou env SUPABASE_DB_PASSWORD

const { execSync } = require('child_process')
const path = require('path')

const projectRef = 'gmtfebfazptpmnnfiygh'
const sql = `
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categorias  TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.servicos     TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
`

const dbPassword = process.argv[2] || process.env.SUPABASE_DB_PASSWORD
if (!dbPassword) {
  console.error('Usage: node scripts/fix-grants.js <DB_PASSWORD>')
  console.error('  or:  SUPABASE_DB_PASSWORD=xxx node scripts/fix-grants.js')
  console.error('\nYou can find your DB password at:')
  console.error(`  https://supabase.com/dashboard/project/${projectRef}/settings/database`)
  process.exit(1)
}

const dbUrl = `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

try {
  const sqlFile = path.join(__dirname, '../supabase/migrations/20260525_fix_grants_categorias_servicos.sql')
  execSync(`npx supabase db query --db-url "${dbUrl}" --file "${sqlFile}"`, { stdio: 'inherit' })
  console.log('\n✅ Grants aplicados com sucesso!')
} catch (e) {
  console.error('\n❌ Falha ao aplicar grants. Verifique a senha do banco.')
  process.exit(1)
}
