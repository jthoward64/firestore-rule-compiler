export function failWithMessage(message: string): never {
  if (globalThis.debugMode) {
    console.trace();
  }
  console.error(message);
  global.process.exit(1);
}

export function log(message: string, level: "error" | "warn" | "log" = "log"): void {
  if (globalThis.debugMode) {
    global.console[level](message);
  }
}