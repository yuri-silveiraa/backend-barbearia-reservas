# API Barbearia - Documentação para Frontend

## 📋 Visão Geral

Esta API fornece endpoints para gerenciamento de uma barbearia, incluindo:
- Autenticação de usuários (clientes e barbeiros)
- Agendamento de serviços
- Gerenciamento de barbeiros
- Controle de horários disponíveis
- Gerenciamento de serviços

---

## 🔐 Autenticação

A API utiliza **cookies HttpOnly** para autenticação. Isso significa:

- ✅ Mais seguro que localStorage (proteção contra XSS)
- ✅ O cookie é enviado automaticamente em todas as requisições
- ✅ Não é necessário gerenciar tokens manualmente

### Fluxo de Autenticação

```javascript
// 1. Login
const response = await fetch('http://localhost:3000/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include' // IMPORTANTE: inclui cookies
});

// 2. Requisições subsequentes
const response = await fetch('http://localhost:3000/user/me', {
  credentials: 'include' // Cookie é enviado automaticamente
});

// 3. Logout
await fetch('http://localhost:3000/user/logout', {
  method: 'POST',
  credentials: 'include'
});
```

---

## 📚 Documentação Swagger

Acesse a documentação completa em:
- **Desenvolvimento**: http://localhost:3000/api-docs

---

## 🎯 Fluxo de Uso Recomendado

### Para Clientes

1. **Registro**
```http
POST /user/create
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "type": "CLIENT",
  "telephone": "11999999999"
}
```

2. **Login**
```http
POST /user/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "password": "senha123"
}
```

3. **Listar Barbeiros**
```http
GET /barber
```

4. **Ver Horários Disponíveis**
```http
GET /time/{barberId}
```

5. **Listar Serviços**
```http
GET /service
```

6. **Criar Agendamento**
```http
POST /appointment/create
Content-Type: application/json
Cookie: token=eyJhbGciOiJIUzI1NiIs...

{
  "barberId": "uuid-do-barbeiro",
  "serviceId": "uuid-do-servico",
  "timeId": "uuid-do-horario"
}
```

7. **Ver Meus Agendamentos**
```http
GET /appointment/client-appointments
Cookie: token=eyJhbGciOiJIUzI1NiIs...
```

8. **Cancelar Agendamento**
```http
PATCH /appointment/cancel/{appointmentId}
Cookie: token=eyJhbGciOiJIUzI1NiIs...
```

---

### Para Barbeiros

1. **Ver Agendamentos do Dia**
```http
GET /barber/today-appointments
Cookie: token=eyJhbGciOiJIUzI1NiIs...
```

2. **Ver Estatísticas do Dia**
```http
GET /barber/daily-stats
Cookie: token=eyJhbGciOiJIUzI1NiIs...
```

Resposta:
```json
{
  "completedCount": 5,
  "scheduledCount": 3,
  "totalRevenue": 250.00
}
```

3. **Marcar como Atendido**
```http
PATCH /appointment/attend/{appointmentId}
Cookie: token=eyJhbGciOiJIUzI1NiIs...
```

4. **Criar Horários Disponíveis**
```http
POST /time/create
Content-Type: application/json
Cookie: token=eyJhbGciOiJIUzI1NiIs...

{
  "date": "2024-12-25T10:00:00Z"
}
```

---

### Para Administradores

1. **Criar Novo Barbeiro**
```http
POST /barber
Content-Type: application/json
Cookie: token=eyJhbGciOiJIUzI1NiIs...

{
  "name": "Carlos Barbeiro",
  "email": "carlos@barbearia.com",
  "password": "senha123",
  "isAdmin": false
}
```

2. **Desativar Barbeiro**
```http
DELETE /barber/{userId}
Cookie: token=eyJhbGciOiJIUzI1NiIs...
```

3. **Criar Serviço**
```http
POST /service/create
Content-Type: application/json
Cookie: token=eyJhbGciOiJIUzI1NiIs...

{
  "name": "Corte Tradicional",
  "price": 35.00,
  "description": "Corte masculino tradicional"
}
```

---

## ⚠️ Regras de Negócio

