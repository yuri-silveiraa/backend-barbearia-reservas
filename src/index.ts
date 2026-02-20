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

const app = express();
const port = 3000;

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
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
