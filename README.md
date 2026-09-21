# Roll

Projeto [Next.js](https://nextjs.org) com [Supabase](https://supabase.com) como base de dados.

## Requisitos

- Node.js

A Supabase CLI já está incluída nas dependências do projeto e é usada através de `npx supabase`.

## Configuração

1. Instalar as dependências:

```bash
npm install
```

2. Criar o ficheiro `.env.local` com base no `.env.example` e preencher os valores.

## Correr o projeto

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) no browser.

## Base de dados

O projeto já está ligado ao projeto remoto Supabase. Para autenticar a CLI:

```bash
npx supabase login
```

### Migrations

As migrations estão em `supabase/migrations`. Para as aplicar no projeto remoto:

```bash
npx supabase db push
```

### Seeds

Os dados de seed estão em `supabase/seed.sql`.

**Atenção:** o comando abaixo apaga todos os dados da base de dados remota antes de aplicar as migrations e o seed. Só usar se for isso mesmo que se pretende.

```bash
npx supabase db reset --linked
```
