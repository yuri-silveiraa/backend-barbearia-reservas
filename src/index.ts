import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from './infra/http/middlewares/errorHandler';
import { userRoutes } from './infra/http/routes/userRoutes';
import { appointmentRoute } from './infra/http/routes/appointmentRoutes';
import { timeRoutes } from './infra/http/routes/timeRoutes';
import { serviceRoutes } from './infra/http/routes/serviceRoutes';
import cors from "cors";
import { barberRoutes } from './infra/http/routes/barberRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerFile from "./swagger-output.json";
import { env } from './config/env';
import { csrfMiddleware, generateCsrfToken } from './infra/http/helpers/csrf';
import { prisma } from './infra/database/prisma/prismaClient';
import cron from "node-cron";
import { sendDailyWhatsappReminders } from "./infra/jobs/sendWhatsappReminders";

const app = express();
const port = env.port;

app.set("trust proxy", 1);

app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "x-csrf-token"],
  credentials: true
}));

app.use(cookieParser());

app.use(express.json());

app.get('/csrf-token', (req, res) => {
  const token = generateCsrfToken(res);
  res.json({ csrfToken: token });
});

app.use(csrfMiddleware);

app.use('/user', userRoutes);
app.use('/appointment', appointmentRoute);
app.use('/time', timeRoutes);
app.use('/service', serviceRoutes);
app.use('/barber', barberRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(errorHandler);
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

async function cleanupUnverifiedUsers() {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 24);

  try {
    await prisma.client.deleteMany({
      where: {
        user: {
          emailVerified: false,
          provider: null,
          createdAt: { lt: cutoff },
        },
      },
    });

    const result = await prisma.user.deleteMany({
      where: {
        emailVerified: false,
        provider: null,
        createdAt: { lt: cutoff },
      },
    });
    if (result.count > 0) {
      console.log(`Removed ${result.count} unverified users`);
    }
  } catch (error) {
    console.error("Failed to cleanup unverified users", error);
  }
}

cleanupUnverifiedUsers();
setInterval(cleanupUnverifiedUsers, 6 * 60 * 60 * 1000);

cron.schedule(
  "0 7 * * *",
  () => {
    sendDailyWhatsappReminders().catch((error) =>
      console.error("Falha ao enviar lembretes WhatsApp", error)
    );
  },
  { timezone: "America/Sao_Paulo" }
);
