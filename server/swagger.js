/**
 * Simple OpenAPI 3 spec for Quizda server endpoints.
 * This file is required by `server/index.js` when `swagger-ui-express` is available.
 */
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Quizda API',
    version: '0.1.0',
    description: 'API documentation for Quizda (sample and dev endpoints)'
  },
  servers: [
    { url: 'http://localhost:4000', description: 'Local dev server' },
    { url: 'https://quizda-worker-prod.b-jairam0512.workers.dev', description: 'Deployed Worker (example)' }
  ],
  components: {
    schemas: {
      Health: {
        type: 'object',
        properties: { status: { type: 'string' }, name: { type: 'string' } }
      },
      Question: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          text: { type: 'string' },
          choices: { type: 'array', items: { type: 'string' } },
          answerIndex: { type: 'integer', format: 'int32' }
        },
        required: ['id', 'text', 'choices']
      },
      Quiz: {
        type: 'object',
        properties: {
          id: { type: 'integer', format: 'int32' },
          title: { type: 'string' },
          category: { type: 'string' },
          subcategory: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          totalTimeMinutes: { type: 'integer', format: 'int32' },
          questionsCount: { type: 'integer', format: 'int32' },
          questions: { type: 'array', items: { $ref: '#/components/schemas/Question' } }
        }
      },
      RegisterRequest: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' },
          role: { type: 'string' }
        },
        required: ['username', 'email', 'password']
      },
      LoginRequest: {
        type: 'object',
        properties: { username: { type: 'string' }, password: { type: 'string' } },
        required: ['username', 'password']
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          token: { type: 'string' },
          user: { type: 'object' }
        }
      }
    }
  },
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check',
        responses: { '200': { description: 'API is healthy', content: { 'application/json': { schema: { $ref: '#/components/schemas/Health' } } } } }
      }
    },
    '/api/quizzes': {
      get: {
        summary: 'Get sample quizzes',
        responses: {
          '200': {
            description: 'A list of quizzes',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Quiz' } }
              }
            }
          }
        }
      }
    },
    '/api/register': {
      post: {
        summary: 'Register a new user (demo)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: { type: 'object' } } } },
          '400': { description: 'Bad Request' },
          '409': { description: 'Conflict (username or email exists)' }
        }
      }
    },
    '/api/login': {
      post: {
        summary: 'Login (demo)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '400': { description: 'Bad Request' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/api/forgot-password': {
      post: {
        summary: 'Request password reset (mock)',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' } } } } } },
        responses: { '200': { description: 'Email processed (mock)' }, '400': { description: 'Bad Request' } }
      }
    },
    '/api/migrate': {
      post: {
        summary: 'Trigger migrations (dev-only)',
        responses: { '200': { description: 'Migration started' }, '500': { description: 'Migration error' }, '501': { description: 'Not available in this runtime' } }
      }
    }
  }
}

module.exports = swaggerSpec

