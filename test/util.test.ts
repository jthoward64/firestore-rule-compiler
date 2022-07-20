import { failWithMessage, log } from "../src/util";

describe(failWithMessage, () => {
  const realProcess = process;
  const exitMock = jest.spyOn(global.process, "exit");
  // @ts-expect-error
  global.process = { ...realProcess, exit: exitMock };

  it("should crash", () => {
    failWithMessage("test");

    expect(exitMock).toHaveBeenCalledWith(1);
  });

  exitMock.mockRestore();
});

declare global {
  var debugMode: boolean;
}

describe(log, () => {
  const consoleLogMock = jest.spyOn(global.console, 'log');
  const consoleWarnMock = jest.spyOn(global.console, 'warn');
  const consoleErrorMock = jest.spyOn(global.console, 'error');

  beforeAll(() => {
    // @ts-expect-error
    global.console = { ...global.console, log: consoleLogMock, warn: consoleWarnMock, error: consoleErrorMock };
  });

  afterEach(() => {
    consoleLogMock.mockClear();
    consoleWarnMock.mockClear();
    consoleErrorMock.mockClear();
  });

  afterAll(() => {
    globalThis.debugMode = false;

    consoleLogMock.mockRestore();
    consoleWarnMock.mockRestore();
    consoleErrorMock.mockRestore();
  });

  it("should do nothing when debugMode is falsy", () => {
    log("test");

    expect(consoleLogMock).not.toHaveBeenCalled();
  });

  it("should log with no args", () => {
    globalThis.debugMode = true;

    log("test", undefined);

    expect(consoleLogMock).toHaveBeenCalledWith("test");
    expect(consoleLogMock).toHaveBeenCalledTimes(1);
  });

  it("should log when passed 'log'", () => {
    globalThis.debugMode = true;

    log("test", "log");

    expect(consoleLogMock).toHaveBeenCalledWith("test");
    expect(consoleLogMock).toHaveBeenCalledTimes(1);
  });

  it("should warn when passed 'warn'", () => {
    globalThis.debugMode = true;

    log("test", "warn");

    expect(consoleWarnMock).toHaveBeenCalledWith("test");
    expect(consoleWarnMock).toHaveBeenCalledTimes(1);
  });

  it("should error when passed 'error'", () => {
    globalThis.debugMode = true;

    log("test", "error");

    expect(consoleErrorMock).toHaveBeenCalledWith("test");
    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
  });
});