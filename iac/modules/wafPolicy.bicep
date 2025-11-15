@description('WAF ポリシーの名前')
param waf_policy_name string

var location = 'Global'

resource wafPolicy 'Microsoft.Network/frontdoorwebapplicationfirewallpolicies@2025-03-01' = {
  name: waf_policy_name
  location: location
  sku: {
    name: 'Premium_AzureFrontDoor'
  }
  properties: {
    policySettings: {
      enabledState: 'Enabled'
      mode: 'Detection'
      requestBodyCheck: 'Enabled'
      javascriptChallengeExpirationInMinutes: 30
      captchaExpirationInMinutes: 30
    }
    managedRules: {
      managedRuleSets: [
        {
          ruleSetType: 'Microsoft_DefaultRuleSet'
          ruleSetVersion: '2.1'
          ruleSetAction: 'Block'
        }
      ]
    }
  }
}

output waf_policy_id string = wafPolicy.id
