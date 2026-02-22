import swaggerAutogen from "swagger-autogen";

const doc = {
  openapi: "3.0.0",
  info: {
    title: "API Barbearia - Sistema de Reservas",
    description: "API completa para gerenciamento de barbearia com sistema de reservas, controle de barbeiros e clientes.\n\n## Autenticação\n\nEsta API utiliza **cookies HttpOnly** para autenticação. Após o login, um cookie `token` é enviado automaticamente e deve ser incluído nas requisições subsequentes.\n\n## Fluxo de Uso\n\n1. Registre-se como cliente em `/user/create`\n2. Faça login em `/user/login` para obter o cookie de autenticação\n3. Liste barbeiros em `/barber`\n4. Liste horários disponíveis em `/time/{barberId}`\n5. Liste serviços em `/service`\n6. Crie um agendamento em `/appointment/create`",
    version: "1.0.0",
    contact: {
      name: "Suporte",
      email: "contato@barbearia.com"
    }
  },
  servers: [
    {
      "url": "http://localhost:3000",
      "description": "Servidor de Desenvolvimento"
    },
    {
      "url": "https://api.barbearia.com",
      "description": "Servidor de Produção"
    }
  ],
  tags: [
    {
      name: "Autenticação",
      description: "Endpoints para registro e autenticação de usuários"
    },
    {
      name: "Agendamentos",
      description: "Endpoints para gerenciamento de agendamentos (reservas)"
    },
    {
      name: "Barbeiros",
      description: "Endpoints para gerenciamento de barbeiros"
    },
    {
      name: "Serviços",
      description: "Endpoints para listagem e criação de serviços"
    },
    {
      name: "Horários",
      description: "Endpoints para gerenciamento de horários disponíveis"
    }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "Autenticação via cookie HttpOnly contendo o token JWT. O cookie é enviado automaticamente após o login."
      }
    }
  }
};

const outputFile = "./swagger-output.json";
const endpointsFiles = [
  "./src/infra/http/routes/userRoutes.ts",
  "./src/infra/http/routes/appointmentRoutes.ts", 
  "./src/infra/http/routes/barberRoutes.ts", 
  "./src/infra/http/routes/serviceRoutes.ts", 
  "./src/infra/http/routes/timeRoutes.ts",
];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
