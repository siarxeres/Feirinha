This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Mapa de Rotas

| Rota | Descrição |
|---|---|
| `/auth/login` | Login |
| `/auth/cadastro` | Cadastro |
| `/auth/recuperar-senha` | Recuperação de senha |
| `/dashboard/feirante` | Painel do feirante (feiras disponíveis + inscrições) |
| `/dashboard/feirante/inscricoes` | Lista de inscrições do feirante |
| `/dashboard/feirante/mapa` | Mapa de feiras |
| `/dashboard/feirante/perfil` | Perfil do feirante |
| `/dashboard/feirante/assinatura` | Gestão de assinatura |
| `/dashboard/organizador` | Painel do organizador |
| `/dashboard/organizador/feiras` | Lista de feiras do organizador (rascunho/publicada) + ação de publicar |
| `/dashboard/admin` | Painel administrativo |
| `/feiras/nova` | Criar nova feira (organizador) |
| `/feiras/[id]` | Detalhes da feira + gerenciar inscrições, mapa, comunicados e rateio de despesas (organizador) |
| `/feiras/[id]/inscricao` | Tela de inscrição do feirante numa feira + rateio de despesas (leitura) |

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Checklist do projeto (jul/2026)

### ✅ Feito — Produto (funciona em produção)
- Autenticação completa (login, cadastro, recuperação de senha)
- Landing com linguagem do organizador + CTAs enxutos
- Cadastro por papel (organizador/feirante/consumidor)
- Feirante entra sem paywall (modelo de assinatura removido)
- Organizador: criar feira → publicar
- Feirante: ver feiras publicadas → se inscrever
- Organizador: aprovar/rejeitar inscrição
- Aba de Rateio (Fase 1): lançar despesas, calcular por feirante, conta aberta
- Navegação por clique nos dois fluxos (sem URL manual)
- Painel admin com CRUD
- FLUXO CENTRAL VALIDADO ponta a ponta (testado ao vivo)

### ✅ Feito — Segurança pré-demo
- enviarComunicadoAction com autorização
- Aprovar/rejeitar com feedback real (não finge sucesso)
- Rota de debug removida da produção
- Auditoria completa realizada
- Nenhum segredo vazado

### ⏳ Pendente — Segurança de produção (pacote grande, pós-feira)
- Staging (feirinha-staging Supabase separado) — plano pronto, não executado
- RLS em todas as tabelas (hoje protegido só por server action)
- Middleware por papel (hoje só por sessão)
- Versionar policies RLS que vivem só no Supabase Studio
- Contas admin/organizador separadas
- Recriar via staging as migrations aplicadas manualmente em produção

### ⏳ Pendente — Pagamento (categoria protegida, pós-validação)
- Arquitetura do split (R$230 → R$220 organizador / R$10 app) — modelo definido, código não iniciado
- Como o organizador vira recebedor no Asaas (pergunta técnica central)
- Integração real do Asaas (hoje sandbox, congelado)

### ⏳ Pendente — Bugs menores (não travam demo)
- Erros engolidos em telas de leitura (consumidor, categorias)
- Inscrição não checa se feira está publicada
- Endpoint morto /api/feiras/barracas
- RLS de assinaturas com bug de coluna (profile_id vs feirante_id)

### 🔴 Pendente — Validação de campo (bloqueia tudo à frente)
- 5 conversas com organizadores em Porto Velho
- Decisiva: como o organizador cobra hoje (mensalidade/rateio)?
- Decisiva: ele topa a vaga depender de pagamento no app?
- Quantas feiras/mês o feirante médio faz (define o R$10)

### Sequência de prioridade
1. Feira (valida o modelo) → 2. Staging + RLS (prepara produção) →
3. Split de pagamento (liga a receita) → 4. Lançamento real.
Cada pendência técnica está travada por uma decisão que só a validação de campo desbloqueia.
