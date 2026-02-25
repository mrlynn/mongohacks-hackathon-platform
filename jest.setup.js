import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/hackathons-test'
process.env.AUTH_SECRET = 'test-secret-key-for-testing-only'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
