import express from 'express';
import { errorHandler } from './infra/http/middlewares/errorHandler';
import { userRoutes } from './infra/http/routes/userRoutes';
import dotenv from 'dotenv';
import { appointmentRoute } from './infra/http/routes/appointmentRoutes';
import { timeRoutes } from './infra/http/routes/timeRoutes';
import { serviceRoutes } from './infra/http/routes/serviceRoutes';
import cors from "cors";

dotenv.config();

const app = express();
const port = 3000;

app.use(cors({
  origin: "http://localhost:5173", // URL do seu front
  credentials: true,
}));

app.use(express.json());

app.use('/user', userRoutes);
app.use('/appointment', appointmentRoute);
app.use('/time', timeRoutes);
app.use('/service', serviceRoutes);

app.use(errorHandler);
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
