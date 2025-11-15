@minLength(5)
@maxLength(50)
param acr_name string

var location = 'japaneast'

module containerRegistry 'modules/containerRegistry.bicep' = {
  name: '${deployment().name}-containerRegistry'
  params: {
    location: location
    name: acr_name
  }
}
