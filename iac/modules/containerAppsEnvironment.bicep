param name string
param location string
param infrastructureSubnetId string
param infrastructureResourceGroup string
param is_internal bool = false
@allowed([
  'Enabled'
  'Disabled'
])
param publicNetworkAccess string = 'Enabled'

resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2025-02-02-preview' = {
  name: name
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    vnetConfiguration: {
      internal: is_internal
      infrastructureSubnetId: infrastructureSubnetId
    }
    zoneRedundant: false
    workloadProfiles: [
      {
        workloadProfileType: 'Consumption'
        name: 'Consumption'
      }
    ]
    infrastructureResourceGroup: infrastructureResourceGroup
    peerAuthentication: {
      mtls: {
        enabled: false
      }
    }
    peerTrafficConfiguration: {
      encryption: {
        enabled: false
      }
    }
    publicNetworkAccess: publicNetworkAccess
  }
}

output id string = containerAppsEnvironment.id
output identity_principalId string = containerAppsEnvironment.identity.principalId
