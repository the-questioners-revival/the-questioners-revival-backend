// Asynchronous delay function
export function myDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
