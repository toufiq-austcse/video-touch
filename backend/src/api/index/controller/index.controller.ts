import {Controller, Get} from '@nestjs/common';
import {DownloaderHttpService} from "@common/http-clients/downloader/downloader-http.service";
import {terminal} from "@common/utils/terminal";

@Controller()
export class IndexController {
    constructor(private downloaderService: DownloaderHttpService) {
    }

    @Get()
    async index() {
        this.downloaderService.downloadVideo("https://s3.ap-southeast-1.amazonaws.com/cdn.10minuteschool.com/C9EjES6o_0_480p.mp4", "videos/test.mp4").then(async (res) => {
            let metadata = await this.getMetadata(res);
            console.log('metadata:', metadata)
            this.transcodeVideo(res, 'videos/hls', 360, 640).then(data => {
                console.log('transcoding done:', data)

            }).catch(err => {
                console.log('transcoding error:', err)

            });
            this.transcodeVideo(res, 'videos/hls', 480, 640).then(data => {
                console.log('transcoding done:', data)

            }).catch(err => {
                console.log('transcoding error:', err)

            });
            ;
            this.transcodeVideo(res, 'videos/hls', 540, 960).then(data => {
                console.log('transcoding done:', data)

            }).catch(err => {
                console.log('transcoding error:', err)

            });
            ;
            this.transcodeVideo(res, 'videos/hls', 720, 1280).then(data => {
                console.log('transcoding done:', data)

            }).catch(err => {
                console.log('transcoding error:', err)

            });
            ;
            this.transcodeVideo(res, 'videos/hls', 1080, 1920).then(data => {
                console.log('transcoding done:', data)

            }).catch(err => {
                console.log('transcoding error:', err)

            });
            ;

        }).catch(err => {
            console.log('error:', err)
        })

        return {
            app: 'Nest Boilerplate is running...'
        };
    }

    async getMetadata(filePath: string): Promise<{
        file_name: string,
        size: number,
        height: number,
        width: number,
        duration: number,
    }> {
        let extractMetaCommand = `ffprobe -v quiet -show_streams -show_format -print_format json ${filePath}`;
        let showStreamCommandRes = await terminal(extractMetaCommand);
        let parsedData = JSON.parse(showStreamCommandRes);
        let videoInfo = parsedData.streams[0];
        let format = parsedData.format;

        return {
            file_name: format.filename,
            size: +format.size,
            height: videoInfo.height,
            width: videoInfo.width,
            duration: +videoInfo.duration
        }
    }

    async transcodeVideo(inputFilePath: string, outputFlderPath: string, height: number, width: number) {
        let command = `ffmpeg -i ${inputFilePath} -profile:v baseline -level 3.0 -s ${width}x${height} -start_number 0 -hls_time 10 -hls_list_size 0 -f hls ${outputFlderPath}/${height}/${height}_out.m3u8`;
        console.log('starting transcoding....')
        let transcodeRes = await terminal(command);
        console.log(transcodeRes);

    }
}