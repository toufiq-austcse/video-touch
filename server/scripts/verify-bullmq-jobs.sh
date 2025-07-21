#!/bin/bash

# This script is used to clean up the server by removing old log files and temporary files.

curl --request POST \
  --url http://localhost:4000/api/v1/cron-jobs/verify-bullmq-jobs