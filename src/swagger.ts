import swaggerAutogen from "swagger-autogen";

const doc = {
  openapi: "3.0.0",
  info: {
    title: "API Barbearia",
    description: "Documentação da API",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor Local",
    },
  ],
  tags:[

  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = [
  "./src/infra/http/routes/userRoutes.ts",
  "./src/infra/http/routes/appointmentRoutes.ts", 
  "./src/infra/http/routes/barberRoutes.ts", 
  "./src/infra/http/routes/serviceRoutes.ts", 
  "./src/infra/http/routes/timeRoutes.ts",];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
