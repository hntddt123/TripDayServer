import { Router } from 'express';

const tripRouter = Router();

tripRouter.get('/trip', (req, res) => {
  // Trip
  //   .find()
  //   .sort({ createdOn: 1 })
  //   .exec()
  //   .then((docs) => {
  //     res.status(200).json(docs)
  //   })
  //   .catch((error) => res.status(500).json({
  //     message: "Error finding trip",
  //     error: error
  //   }));
});

tripRouter.post('/trip', (req, res) => {
  // const trip = new Trip(req.body);

  // trip.save((err, newTrip) => {
  //   if (err) {
  //     return res.status(400).json(err);
  //   }
  //   return res.status(200).json(newTrip);
  // });
});

export default tripRouter;
