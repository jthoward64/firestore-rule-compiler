export function failWithMessage(message: string): never {
  // @ts-ignore
  if (global.debug) {
    console.trace();
  }
  console.error(message);
  process.exit(1);
}