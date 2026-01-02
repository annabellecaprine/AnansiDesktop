/*
 * Anansi Core: Sandbox
 * File: js/core/sandbox.js
 * Purpose: Main thread wrapper for the Worker-based script sandbox.
 */

(function (A) {
    'use strict';

    class Sandbox {
        constructor() {
            this.worker = null;
            this.pending = new Map();
            this.init();
        }

        init() {
            if (this.worker) this.worker.terminate();

            // Determine path to worker
            // Tauri/Standard path handling
            const path = 'js/core/sandbox.worker.js';
            this.worker = new Worker(path);

            this.worker.onmessage = (e) => {
                const { id, success, context, logs, error } = e.data;
                const promise = this.pending.get(id);

                if (promise) {
                    if (success) {
                        promise.resolve({ context, logs });
                    } else {
                        promise.reject({ error: new Error(error), logs });
                    }
                    this.pending.delete(id);
                }
            };

            this.worker.onerror = (err) => {
                console.error('[Sandbox] Worker Error:', err);
            };
        }

        /**
         * Execute a script in the sandbox
         * @param {string} code - The JavaScript code to run
         * @param {Object} context - The state/context object to pass in
         * @param {number} timeout - Max execution time in ms
         */
        async run(code, context = {}, timeout = 5000) {
            const id = Math.random().toString(36).substr(2, 9);

            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    if (this.pending.has(id)) {
                        this.pending.delete(id);
                        // Re-init worker to kill the hung process
                        this.init();
                        reject(new Error('Script execution timed out'));
                    }
                }, timeout);

                this.pending.set(id, {
                    resolve: (val) => { clearTimeout(timer); resolve(val); },
                    reject: (err) => { clearTimeout(timer); reject(err); }
                });

                // Clone context to avoid "DataCloneError" on non-transferables
                // Simple JSON clone for now, or structuredClone if available
                let safeContext;
                try {
                    safeContext = JSON.parse(JSON.stringify(context));
                } catch (e) {
                    safeContext = context; // Hope for the best or handle partials
                }

                this.worker.postMessage({ id, code, context: safeContext });
            });
        }
    }

    A.Sandbox = new Sandbox();

})(window.Anansi);
