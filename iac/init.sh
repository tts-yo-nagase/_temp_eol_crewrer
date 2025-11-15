#!/bin/bash

# 引数の設定
subscriptionId=$1
resourceGroup=$2
acrName=$3
appName=$4

# ログイン
az login

# リソースグループの作成
az group create --location japaneast -n $resourceGroup

# ACR の作成
az deployment group create --resource-group $resourceGroup --name initDeploy --template management.bicep --parameters acr_name=$acrName

# アプリの作成
clientId=$(az ad app create --display-name $appName --query appId --output tsv)
az ad sp create --id $clientId

# 権限の付与
az role assignment create --assignee $clientId --scope /subscriptions/$subscriptionId/resourceGroups/$resourceGroup --role Contributor
az role assignment create --assignee $clientId --scope /subscriptions/$subscriptionId/resourceGroups/$resourceGroup/providers/Microsoft.ContainerRegistry/registries/$acrName --role acrpush
az role assignment create --assignee $clientId --scope /subscriptions/$subscriptionId/resourceGroups/$resourceGroup/providers/Microsoft.ContainerRegistry/registries/$acrName \
--role "18d7d88d-d35e-4fb5-a5c3-7773c20a72d9" \
--condition "((!(ActionMatches{'Microsoft.Authorization/roleAssignments/write'}))OR(@Request[Microsoft.Authorization/roleAssignments:RoleDefinitionId] ForAnyOfAnyValues:GuidEquals {7f951dda-4ed3-4680-a7ca-43fe172d538d}))AND((!(ActionMatches{'Microsoft.Authorization/roleAssignments/delete'}))OR(@Resource[Microsoft.Authorization/roleAssignments:RoleDefinitionId] ForAnyOfAnyValues:GuidEquals {7f951dda-4ed3-4680-a7ca-43fe172d538d}))"

# フェデレーション資格の追加
objectId=$(az ad app show --id $clientId --query id --output tsv)
az ad app federated-credential create --id $objectId --parameters configurations/credential.json

# Githubシークレットに設定する値の出力
echo "AZURE_CLIENT_ID=$clientId"
echo "AZURE_TENANT_ID=$(az ad sp show --id $clientId --query appOwnerOrganizationId --output tsv)"
echo "AZURE_SUBSCRIPTION_ID=$subscriptionId"
echo "AZURE_REGISTRY_NAME=$acrName"
