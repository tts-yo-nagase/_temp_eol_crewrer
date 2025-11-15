param name string
param location string

resource vnet 'Microsoft.Network/virtualNetworks@2024-05-01' = {
  name: name
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
  }
}

resource snet_cae 'Microsoft.Network/virtualNetworks/subnets@2024-05-01' = {
  name: 'snet-cae'
  parent: vnet
  properties: {
    addressPrefix: '10.0.0.0/23'
    delegations: [
      {
        name: 'Microsoft.App.environments'
        properties: {
          serviceName: 'Microsoft.App/environments'
        }
      }
    ]
  }
}

resource snet_psql 'Microsoft.Network/virtualNetworks/subnets@2024-05-01' = {
  name: 'snet-psql'
  parent: vnet
  properties: {
    addressPrefix: '10.0.2.0/24'
    delegations: [
      {
        name: 'dlg-Microsoft.DBforPostgreSQL-flexibleServers'
        properties: {
          serviceName: 'Microsoft.DBforPostgreSQL/flexibleServers'
        }
      }
    ]
  }
}

output vnet_id string = vnet.id
output caeSubnet_id string = snet_cae.id
output psqlSubnet_id string = snet_psql.id
