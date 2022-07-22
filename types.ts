import { spawn } from 'child_process';

export interface Dependencies {
    spawn: typeof spawn;
}

export interface Executor {
    run(executablePath: string, args: string[]): Promise<string>;
}

export type Stream = VideoStream | AudioStream;

export type AudioStream = VideoStream & {
    height: string;
    width: string;
}

export interface VideoStream {
    r_frame_rate: string;
    codec_name: string;
    codec_type: string;
    duration: string;
    bit_rate: string;
}

export class ProcessError extends Error {
    public readonly stdout: string;

    public readonly stderr: string;

    constructor(message: string, stderr: string, stdout: string) {
        super(message);
        this.stderr = stderr;
        this.stdout = stdout;
    }
}


export type StreamType = 'video' | 'audio';

