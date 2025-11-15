param name string
param containerAppEnvironmentId string
param location string
param resourceExists bool
param external bool

resource newContainerApp 'Microsoft.App/containerApps@2025-01-01' = if (!resourceExists) {
  name: name
  location: location
  properties: {
    managedEnvironmentId: containerAppEnvironmentId
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: external
        targetPort: 3000
      }
    }
    template: {
      containers: [
        {
          image: 'docker.io/hello-world:latest'
          name: 'hello-world'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 1
        cooldownPeriod: 300
        pollingInterval: 30
      }
    } 
  }
}

resource existingContainerApp 'Microsoft.App/containerApps@2025-01-01' existing = if (resourceExists) {
  name: name
}

output ingressFqdn string = resourceExists ? existingContainerApp.properties.configuration.ingress.fqdn : newContainerApp.properties.configuration.ingress.fqdn
