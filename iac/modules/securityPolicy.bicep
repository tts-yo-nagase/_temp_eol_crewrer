@description('Front Door のリソース名')
param afd_name string

@description('紐づける WAF Policy のリソースID')
param waf_policy_id string

param domains array

resource frontDoor 'Microsoft.Cdn/profiles@2025-04-15' existing = {
  name: afd_name
}

resource afdSecurityPolicy 'Microsoft.Cdn/profiles/securityPolicies@2025-04-15' = {
  name: 'wafpolicy'
  parent: frontDoor
  properties: {
    parameters: {
      type: 'WebApplicationFirewall'
      associations: [
        {
          domains: domains
          patternsToMatch: [
            '/*'
          ]
        }
      ]
      wafPolicy: {
        id: waf_policy_id
      }
    }
  }
}
