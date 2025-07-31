<h1 align="center" style="border-bottom: none">
    <a href="https://github.com/toufiq-austcse/video-touch" target="_blank">
        <svg width="100" height="100" viewBox="0 0 24 24" fill="#6366f1" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 8H2V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H8V4H4V8Z"/>
            <path d="M20 8H22V4C22 3.46957 21.7893 2.96086 21.4142 2.58579C21.0391 2.21071 20.5304 2 20 2H16V4H20V8Z"/>
            <path d="M20 20H16V22H20C20.5304 22 21.0391 21.7893 21.4142 21.4142C21.7893 21.0391 22 20.5304 22 20V16H20V20Z"/>
            <path d="M4 20H8V22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V16H4V20Z"/>
            <path d="M9 7L15 12L9 17V7Z"/>
        </svg>
    </a>
    <br>Video Touch
</h1>
> Video Touch is a Video Hosting & Streaming platform. In Video Touch users can easily upload, manage and stream videos on demand.

<img src ="images/dashboard.jpeg"/>
  
## Table Of Contents
- [The Goals of This Project](#goal)
- [Features](#features)
- [Technologies](#technologies---libraries)
- [Backend Architecture](#the-domain-and-bounded-context---service-boundary)
- [How to Run](#how-to-run)
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
*  Using Github Actions for implementing CI
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
To run this project locally, follow these steps:
1. Clone this repository
```
git clone git@github.com:toufiq-austcse/video-touch.git
```
2. Run server app
  *   You will need AWS credentials, S3 Bucket and Cloudfront distribution
  *   From project directory run the following commands:
      ```
      cd server
      cp example.env .env
      ```
  *   Put your aws credentials, s3 bucket name and cloudfront cdn url in the following env's value
      ```
      AWS_ACCESS_KEY_ID=
      AWS_REGION=
      AWS_SECRET_ACCESS_KEY=
      AWS_S3_BUCKET_NAME=
      CDN_BASE_URL=
      ```
  *  Create a seperate diretory for videos in your s3 bucket and put directory url in the following env value. Example value `https://test-bucket.s3.ap-southeast-1.amazonaws.com/videos`

       ```
       VIDEO_BASE_URL=
      ```
  * Put your JWT secret key and token expiren value in seconds in the following env's value
       ```
      JWT_SECRET=
      JWT_EXPIRATION_TIME_IN_SEC=
       ```     
  * Run the follwong command
       ```
          docker compose up -d
       ```
3. Run the Frontend app
  *   From project directory run the following commands:
      ```
      cd frontend
      docker compose up -d
      ```


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