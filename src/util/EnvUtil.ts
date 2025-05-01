export const isDev = process.env.NODE_ENV === 'development';
export const isWin = process.platform.startsWith('win');
export const isTest = process.env.NODE_ENV === 'test';
