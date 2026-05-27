# authn-gcp-cf

Google Cloud Functions example that authenticates to **CyberArk Conjur Cloud** using the GCP identity token (`authn-gcp`). The function never holds a static Conjur API key: it trades a short-lived GCP-signed JWT for Conjur access at runtime, then fetches a secret.

This is the serverless companion to [appengine-java-conjur](https://github.com/aslancarlos/appengine-java-conjur), which shows the same federation pattern from a Spring Boot app on App Engine.

## What this demonstrates

| Step | What happens |
|---|---|
| 1. Cloud Function execution | Function obtains its identity token from the GCP metadata server |
| 2. Token exchange | JWT is presented to Conjur's `authn-gcp` authenticator |
| 3. Authorization | Conjur validates the token issuer, audience, and email/SA claims against policy |
| 4. Access token | Conjur returns a short-lived access token |
| 5. Secret retrieval | Function fetches the configured secret variable |

No long-lived Conjur API key is stored in environment variables, Secret Manager, or in the function source. The trust anchor is the GCP service account identity itself.

## Prerequisites

- Google Cloud project with billing enabled
- Conjur Cloud tenant with `authn-gcp` enabled
- A GCP service account with permission to issue identity tokens
- A Conjur policy granting that service account access to the target secret

## Configuration

Update the constants in `index.js`:

```js
const CONJUR_HOST = "https://<your-tenant>.secretsmgr.cyberark.cloud";
const CONJUR_ACCOUNT = "conjur";
const SERVICE_ID = "gcp";
const SECRET_PATH = "data/your/secret/variable";
```

## Deploying

```bash
gcloud functions deploy authn-gcp-cf \
  --runtime=nodejs20 \
  --trigger-http \
  --entry-point=fetchSecret \
  --region=us-central1 \
  --service-account=your-sa@your-project.iam.gserviceaccount.com
```

## Related

- [appengine-java-conjur](https://github.com/aslancarlos/appengine-java-conjur) — Same pattern, Spring Boot + App Engine
- [conjur-explainer](https://github.com/aslancarlos/conjur-explainer) — Visual walkthrough of `authn-jwt` and related Conjur federation flows

## License

Apache License 2.0 — see [LICENSE](LICENSE).
