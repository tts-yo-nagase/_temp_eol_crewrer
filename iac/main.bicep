// Base Parameters
param frontendExists bool
param backendExists bool
@minLength(3)
@maxLength(8)
param product_name string
@minLength(1)
@maxLength(4)
param environment_name string
param acr_name string
param frontapp_name string
param frontapp_tag string
param backapp_name string
param backapp_tag string
param postgres_user string
param azure_ad_client_id string
param azure_ad_tenant_id string
@secure()
param nextauth_secret string
@secure()
param azure_ad_client_secret string
@secure()
param postgres_password string

// Option1: WAF
param option_waf bool = false
param frontapp_endpoint_name string = 'frontend'
param backapp_endpoint_name string = 'backend'

var location = 'japaneast'
var database_url = 'postgresql://${postgres_user}:${postgres_password}@${postgreSQL.outputs.postgres_fqdn}:5432/app_db'

// 仮想ネットワークとサブネットの作成
module vnet 'modules/virtualNetwork.bicep' = {
  name: '${deployment().name}-vnet'
  params: {
    location: location
    name: '${product_name}-vnet-${environment_name}'
  }
}

// PostgreSQL の作成
module postgreSQL 'modules/postgreSQL.bicep' = {
  name: '${deployment().name}-postgreSQL'
  params: {
    postgre_name: '${product_name}-psql-${environment_name}'
    location: location
    administratorLogin: postgres_user
    administratorLoginPassword: postgres_password
    vnet_id: vnet.outputs.vnet_id
    subnet_id: vnet.outputs.psqlSubnet_id
  }
}

// Container Apps Environment の作成
module containerAppsEnvironment 'modules/containerAppsEnvironment.bicep' = {
  name: '${deployment().name}-cae'
  params: {
    location: location
    name: '${product_name}-cae-${environment_name}'
    infrastructureSubnetId: vnet.outputs.caeSubnet_id
    infrastructureResourceGroup: '${product_name}-caewl-${environment_name}'
    publicNetworkAccess: (option_waf) ? 'Disabled' : 'Enabled'
  }
}

// Container Apps Environment に対する ACR のアクセス権限の付与
module roleAssignmentToACR 'modules/roleAssignmentToACR.bicep' = {
  name: '${deployment().name}-roleAssignmentToACR'
  params: {
    acrName: acr_name
    principalId: containerAppsEnvironment.outputs.identity_principalId
  }
}

// Frontend アプリケーションの FQDN 取得
module frontendFqdn 'modules/getContainerAppFqdn.bicep' = {
  name: '${deployment().name}-frontendFqdn'
  params: {
    name: '${product_name}-ca-frontend-${environment_name}'
    containerAppEnvironmentId: containerAppsEnvironment.outputs.id
    location: location
    resourceExists: frontendExists
    external: true
  }
}

// Backend アプリケーションの FQDN 取得
module backendFqdn 'modules/getContainerAppFqdn.bicep' = {
  name: '${deployment().name}-backendFqdn'
  params: {
    name: '${product_name}-ca-backend-${environment_name}'
    containerAppEnvironmentId: containerAppsEnvironment.outputs.id
    location: location
    resourceExists: backendExists
    external: true
  }
}

// WAFPolicy の作成
module waf 'modules/wafPolicy.bicep' = if (option_waf) {
  name: '${deployment().name}-waf'
  params: {
    waf_policy_name: '${product_name}waf${environment_name}'
  }
}

// FrontDoor の作成
module frontDoor 'modules/frontDoor.bicep' = if (option_waf) {
  name: '${deployment().name}-frontDoor'
  params: {
    afd_name: '${product_name}-fd-${environment_name}'
  }
}

// Frontend アプリケーションの FrontDoor Endpoint の作成
module frontendFDE 'modules/frontDoorEndpoint.bicep' = if (option_waf) {
  name: '${deployment().name}-frontendFDE'
  params: {
    endpoint_name: frontapp_endpoint_name
    afd_name: frontDoor.outputs.afd_name
    cae_id: containerAppsEnvironment.outputs.id
    cae_location: location
    originHostName: frontendFqdn.outputs.ingressFqdn
  }
}

