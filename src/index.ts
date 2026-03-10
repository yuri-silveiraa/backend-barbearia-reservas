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

const app = express();
const port = env.port;

app.set("trust proxy", 1);

app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
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
