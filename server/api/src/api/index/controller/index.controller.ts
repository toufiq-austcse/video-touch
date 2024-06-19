import { Controller, Get } from '@nestjs/common';

@Controller()
export class IndexController {
  constructor() {}

  @Get()
  async index() {
    // this.downloaderService
    //   .downloadVideo(
    //     'https://s3.ap-southeast-1.amazonaws.com/cdn.10minuteschool.com/C9EjES6o_0_480p.mp4',
    //     'assets/test.mp4'
    //   )
    //   .then(async (res) => {
    //     let metadata = await this.getMetadata(res);
    //     console.log('metadata:', metadata);
    //     this.transcodeVideo(res, 'assets/hls', 360, 640)
    //       .then((data) => {
    //         console.log('transcoding done:', data);
    //       })
    //       .catch((err) => {
    //         console.log('transcoding error:', err);
    //       });
    //     this.transcodeVideo(res, 'assets/hls', 480, 640)
    //       .then((data) => {
    //         console.log('transcoding done:', data);
    //       })
    //       .catch((err) => {
    //         console.log('transcoding error:', err);
    //       });
    //     this.transcodeVideo(res, 'assets/hls', 540, 960)
    //       .then((data) => {
    //         console.log('transcoding done:', data);
    //       })
    //       .catch((err) => {
    //         console.log('transcoding error:', err);
    //       });
    //     this.transcodeVideo(res, 'assets/hls', 720, 1280)
    //       .then((data) => {
    //         console.log('transcoding done:', data);
    //       })
    //       .catch((err) => {
    //         console.log('transcoding error:', err);
    //       });
    //     this.transcodeVideo(res, 'assets/hls', 1080, 1920)
    //       .then((data) => {
    //         console.log('transcoding done:', data);
    //       })
    //       .catch((err) => {
    //         console.log('transcoding error:', err);
    //       });
    //   })
    //   .catch((err) => {
    //     console.log('error:', err);
    //   });

    return {
      app: 'Nest Boilerplate is running...',
    };
  }
}
