param postgre_name string
param location string
param dbInstanceType string = 'Standard_B1ms'
param storageSizeGB int = 32
param administratorLogin string
@secure()
param administratorLoginPassword string
param vnet_id string
param subnet_id string

var privateDnsZone_name = '${postgre_name}.private.postgres.database.azure.com'

resource psql 'Microsoft.DBforPostgreSQL/flexibleServers@2024-11-01-preview' = {
  name: postgre_name
  location: location
  sku: {
    name: dbInstanceType
    tier: 'Burstable'
  }
  properties: {
    replica: {
      role: 'Primary'
    }
    storage: {
      tier: 'P4'
      storageSizeGB: storageSizeGB
      autoGrow: 'Disabled'
    }
    network: {
      publicNetworkAccess: 'Disabled'
      delegatedSubnetResourceId: subnet_id
      privateDnsZoneArmResourceId: privateDnsZone.id
    }
    authConfig: {
      activeDirectoryAuth: 'Disabled'
      passwordAuth: 'Enabled'
    }
    version: '17'
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorLoginPassword
    availabilityZone: '1'
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    maintenanceWindow: {
      customWindow: 'Disabled'
    }
    replicationRole: 'Primary'
  }
}

resource privateDnsZone 'Microsoft.Network/privateDnsZones@2024-06-01' = {
  name: privateDnsZone_name
  location: 'global'
  properties: {}
}

resource privateDnsZoneLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2024-06-01' = {
  parent: privateDnsZone
  name: guid(privateDnsZone_name, vnet_id)
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: vnet_id
    }
  }
}

output postgres_fqdn string = psql.properties.fullyQualifiedDomainName
