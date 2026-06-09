# Facheiro E-commerce V1

Loja virtual mobile-first em Next.js 15, TypeScript, Tailwind CSS, Supabase, Mercado Pago e Melhor Envio.

## Rodar localmente

```bash
npm install
npm run dev
```

Copie `.env.example` para `.env.local` e preencha as chaves de produção/homologação.

## Banco de dados

Execute `supabase/schema.sql` no SQL editor do Supabase. A vitrine usa dados de demonstração quando as variáveis do Supabase ainda não estão configuradas.

## Admin

Acesse `/admin` e informe o token definido em `FACHEIRO_ADMIN_TOKEN`. O painel permite cadastrar, editar e remover produtos e categorias via API server-side.

## Integrações

- `/api/checkout` cria preferência no Mercado Pago, reserva estoque e salva pedido pendente.
- `/api/webhooks/mercado-pago` atualiza pedidos para pago/cancelado.
- `/api/shipping/quote` consulta fretes no Melhor Envio.
- `/api/shipping/label` prepara a criação de etiqueta para pedidos pagos.

## Produção

Publique na Vercel, configure as variáveis de ambiente, cadastre o webhook do Mercado Pago e use o domínio público em `NEXT_PUBLIC_SITE_URL`.
