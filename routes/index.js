import authRoutes from './auth.js';
import facilitiesRoutes from './facilities.js';
import emergencyRoutes from "./emergency.js";

const constructorMethod = (app) => {
  app.use('/auth', authRoutes);  
  app.use('/facilities', facilitiesRoutes); 
  app.use("/emergency", emergencyRoutes);


  app.get('/', (req, res) => {
    res.render('home', {
      title: 'HealthRadar NJ',
      user: req.session.user || null,
    });
  });

 
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
};

export default constructorMethod;
