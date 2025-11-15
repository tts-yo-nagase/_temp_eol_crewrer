@description('Front Door のリソース名')
param afd_name string

var location = 'Global'

resource frontDoor 'Microsoft.Cdn/profiles@2025-04-15' = {
  name: afd_name
  location: location
  sku: {
    name: 'Premium_AzureFrontDoor'
  }
  properties: {
    originResponseTimeoutSeconds: 60
  }
}

output afd_name string = frontDoor.name
