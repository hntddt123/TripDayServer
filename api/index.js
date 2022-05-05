import { Router } from 'express';
import tripRoute from './routes/trip';

const apiRouter = Router();

apiRouter.use(tripRoute);

export default apiRouter;
