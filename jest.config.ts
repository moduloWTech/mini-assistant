import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};

export default config;
