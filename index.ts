import alfy from 'alfy';
import { spawn } from 'child_process'

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

function createExecutor(dependencies: Dependencies): Executor {
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

const runner = createExecutor({ spawn })
const ffprobePath = '/usr/local/bin/ffprobe';
const args = [
    '-hide_banner',
    '-show_error',
    '-show_entries',
    'stream=duration,r_frame_rate,codec_name,codec_type,width,height,bit_rate',
    '-v',
    'quiet',
    '-of',
    'json',
    '-i',
    alfy.input
];


const isAudioStream = (stream: Stream): stream is AudioStream => {
    return stream.hasOwnProperty('width');
}

const buildStreamInfo = (stream: Stream) => {
    let resolution = ''
    if(isAudioStream(stream)){
        resolution = stream.width ? ` | ${stream.width}x${stream.height}` : '';
    }
    const duration = stream.duration ? ` | ${parseFloat(stream.duration).toFixed(4)}s` : '';
    const framerate = stream.r_frame_rate && eval(stream.r_frame_rate) ? ` | ${parseFloat(eval(stream.r_frame_rate)).toFixed(2)}fps` : '';
    const bitrate = stream.bit_rate ? ` | ${(parseFloat(stream.bit_rate) / 1024 / 1024).toFixed(2)}Mbps` : '';
    return `[${stream.codec_type.toUpperCase()}]: ${stream.codec_name}${bitrate}${resolution}${duration}${framerate}`;
}

const getStreamCount = (streams: Stream[]) => (streamType: StreamType) => {
    return streams.filter(stream => stream.codec_type === streamType).length
}

const main = async (): Promise<void> => {
    const output = await runner.run(ffprobePath, args)

    const streams = JSON.parse(output).streams as Stream[]
    // console.log(streams)

    let audioCount = 0;
    let videoCount = 0;

    const countStreams = getStreamCount(streams);
    const numberOfVideoStream = countStreams('video');
    const numberOfAudioStreams = countStreams('audio')

    alfy.output(streams.map((stream) => {
        let count = 0;
        let subtitle = '';

        if (stream.codec_type === 'video') {
            count = ++videoCount;
            subtitle = `${count} of ${numberOfVideoStream} video track(s)`;
        }
        if (stream.codec_type === 'audio') {
            count = ++audioCount;
            subtitle = `${count} of ${numberOfAudioStreams} audio track(s)`;
        }

        return {
            title: buildStreamInfo(stream),
            subtitle
        }
    }));
}


main();