// Backend アプリケーションの FrontDoor Endpoint の作成
module backendFDE 'modules/frontDoorEndpoint.bicep' = if (option_waf) {
  name: '${deployment().name}-backendFDE'
  params: {
    endpoint_name: backapp_endpoint_name
    afd_name: frontDoor.outputs.afd_name
    cae_id: containerAppsEnvironment.outputs.id
    cae_location: location
    originHostName: backendFqdn.outputs.ingressFqdn
  }
}

// Frontend アプリケーションの WAF Policy の作成
module frontendWafPolicy 'modules/securityPolicy.bicep' = if (option_waf) {
  name: '${deployment().name}-frontendWafPolicy'
  params: {
    afd_name: frontDoor.outputs.afd_name
    waf_policy_id: waf.outputs.waf_policy_id
    domains: [
      {
        id: frontendFDE.outputs.endpoint_id
      }
      {
        id: backendFDE.outputs.endpoint_id
      }
    ]
  }
}

// Frontend アプリケーションの作成
module frontend 'modules/containerApp.bicep' = {
  name: '${deployment().name}-frontend'
  params: {
    name: '${product_name}-ca-frontend-${environment_name}'
    containerAppEnvironmentId: containerAppsEnvironment.outputs.id
    location: location
    acr_name: acr_name
    app_name: frontapp_name
    app_tag: frontapp_tag
    external: true
    targetPort: 3000
    env: [
      {
        name: 'NEXTAUTH_URL'
        value: (option_waf)
          ? 'https://${frontendFDE.outputs.endpoint_hostname}'
          : 'https://${frontendFqdn.outputs.ingressFqdn}'
      }
      {
        name: 'NEXTAUTH_SECRET'
        secretRef: 'nextauth-secret'
      }
      {
        name: 'API_URL'
        value: (option_waf)
          ? 'https://${backendFDE.outputs.endpoint_hostname}'
          : 'https://${backendFqdn.outputs.ingressFqdn}'
      }
      {
        name: 'AZURE_AD_CLIENT_ID'
        value: azure_ad_client_id
      }
      {
        name: 'AZURE_AD_CLIENT_SECRET'
        secretRef: 'azure-ad-client-secret'
      }
      {
        name: 'AZURE_AD_TENANT_ID'
        value: azure_ad_tenant_id
      }
      {
        name: 'DATABASE_URL'
        value: database_url
      }
      {
        name: 'AUTH_TRUST_HOST'
        value: 'true'
      }
    ]
    secrets: [
      {
        name: 'nextauth-secret'
        value: nextauth_secret
      }
      {
        name: 'azure-ad-client-secret'
        value: azure_ad_client_secret
      }
    ]
  }
  dependsOn: [
    roleAssignmentToACR
  ]
}

// Backend アプリケーションの作成
module backend 'modules/containerApp.bicep' = {
  name: '${deployment().name}-backend'
  params: {
    name: '${product_name}-ca-backend-${environment_name}'
    containerAppEnvironmentId: containerAppsEnvironment.outputs.id
    location: location
    acr_name: acr_name
    app_name: backapp_name
    app_tag: backapp_tag
    external: true
    targetPort: 3010
    cors_allowed_origins: [
      (option_waf) ? 'https://${frontendFDE.outputs.endpoint_hostname}' : 'https://${frontendFqdn.outputs.ingressFqdn}'
    ]
    env: [
      {
        name: 'DATABASE_URL'
        value: database_url
      }
      {
        name: 'JWT_SECRET'
        secretRef: 'jwt-secret'
      }
    ]
    secrets: [
      {
        name: 'jwt-secret'
        value: nextauth_secret
      }
    ]
  }
  dependsOn: [
    backendFqdn
    roleAssignmentToACR
  ]
}
