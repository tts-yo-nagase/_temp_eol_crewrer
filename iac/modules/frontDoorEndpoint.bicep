@description('Front Door のリソース名')
param afd_name string

@description('作成するエンドポイント名')
param endpoint_name string

@description('接続先の Container Apps Environment のリソースID')
param cae_id string

@description('接続先の Container Apps Environment のリージョン')
param cae_location string

@description('接続先のホスト名')
param originHostName string

var location = 'Global'

resource frontDoor 'Microsoft.Cdn/profiles@2025-04-15' existing = {
  name: afd_name
}

resource afdEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2025-04-15' = {
  name: endpoint_name
  parent: frontDoor
  location: location
  properties: {
    enabledState: 'Enabled'
  }
}

resource afdOriginGroup 'Microsoft.Cdn/profiles/originGroups@2025-04-15' = {
  name: '${endpoint_name}-og'
  parent: frontDoor
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
      additionalLatencyInMilliseconds: 50
    }
    healthProbeSettings: {
      probePath: '/'
      probeRequestType: 'HEAD'
      probeProtocol: 'Http'
      probeIntervalInSeconds: 100
    }
    sessionAffinityState: 'Disabled'
  }
}

resource afdOrigin 'Microsoft.Cdn/profiles/originGroups/origins@2025-04-15' = {
  name: '${endpoint_name}-origin'
  parent: afdOriginGroup
  properties: {
    hostName: originHostName
    httpPort: 80
    httpsPort: 443
    originHostHeader: originHostName
    priority: 1
    weight: 1000
    enabledState: 'Enabled'
    sharedPrivateLinkResource: {
      privateLink: {
        id: cae_id
      }
      groupId: 'managedEnvironments'
      privateLinkLocation: cae_location
      requestMessage: 'from frontdoor'
    }
    enforceCertificateNameCheck: true
  }
}

resource afdRoute 'Microsoft.Cdn/profiles/afdendpoints/routes@2025-04-15' = {
  name: '${endpoint_name}-route'
  parent: afdEndpoint
  properties: {
    originGroup: {
      id: afdOriginGroup.id
    }
    supportedProtocols: [
      'Http'
      'Https'
    ]
    patternsToMatch: [
      '/*'
    ]
    forwardingProtocol: 'MatchRequest'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
    enabledState: 'Enabled'
  }
}

output endpoint_hostname string = afdEndpoint.properties.hostName
output endpoint_id string = afdEndpoint.id
