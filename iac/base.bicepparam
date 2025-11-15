using './main.bicep'

param backapp_name = 'app-template/backend'

param backapp_tag = 'latest'

param backendExists = false

param environment_name = 'dev'

param frontapp_name = 'app-template/frontend'

param frontapp_tag = 'latest'

param frontendExists = false

param product_name = 'template'

param acr_name = readEnvironmentVariable('CONTAINER_REGISTRY_NAME', '')

param postgres_user = readEnvironmentVariable('POSTGRES_USER', '')

param azure_ad_client_id = readEnvironmentVariable('AZURE_AD_CLIENT_ID', '')

param azure_ad_tenant_id = readEnvironmentVariable('AZURE_AD_TENANT_ID', '')

// シークレット値
param postgres_password = readEnvironmentVariable('POSTGRES_PASSWORD', '')

param azure_ad_client_secret = readEnvironmentVariable('AZURE_AD_CLIENT_SECRET', '')

param nextauth_secret = readEnvironmentVariable('NEXTAUTH_SECRET', '')
