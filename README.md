# HealthRadarNJ
CS546 Final Project

Ayushi ( current update)
I have created the folder structure, completed the Authentication Module for our HealthRadar NJ project.
The backend is now connected to MongoDB, and supports a complete login/signup workflow with sessions.

Current Folder structure

HealthRadar-NJ/
│── app.js
│── package.json
│── .gitignore
│── config/
│   ├── mongoConnection.js
│   ├── mongoCollections.js
│   └── settings.js
│
│── data/
│   ├── users.js        
│   └── index.js
│
│── routes/
│   ├── auth.js (Signup, Login, Logout, Auth-protected routes)
│   └── index.js
│
│── middleware/
│   └── authMiddleware.js  (Protects routes using sessions)
│
│── views/ (currently Empty)
│   
└── public/ (currently Empty)
