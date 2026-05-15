/**
 * Nova Diagnostics — Lightweight stability layer
 * Opt-in via NOVA_DIAGNOSTICS=true
 */

const isEnabled = () => process.env.NOVA_DIAGNOSTICS === 'true';

let stallDetectorInterval = null;
let lastLoopTime = Date.now();
let stallDetectorUnref = null;

/**
 * Wraps an async function with a hard timeout + AbortController support.
 * The wrapped function receives an object with `signal` as the last argument.
 */
function withTimeout(fn, ms, label = 'operation') {
  return async (...args) => {
    if (!isEnabled()) return fn(...args);

    const controller = new AbortController();
    const start = Date.now();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, ms);

    try {
      // Pass signal as last argument
      const result = await fn(...args, { signal: controller.signal });

      const duration = Date.now() - start;
      if (duration > 2000) {
        console.log(`[DIAG] ${label} took ${duration}ms`);
      }
      return result;

    } catch (err) {
      if (err.name === 'AbortError' || controller.signal.aborted) {
        const timeoutErr = new Error(`[DIAG] ${label} timed out after ${ms}ms`);
        timeoutErr.code = 'TIMEOUT';
        console.error(timeoutErr.message);
        throw timeoutErr;
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  };
}

/**
 * Measures and logs execution time of an async function.
 */
async function timeAsync(label, fn) {
  if (!isEnabled()) return fn();

  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    console.log(`[DIAG] ${label}: ${duration}ms`);
    return result;
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`[DIAG] ${label} failed after ${duration}ms: ${err.message}`);
    throw err;
  }
}

/**
 * Starts a lightweight event loop stall detector.
 */
function startStallDetector(intervalMs = 5000, thresholdMs = 3000) {
  if (!isEnabled()) return () => {};
  if (stallDetectorInterval) return () => stopStallDetector();

  stallDetectorInterval = setInterval(() => {
    const now = Date.now();
    const delta = now - lastLoopTime;

    if (delta > thresholdMs) {
      console.warn(`[DIAG] Event loop stall detected: ${delta}ms`);
    }

    lastLoopTime = now;
  }, intervalMs);

  if (stallDetectorInterval.unref) {
    stallDetectorInterval.unref();
  }

  return stopStallDetector;
}

function stopStallDetector() {
  if (stallDetectorInterval) {
    clearInterval(stallDetectorInterval);
    stallDetectorInterval = null;
  }
}

function logContextSize(label, size, durationMs) {
  if (!isEnabled()) return;
  console.log(`[DIAG] Context: ${label} → ${size} tokens (${durationMs}ms)`);
}

function logDocLoadTime(docName, startTime) {
  if (!isEnabled()) return;
  const duration = Date.now() - startTime;
  console.log(`[DIAG] Doc load: ${docName} (${duration}ms)`);
}

module.exports = {
  withTimeout,
  timeAsync,
  startStallDetector,
  stopStallDetector,
  logContextSize,
  logDocLoadTime,
  isEnabled
};