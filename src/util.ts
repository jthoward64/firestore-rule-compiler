export function failWithMessage(message: string): never {
  //@ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
  if (global.debug) {
    console.trace();
  }
  console.error(message);
  process.exit(1);
}