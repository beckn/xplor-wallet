export default () => ({
  MONGODB_URL: process.env.MONGODB_URL,
  SERVICE_BASE_URL: process.env.SERVICE_BASE_URL,
  STORAGE_BUCKET_NAME: process.env.STORAGE_BUCKET_NAME,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
  STORAGE_REGION: process.env.STORAGE_REGION,
  REGISTRY_SERVICE_URL: process.env.REGISTRY_SERVICE_URL,
  SELF_ISSUED_SCHEMA_ID: process.env.SELF_ISSUED_SCHEMA_ID,
  SELF_ISSUED_SCHEMA_CONTEXT: process.env.SELF_ISSUED_SCHEMA_CONTEXT,
  SELF_ISSUED_ORGANIZATION_NAME: process.env.SELF_ISSUED_ORGANIZATION_NAME,
  SELF_ISSUED_SCHEMA_TAG: process.env.SELF_ISSUED_SCHEMA_TAG,
  WALLET_SERVICE_URL: process.env.WALLET_SERVICE_URL,
})
