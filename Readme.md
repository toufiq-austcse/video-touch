# Video Touch
> Video Touch is a Video Hosting & Streaming platform. In Video Touch users can easily upload, manage and stream videos on demand.

## Table Of Contents
- [The Goals of This Project](#goal)
- [Features](#features)
- [Technologies](#technologies---libraries)
- [Backend Architecture](#the-domain-and-bounded-context---service-boundary)
- [How to Run](#how-to-run)
  - [Docker-Compose](#docker-compose)
  - [Build](#build)
  - [Run](#run)
  - [Test](#test)
- [Documentation Apis](#documentation-apis)
- [Frontend](#frontend)

<a id="goal"></a>
### The Goals Of This Project
---
*  Implementing video processing with the help of asynchornus job queue
*  Generating video thumbnail
*  Using RabbitMQ as a Job Queue
*  Using Event Driven Communications
*  Using GraphQL for client side communications
*  Using AWS s3 as storage
*  Stream videos with CDN (AWS Cloudfront)
*  Building a simple Dashboard with Next.js and shadcn/ui
*  Using Github Actions for implenting CI
*  Using Docker-Compose for our deployment mechanism.

<a id="features"></a>
### Features
---
* User Login/Registration
* Video Upload
* Video Transcoding in several resolutions(720p,540p,480p,360p)
* Automatic Thumbnail Generation
* Stream videos on Demand with CDN

<a id="technologies"></a>
### Technologies
---
* [NestJS](https://nestjs.com/) - A progressive Node.js framework
* [MongoDB](https://www.mongodb.com/) - As Database
* [RabbitMQ](https://www.rabbitmq.com/) - As Job Queue and Event Driven Communications
* [GraphQL](https://graphql.org/) - For writing Client Side API's
* [AWS S3](https://aws.amazon.com/s3/) - As Video Storage
* [AWS CloudFront](https://aws.amazon.com/cloudfront/) - As CDN
* [Next.js](https://nextjs.org/) - For developing dashboard
* [shadcn/ui](https://ui.shadcn.com/) - UI compoenent
* [Docker](https://www.docker.com/) - For deployment
* [Github Actions](https://github.com/features/actions) - For CI

<a id="backend-architectire"></a>
### Backend Architecture
---

<img src ="images/video_touch_architecture.png">

<a id="how-to-run"></a>
### How To Run
---

<a id="frontend"></a>
### Frontend
---
<details>
<summary>Click here to show the screenshots of the project</summary>
    <p> SignUp Page </p>
    <img src ="images/signup.png">
   <p> Login Page </p>
    <img src ="images/login.png">
   <p> Dashboard </p>
    <img src ="images/dashboard.png">
    <p> Video Details Page </p>
    <img src ="images/video_details.png">
    <p> Import Video From Link </p>
    <img src ="images/import_from_link.png">
    <p> Upload Video</p>
    <img src ="images/upload_video.png">
    <p> Edit Video Details </p>
    <img src ="images/edit_video_details.png">
  

</details>

