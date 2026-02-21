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

const app = express();
const port = env.port;

app.set("trust proxy", 1);

const allowedLocalOrigins = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const isAllowed = allowedLocalOrigins.some((pattern) => pattern.test(origin));
    if (isAllowed) return callback(null, true);

    return callback(new Error("Origin não permitida pelo CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

app.use(cookieParser());

app.use(express.json());

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
