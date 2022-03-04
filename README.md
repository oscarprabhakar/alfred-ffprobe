# alfred-ffprobe

An [Alfred](https://www.alfredapp.com) workflow that Ffprobes a media file or URL and displays track information in the Alfred popup.

## Installation
Execute the following:

```shell
npm i -g alfred-ffprobe
```

This will create a new workflow in Alfred called `ffprobe`

## Prerequisites
[Ffprobe](https://ffmpeg.org/download.html) is a utility that extracts media information from files. It should be first installed in the system and available in the PATH variable.

## Usage
### With local media files
Invoke the workflow with the `fpr` hotkey (which can be changed to your preference in the workflow editor). Enter a media file name or paste the path to a media file.
The workflow will then initiate an ffprobe command and display a list of audio and video tracks in the media file along with other track properties.

### With media URLs
Invoke Alfred's popup and paste the URL here. Then invoke the `Universal Actions` using the configured hotkey. Track information of the media file will be displayed in the popup as in the case above.
Note: [Universal Actions](https://www.alfredapp.com/universal-actions) should be enabled and configured with a hotkey.

