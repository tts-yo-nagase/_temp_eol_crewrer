param location string
@minLength(5)
@maxLength(50)
param name string

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-04-01' = {
  name: name
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
  }
}
