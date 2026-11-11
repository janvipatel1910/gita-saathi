#!/usr/bin/env bash
# Deploys Gita Ghar to AWS (London, eu-west-2).
#
# Usage (from the repository folder):
#   ALERT_EMAIL=you@example.com ./deploy.sh
#
# What it does:
#   1. Creates or updates the AWS resources described in infra/template.yaml
#      (CloudFront, Cognito, API Gateway, Lambda, DynamoDB, budget alert) with AWS SAM.
#   2. Writes config.js so the app knows where its API and sign-in service are.
#   3. Uploads the app files to the private S3 bucket.
#   4. Tells CloudFront to fetch the new files.
set -euo pipefail

STACK="gita-ghar"
REGION="eu-west-2"
BUCKET="${BUCKET:-gita-saathi-janvi}"
: "${ALERT_EMAIL:?Please set ALERT_EMAIL, for example: ALERT_EMAIL=you@example.com ./deploy.sh}"

cd "$(dirname "$0")"
command -v aws >/dev/null || { echo "AWS CLI not found. Install it first."; exit 1; }
command -v sam >/dev/null || { echo "AWS SAM CLI not found. Install it with: brew install aws-sam-cli"; exit 1; }

echo "==> 1/4 Creating or updating AWS resources (the first time takes about 5-10 minutes)"
sam deploy \
  --template-file infra/template.yaml \
  --stack-name "$STACK" \
  --region "$REGION" \
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
  --resolve-s3 \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset \
  --parameter-overrides "BucketName=$BUCKET" "AlertEmail=$ALERT_EMAIL"

out() {
  aws cloudformation describe-stacks --stack-name "$STACK" --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text
}
API_URL="$(out ApiUrl)"
CLIENT_ID="$(out UserPoolClientId)"
DIST_ID="$(out DistributionId)"
APP_URL="$(out AppUrl)"

echo "==> 2/4 Writing config.js"
printf 'window.GG_CONFIG={region:"%s",clientId:"%s",apiUrl:"%s"};\n' "$REGION" "$CLIENT_ID" "$API_URL" > config.js

echo "==> 3/4 Uploading the app to s3://$BUCKET"
aws s3 sync . "s3://$BUCKET" --region "$REGION" --delete \
  --exclude "*" \
  --include "index.html" --include "privacy.html" --include "config.js" \
  --include "manifest.json" --include "sw.js" \
  --include "lang/*" --include "icons/*" --include ".well-known/*"

echo "==> 4/4 Refreshing CloudFront"
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*" --query "Invalidation.Id" --output text

echo ""
echo "Done! Your app: $APP_URL"
echo "It can take a few minutes for CloudFront to show the new version everywhere."
