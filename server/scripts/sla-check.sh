#!/bin/bash

# Runs one SLA check. Scheduled by crontab every 5 minutes. See specs/video-sla-alerting.md.

curl --silent --show-error --fail \
  --max-time 120 \
  --request POST \
  --header "x-internal-api-key: ${INTERNAL_API_KEY}" \
  --url http://localhost:3000/api/v1/sla/check
echo