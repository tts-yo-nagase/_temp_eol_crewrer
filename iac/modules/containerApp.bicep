param name string
param containerAppEnvironmentId string
param location string
param is_acr_image bool = true
param acr_name string = ''
param app_name string
param app_tag string
param env array
param secrets array
param external bool
param minReplicas int = 0
param maxReplicas int = 1
param targetPort int
param cors_allowed_origins array = []
@allowed([
  'Http'
  'Tcp'
])
param transportType string = 'Http'
param exposedPort int = 443

var corsPolicy = (length(cors_allowed_origins) > 0)
  ? {
      allowedOrigins: cors_allowed_origins
      allowedHeaders: ['*']
    }
  : null

resource containerApp 'Microsoft.App/containerApps@2025-01-01' = {
  name: name
  location: location
  properties: {
    managedEnvironmentId: containerAppEnvironmentId
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: (transportType == 'Http')
        ? {
            external: external
            targetPort: targetPort
            corsPolicy: corsPolicy
          }
        : {
            transport: transportType
            targetPort: targetPort
            exposedPort: exposedPort
            corsPolicy: corsPolicy
          }
      registries: is_acr_image
        ? [
            {
              server: '${acr_name}.azurecr.io'
              identity: 'system-environment'
            }
          ]
        : []
      secrets: secrets
    }
    template: {
      containers: [
        {
          image: is_acr_image ? '${acr_name}.azurecr.io/${app_name}:${app_tag}' : 'docker.io/${app_name}:${app_tag}'
          name: last(split(app_name, '/'))
          env: env
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        cooldownPeriod: 300
        pollingInterval: 30
      }
    }
  }
}

output ingressFqdn string = containerApp.properties.configuration.ingress.fqdn
