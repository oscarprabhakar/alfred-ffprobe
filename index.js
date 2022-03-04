import alfy from 'alfy';
import { spawn } from 'child_process'

function createExecutor(dependencies){
    const { spawn } = dependencies;

    return {
        async run(executablePath, args) {
            return new Promise((resolve, reject) => {

                const errorOutput = [];
                const output = [];
                const process = spawn(executablePath, args);

                process.once('error', reject);
                process.stdout.on('data', (data)=> {
                    output.push(data.toString('utf8'));
                });
                process.stderr.on('data', (data)=> {
                    errorOutput.push(data.toString('utf8'));
                });
                process.once('exit', (code)=> {
                    if (code !== 0) {
                        const message = `Error in Process ${executablePath}. Exit code: ${code}`;
                        const error = new ChildProcessError(message, errorOutput.join(''), output.join(''));
                        reject(error);
                    } else {
                        resolve(output.join(''));
                    }
                });
            });
        }
    };
}

const runner = createExecutor({spawn})
const ffprobePath = '/usr/local/bin/ffprobe';
const args = [
    '-hide_banner',
    '-show_error',
    '-show_entries',
    'stream=duration,r_frame_rate,codec_name,codec_type,width,height,bitrate',
    '-v',
    'quiet',
    '-of',
    'json',
    '-i',
    alfy.input
];


const output =  await runner.run(ffprobePath, args)

const buildStreamInfo = (stream) => {
    const resolution = stream.width ? ` | ${stream.width}x${stream.height}` : ''
    const duration = stream.duration? ` | ${parseFloat(stream.duration).toFixed(4)}s` : ''
    const framerate = stream.r_frame_rate  && eval(stream.r_frame_rate) ? ` | ${parseFloat(eval(stream.r_frame_rate)).toFixed(2)}fps`: ''
    return `[${stream.codec_type.toUpperCase()}]: ${stream.codec_name}${resolution}${duration}${framerate}`
}

const streams = JSON.parse(output).streams
// console.log(streams)

let audioCount = 0;
let videoCount = 0;

const getTotal = (streams)=>(streamType) => {
    return streams.filter(stream => stream.codec_type === streamType).length
}

const totalOf = getTotal(streams);
const totalVideo = totalOf('video');
const totalAudio = totalOf('audio')

alfy.output(streams.map((stream) => {
    let count = 0;
    let subtitle = '';

    if(stream.codec_type === 'video') { 
        count = ++videoCount;
        subtitle = `${count} of ${totalVideo} video track(s)`;
    }
    if(stream.codec_type === 'audio' ){ 
        count = ++audioCount;
        subtitle = `${count} of ${totalAudio} audio track(s)`;
    }  

    return {
        title: buildStreamInfo(stream),
        subtitle
    }
}));
