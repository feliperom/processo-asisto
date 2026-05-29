# Asisto — Processo Seletivo

Aplicação Next.js com:

- Formulário de candidatura (mesma identidade visual do original).
- Persistência das respostas no **Neon Postgres** via Drizzle ORM.
- Painel administrativo protegido por senha com listagem e detalhe.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript estrito
- Drizzle ORM + `@neondatabase/serverless`
- Cookie de sessão assinado com HMAC para o painel

## Setup

1. **Instalar dependências**

   ```bash
   cd app-next
   npm install
   ```

2. **Configurar variáveis de ambiente** — copie `.env.example` para `.env.local` e preencha:

   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require"
   ADMIN_PASSWORD="uma-senha-forte"
   ADMIN_SESSION_SECRET="qualquer-string-aleatoria-longa"
   ```

3. **Criar tabela no Neon** — escolha uma das opções:

   - Aplicar a migração pronta:

     ```bash
     psql "$DATABASE_URL" -f drizzle/0000_init.sql
     ```

   - Ou sincronizar direto pelo schema do Drizzle:

     ```bash
     npm run db:push
     ```

4. **Rodar em dev**

   ```bash
   npm run dev
   ```

## Rotas

| Rota | Descrição |
| --- | --- |
| `/` | Formulário público |
| `POST /api/submit` | Recebe respostas e grava no banco |
| `/admin` | Tela de login do painel |
| `/admin/dashboard` | Listagem de candidaturas (autenticado) |
| `/admin/dashboard/[id]` | Detalhe de uma candidatura (autenticado) |
| `POST /api/admin/login` | Autentica e cria sessão |
| `POST /api/admin/logout` | Destrói sessão |

## Modelo de dados

Tabela `applications`:

| Coluna | Tipo | Observação |
| --- | --- | --- |
| `id` | uuid | gerado automaticamente |
| `created_at` | timestamptz | default `now()` |
| `full_name` | text | extraído da pergunta 1 |
| `age`, `city`, `whatsapp`, `salary_expectation` | text | extraídos das perguntas 2, 3, 4 e 16 |
| `answers` | jsonb | array completo das 16 perguntas (id, pergunta, resposta formatada e valor bruto) |

Manter `answers` como JSONB preserva o histórico mesmo se o questionário mudar — as colunas extras servem apenas para a listagem rápida.

## Segurança

- A senha do painel é comparada com `timingSafeEqual` para evitar timing attacks.
- O cookie de sessão é assinado com HMAC-SHA256 e expira em 8 horas.
- Em produção o cookie é marcado `secure`.

Para um cenário com vários recrutadores, troque a sessão única por usuários individuais e (idealmente) bcrypt em vez de senha em texto puro.
