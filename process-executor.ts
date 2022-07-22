import { Dependencies, Executor, ProcessError } from "./types.js";

export const createExecutor = (dependencies: Dependencies): Executor => {
    const { spawn } = dependencies;

    return {
        async run(executablePath, args) {
            return new Promise((resolve, reject) => {

                const errorOutput: string[] = [];
                const output: string[] = [];
                const process = spawn(executablePath, args);

                process.once('error', reject);
                process.stdout.on('data', (data) => {
                    output.push(data.toString('utf8'));
                });
                process.stderr.on('data', (data) => {
                    errorOutput.push(data.toString('utf8'));
                });
                process.once('exit', (code) => {
                    if (code !== 0) {
                        const message = `Error in Process ${executablePath}. Exit code: ${code}`;
                        const error = new ProcessError(message, errorOutput.join(''), output.join(''));
                        reject(error);
                    } else {
                        resolve(output.join(''));
                    }
                });
            });
        }
    };
}
