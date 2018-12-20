# Hangouts Chat Bot on Google Cloud Functions

This repo contains a full example of a Google Cloud Function which can server as a bot for Google Hangouts Chat written in NodeJS.
The bot is able to authenticate users with their Google account by means of a OAuth 2.0 web flow and acquire permissions for scopes from the Google Cloud Platform (GCP).
In this particular example, the bot asks to access Google BigQuery on behalf of the user.

The following sections describe how to deploy the bot on Google Cloud Functions and which prior steps are necessary to prepare your GCP project.

## Prerequisites

Following a list of steps which prepare your GCP project and configure the code example:

First, you need to enable the following APIs in your GCP project:
- [Google+](https://console.cloud.google.com/flows/enableapi?apiid=plus.googleapis.com) 
- [Hangouts Chat](https://console.cloud.google.com/flows/enableapi?apiid=chat.googleapis.com) 
- [Cloud Datastore](https://console.cloud.google.com/datastore)
- [Cloud Functions](https://console.cloud.google.com/functions)
- [Cloud Build](https://console.cloud.google.com/cloud-build)

Then, following steps are required:
- [Install Google Cloud SDK](https://cloud.google.com/sdk/docs/quickstarts) or [Use Google Cloud Shell](https://cloud.google.com/shell/docs/quickstart)
- [Create Google Cloud Storage bucket](https://cloud.google.com/storage/docs/creating-buckets) for the function code
- [Create Google Cloud Datastore in you GCP project](https://console.cloud.google.com/datastore)
- [Grant Google Cloud Build permissions to administer Cloud Functions](https://cloud.google.com/iam/docs/granting-roles-to-service-accounts#granting_access_to_a_service_account_for_a_resource)
- [Grant Cloud Function service account access to Cloud Datastore](https://cloud.google.com/iam/docs/granting-roles-to-service-accounts#granting_access_to_a_service_account_for_a_resource)

To enable Google Cloud Build to deploy to Cloud Functions, you need to grant developer permissions and enable the use of service accounts.
Add the permissions _Service Account > Use Service Account_ and _Cloud Functions > Developer_ to the Cloud Build service account.

Finally, copy  ```src/param.js.template``` to ```src/params.js```. 
In the new file, copy your OAuth client credentials and add scopes (optional).


## Deployment

The deployment of the code is a one line execution using the Google Cloud SDK. 
From the root folder, simply run the following:

```bash
gcloud builds submit --substitutions=_BUCKET=[code-bucket]
``` 


## Test & Experimentation

You can use the following command to trigger the authentication flow from the shell:

```bash
curl -vvv -X POST -H "Content-Type: application/json" -d '{"configCompleteRedirectUrl": "https://google.com"}' https://[region]-[gcp-prject-id].cloudfunctions.net/[function-name]/bot
```

To follow the OAuth flow, pick the URL included in the response and open it in a browser (e.g. Chrome).

## Contributers

- Michael Menzel, [michaelmenzel@google.com](mailto:michaelmenzel@google.com)
