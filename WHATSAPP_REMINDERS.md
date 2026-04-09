# WhatsApp Reminders

Este projeto envia lembretes de agendamento no WhatsApp todos os dias as `07:00` no fuso `America/Sao_Paulo`.

## Como funciona

- O job roda no backend em [`src/index.ts`](/home/yuri/workspace/projetos/douglas-barbearia/src/index.ts).
- Ele busca reservas `SCHEDULED` do dia atual.
- Para cada reserva, envia uma mensagem com nome do cliente, horario e servico.
- Se `WHATSAPP_TEMPLATE_NAME` estiver configurada, o envio usa template aprovado da Meta.
- Se `WHATSAPP_TEMPLATE_NAME` nao estiver configurada, o envio cai para mensagem de texto simples.

## Variaveis de ambiente

Adicione no `.env`:

```env
WHATSAPP_TOKEN=seu_token_da_meta
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_TEMPLATE_NAME=lembrete_agendamento_dia
WHATSAPP_TEMPLATE_LANGUAGE=pt_BR
```

## Recomendacao

Para producao, use **template aprovado** na Meta Cloud API.

Motivo:

- mensagem de template funciona fora da janela de 24h;
- lembrete diario as `07:00` depende disso;
- reduz risco de bloqueio ou rejeicao de envio.

## Template sugerido

Categoria sugerida: `UTILITY`

Nome sugerido:

```text
lembrete_agendamento_dia
```

Idioma:

```text
Portuguese (Brazil) / pt_BR
```

Texto do corpo:

```text
Ola, {{1}}! Lembrete: voce tem um horario hoje as {{2}} para {{3}}. Ate ja!
```

Parametros enviados pelo backend:

1. `{{1}}`: nome do cliente
2. `{{2}}`: horario do agendamento
3. `{{3}}`: nome do servico

## Exemplo real

```text
Ola, Yuri! Lembrete: voce tem um horario hoje as 14:30 para Corte + Barba. Ate ja!
```

## Onde ajustar o envio

- Job diario: [`src/infra/jobs/sendWhatsappReminders.ts`](/home/yuri/workspace/projetos/douglas-barbearia/src/infra/jobs/sendWhatsappReminders.ts)
- Cliente da Meta Cloud API: [`src/infra/whatsapp/whatsappClient.ts`](/home/yuri/workspace/projetos/douglas-barbearia/src/infra/whatsapp/whatsappClient.ts)
- Config de ambiente: [`src/config/env.ts`](/home/yuri/workspace/projetos/douglas-barbearia/src/config/env.ts)

## Criacao do template na Meta

Passos:

1. Entrar no **Meta Business Manager**.
2. Abrir **WhatsApp Manager**.
3. Ir em **Message templates**.
4. Criar um template do tipo `Utility`.
5. Usar o nome `lembrete_agendamento_dia`.
6. Usar o corpo com `{{1}}`, `{{2}}` e `{{3}}`.
7. Esperar a aprovacao.
8. Colocar o nome aprovado em `WHATSAPP_TEMPLATE_NAME`.

## Observacoes

- O backend converte telefone brasileiro de `11912345678` para `5511912345678`.
- O envio ignora numeros invalidos.
- O job nao marca envio no banco. Ele apenas consulta as reservas do dia e envia.