### Agendamentos
- **Limite**: Cada cliente pode ter no máximo **1 agendamento por semana**
- **Cancelamento**: Apenas o próprio cliente pode cancelar seu agendamento
- **Atendimento**: Apenas o barbeiro responsável pode marcar como atendido

### Tipos de Usuário
- `CLIENT`: Cliente comum - pode agendar e cancelar
- `BARBER`: Barbeiro - pode criar horários e atender clientes
- `ADMIN`: Administrador - pode criar barbeiros e serviços

---

## 🔧 Configuração CORS

O frontend deve configurar o CORS corretamente:

```javascript
// Exemplo com fetch
fetch('http://localhost:3000/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
  credentials: 'include' // ESSENCIAL para cookies
});

// Exemplo com axios
axios.post('http://localhost:3000/user/login', data, {
  withCredentials: true // ESSENCIAL para cookies
});
```

---

## 📊 Status de Agendamentos

| Status | Descrição |
|--------|-----------|
| `SCHEDULED` | Agendado, aguardando atendimento |
| `COMPLETED` | Atendimento concluído |
| `CANCELED` | Agendamento cancelado |

---

## 🚀 Endpoints Públicos

Estes endpoints não requerem autenticação:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/barber` | Lista todos os barbeiros |
| GET | `/service` | Lista todos os serviços |
| GET | `/time/{barberId}` | Lista horários de um barbeiro |
| POST | `/user/create` | Registra novo usuário |
| POST | `/user/login` | Realiza login |

---

## 🔒 Endpoints Protegidos

Requerem cookie de autenticação:

### Cliente
- `GET /user/me` - Dados do usuário logado
- `GET /appointment/client-appointments` - Meus agendamentos
- `POST /appointment/create` - Criar agendamento
- `PATCH /appointment/cancel/{id}` - Cancelar agendamento

### Barbeiro
- `GET /barber/today-appointments` - Agendamentos do dia
- `GET /barber/daily-stats` - Estatísticas do dia
- `PATCH /appointment/attend/{id}` - Marcar como atendido
- `POST /time/create` - Criar horário disponível

### Administrador
- `POST /barber` - Criar barbeiro
- `DELETE /barber/{id}` - Desativar barbeiro
- `POST /service/create` - Criar serviço

---

## 📝 Schemas de Request

### CreateUser
```typescript
{
  name: string;        // min 3 caracteres
  email: string;       // email válido
  password: string;    // min 6 caracteres
  type: "CLIENT" | "BARBER";
  telephone?: string;  // min 11 caracteres
}
```

### Login
```typescript
{
  email: string;
  password: string;
}
```

### CreateAppointment
```typescript
{
  barberId: string;   // UUID
  serviceId: string;  // UUID
  timeId: string;     // UUID
}
```

### CreateService
```typescript
{
  name: string;        // min 2 caracteres
  price: number;       // min 0
  description?: string;
}
```

### CreateTime
```typescript
{
  date: string;  // ISO 8601 format
}
```

### CreateBarber
```typescript
{
  name: string;        // min 3 caracteres
  email: string;       // email válido
  password: string;    // min 6 caracteres
  isAdmin?: boolean;   // default: false
}
```

---

## 🐛 Tratamento de Erros

Todos os erros seguem o padrão:

```json
{
  "message": "Descrição do erro"
}
```

### Códigos HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 409 | Conflito (ex: email já existe) |
| 500 | Erro interno do servidor |

---

## 💡 Dicas para o Frontend

1. **Sempre use `credentials: 'include'`** (fetch) ou `withCredentials: true` (axios)

2. **Configure CORS no frontend**:
   ```javascript
   // Next.js / React
   const response = await fetch('http://localhost:3000/...', {
     credentials: 'include'
   });
   ```

3. **Verifique autenticação ao carregar a página**:
   ```javascript
   useEffect(() => {
     fetch('http://localhost:3000/user/me', {
       credentials: 'include'
     })
       .then(res => res.json())
       .then(user => setUser(user))
       .catch(() => setUser(null));
   }, []);
   ```

4. **Trate erros de autenticação**:
   ```javascript
   if (response.status === 401) {
     // Redirecionar para login
   }
   ```

---

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação Swagger em `/api-docs`.
