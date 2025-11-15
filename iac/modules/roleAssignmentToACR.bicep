@description('デフォルト:AcrPull')
param roleDefinitionID string = '7f951dda-4ed3-4680-a7ca-43fe172d538d'
param principalId string
param acrName string

var roleAssignmentName= guid(principalId, roleDefinitionID, acrName)

resource acr 'Microsoft.ContainerRegistry/registries@2025-04-01' existing = {
  name: acrName
}

resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: roleAssignmentName
  scope: acr
  properties: {
    roleDefinitionId: resourceId('Microsoft.Authorization/roleDefinitions', roleDefinitionID)
    principalId: principalId
  }
}
