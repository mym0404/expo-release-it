import { oraPromise } from 'ora';

export async function spinner<T>(text: string, promise: Promise<T>): Promise<T> {
  return oraPromise(promise, {
    text,
    successText: `${text} 성공`,
    failText: `${text} 실패`,
  });
}
