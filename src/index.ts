import express from 'express';
import { errorHandler } from './infra/http/middlewares/errorHandler';
import { userRoutes } from './infra/http/routes/userRoutes';
import dotenv from 'dotenv';
import { appointmentRoute } from './infra/http/routes/appointmentRoutes';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

app.use('/user', userRoutes);
app.use('/appointment', appointmentRoute);

app.use(errorHandler);
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
