// client/src/setupTests.js
import '@testing-library/jest-dom/extend-expect';

jest.mock('./contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    currentUser: {
      uid: 'globalMockUser',
      email: 'global@example.com',
      emailVerified: true
    },
    isAdmin: false,
    isApproved: false,
    handleLogin: jest.fn()
  }))
}));
