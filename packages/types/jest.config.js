module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        isolateCoverage: true,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/validation/email.ts',
    'src/validation/user.ts',
    'src/validation/auth.ts',
    'src/validation/helpers.ts',
    'src/schemas/email.ts',
    'src/schemas/user.ts',
    'src/schemas/auth.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: [],
  coverageProvider: 'v8',
  collectCoverage: true,
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@vohrad/types$': '<rootDir>/src/index.ts',
    '^@vohrad/types/schemas$': '<rootDir>/src/schemas/index.ts',
  },
};
