import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jaipur MediConnect API',
      version: '1.0.0',
      description: 'API Documentation for Jaipur MediConnect Medical Application featuring PostgreSQL DB, Gemini AI Triage, 2FA OTP Authentication & Admin Controls.',
      contact: {
        name: 'Jaipur MediConnect Support',
        email: 'support@jaipurmed.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

export const swaggerSpec = swaggerJsdoc(options);
