# Deploying Gita Ghar to AWS

This puts the app on AWS in London (`eu-west-2`) with:

| Part | AWS service | What it does |
|---|---|---|
| Hosting | S3 + CloudFront | Stores the app privately and serves it fast over HTTPS |
| Sign-in | Cognito (Essentials) | Email code sign-in, no passwords |
| Cloud backup | API Gateway + Lambda + DynamoDB | Saves each user's diary, cards and progress |
| Smart matching | Lambda + Amazon Bedrock (Claude Haiku 4.5, EU) | Chooses the best verse for what someone types |
| Cost safety | AWS Budgets + API throttling | Emails you if spending goes over about £5 a month |

Everything is defined as code in `infra/template.yaml` (AWS SAM). The Lambda code is in `backend/`.

## Before the first deploy (one time)

**1. Install the AWS SAM CLI** on your Mac:
```
brew install aws-sam-cli
sam --version
```

**2. Check you are signed in to the right AWS account:**
```
aws sts get-caller-identity
```

**3. Turn on the AI model in Amazon Bedrock.** Open the AWS console, switch the region to **Europe (London) eu-west-2**, go to **Amazon Bedrock → Model catalog**, open **Claude Haiku 4.5** and follow any steps it asks for. The first time you use an Anthropic model, AWS may ask you to fill in a short "use case" form. If this isn't done, the app still works and simply uses offline matching.

**4. Get the latest code:**
```
cd ~/gita-saathi
git pull
```

## Deploy

```
ALERT_EMAIL=your-email@example.com ./deploy.sh
```

- `ALERT_EMAIL` is where AWS sends budget alerts. It is not stored in the app.
- The first deploy takes about 5–10 minutes (CloudFront is the slow part). Later deploys are quicker.
- At the end it prints your app's address, for example `https://d1abc234xyz.cloudfront.net`.
- AWS emails you to **confirm the budget alert subscription**. Click the link in that email.

Run the same command again whenever you change the app.

## Check it works

1. Open the address printed at the end.
2. On the home page, tap **Sign in**, enter your email, and type the 6-digit code you receive.
3. Write a note in **My Gita diary**, then open the app on another phone, sign in with the same email, and check the note appears.
4. Type something in **Tell Krishna**, agree to smart matching, and check you get a verse.

## Run the tests

```
cd backend
npm install
npm test
```

## Things to know

- **Emails:** Cognito's built-in email can send about 50 emails a day. That's fine for family testing. Before a public launch, set up Amazon SES so codes always arrive.
- **Costs:** with a few users, expect a few pence a month (mostly the AI). The budget alert warns you at 80% of the limit, and when AWS forecasts you'll go over.
- **Old OAC:** if you created `gita-saathi-oac` by hand earlier, it isn't used. You can list and delete it:
  ```
  aws cloudfront list-origin-access-controls --query "OriginAccessControlList.Items[].{Id:Id,Name:Name}"
  ```
- **Deleting everything:** the user database and sign-in pool are protected from accidental deletion. To remove the app completely, turn off deletion protection on the DynamoDB table and the Cognito user pool first, then run `sam delete --stack-name gita-ghar --region eu-west-2`.
- **GitHub Pages** keeps working as an offline-only version (no sign-in or smart matching), because it has no `config.js`.
