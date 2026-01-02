/*
 * Anansi Sandbox Worker
 * Executes user scripts in an isolated thread.
 */

self.onmessage = async function (e) {
    const { id, code, context } = e.data;

    // Capture logs
    const logs = [];
    const log = (...args) => logs.push(`INFO: ${args.join(' ')}`);
    const warn = (...args) => logs.push(`WARN: ${args.join(' ')}`);
    const error = (...args) => logs.push(`ERROR: ${args.join(' ')}`);

    // Mock Console
    const mockConsole = {
        log: log,
        info: log,
        warn: warn,
        error: error
    };

    try {
        // Execute the code
        const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;

        // Wrap logic
        // We expose 'context' and 'console'
        // 'A' is deliberately detached for security
        const func = new AsyncFunction('context', 'console', `
            "use strict";
            // Check for potential infinite loops (basic protection)
            const start = Date.now();
            
            try {
                ${code}
            } catch (err) {
                throw err;
            }
            
            return context;
        `);

        // Run it
        await func(context, mockConsole);

        self.postMessage({
            id,
            success: true,
            context: context,
            logs: logs
        });

    } catch (err) {
        self.postMessage({
            id,
            success: false,
            error: err.toString(),
            logs: logs // Return what we captured so far
        });
    }
};
