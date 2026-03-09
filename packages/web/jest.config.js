/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    testRegex: '.*\\.spec\\.(ts|tsx)$',
    transform: {
        '^.+\\.(t|j)sx?$': ['ts-jest', {
            tsconfig: 'tsconfig.test.json',
        }],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss)$': '<rootDir>/src/__mocks__/styleMock.ts',
    },
    setupFilesAfterEnv: ['@testing-library/jest-dom'],
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
};
