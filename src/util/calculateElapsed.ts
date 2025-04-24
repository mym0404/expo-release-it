import { padZero } from '@mj-studio/js-util';

export function calculateElapsed(t: number) {
  let seconds = Math.floor((Date.now() - t) / 1000);
  const minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  return `${minutes}:${padZero(seconds)}`;
}
