#!/usr/bin/env node

/**
 * SAP Sales Order OData Validator - MCP Server
 * Runs as a local MCP server exposing validation tools
 */

const http = require('http');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const SAP_METADATA = {
  entities: {
    A_SalesOrder: {
      fields: [
        'SalesOrder', 'SalesOrderType', 'SalesOrganization', 'DistributionChannel',
        'OrganizationDivision', 'SalesGroup', 'SalesOffice', 'SalesDistrict',
        'SoldToParty', 'CreationDate', 'CreatedByUser', 'LastChangeDate',
        'SenderBusinessSystemName', 'ExternalDocumentID', 'LastChangeDateTime',
        'PurchaseOrderByCustomer', 'PurchaseOrderByShipToParty', 'CustomerPurchaseOrderType',
        'CustomerPurchaseOrderDate', 'SalesOrderDate', 'TotalNetAmount', 'TransactionCurrency',
        'SDDocumentReason', 'PricingDate', 'RequestedDeliveryDate', 'ShippingCondition',
        'CompleteDeliveryIsDefined', 'ShippingType', 'HeaderBillingBlockReason',
        'DeliveryBlockReason', 'DeliveryDateTypeRule', 'IncotermsClassification',
        'IncotermsTransferLocation', 'IncotermsLocation1', 'IncotermsLocation2',
        'IncotermsVersion', 'CustomerPriceGroup', 'PriceListType', 'CustomerPaymentTerms',
        'PaymentMethod', 'AssignmentReference', 'ReferenceSDDocument',
        'ReferenceSDDocumentCategory', 'AccountingDocExternalReference',
        'CustomerAccountAssignmentGroup', 'AccountingExchangeRate', 'CustomerGroup',
        'AdditionalCustomerGroup1', 'AdditionalCustomerGroup2', 'AdditionalCustomerGroup3',
        'AdditionalCustomerGroup4', 'AdditionalCustomerGroup5', 'SlsDocIsRlvtForProofOfDeliv',
        'CustomerTaxClassification1', 'CustomerTaxClassification2', 'CustomerTaxClassification3',
        'CustomerTaxClassification4', 'CustomerTaxClassification5', 'CustomerTaxClassification6',
        'CustomerTaxClassification7', 'CustomerTaxClassification8', 'CustomerTaxClassification9',
        'TaxDepartureCountry', 'VATRegistrationCountry', 'SalesOrderApprovalReason',
        'SalesDocApprovalStatus', 'OverallSDProcessStatus', 'TotalCreditCheckStatus',
        'OverallTotalDeliveryStatus', 'OverallSDDocumentRejectionSts', 'ExtDate',
        'zrefat', 'zregno', 'ZZ1_originatingCampaig_SDH'
      ],
      navigationProperties: [
        'to_Item', 'to_Partner', 'to_PaymentPlanItemDetails', 'to_PricingElement', 'to_Text'
      ],
      keyFields: ['SalesOrder']
    },
    A_SalesOrderItem: {
      fields: [
        'SalesOrder', 'SalesOrderItem', 'HigherLevelItem', 'SalesOrderItemCategory',
        'SalesOrderItemText', 'PurchaseOrderByCustomer', 'PurchaseOrderByShipToParty',
        'Material', 'MaterialByCustomer', 'PricingDate', 'PricingReferenceMaterial',
        'RequestedQuantity', 'RequestedQuantityUnit', 'RequestedQuantitySAPUnit',
        'RequestedQuantityISOUnit', 'ItemGrossWeight', 'ItemNetWeight', 'ItemWeightUnit',
        'ItemWeightSAPUnit', 'ItemWeightISOUnit', 'ItemVolume', 'ItemVolumeUnit',
        'ItemVolumeSAPUnit', 'ItemVolumeISOUnit', 'TransactionCurrency', 'NetAmount',
        'MaterialGroup', 'MaterialPricingGroup', 'Batch', 'ProductionPlant',
        'StorageLocation', 'DeliveryGroup', 'ShippingPoint', 'ShippingType',
        'DeliveryPriority', 'DeliveryDateTypeRule', 'IncotermsClassification',
        'IncotermsTransferLocation', 'IncotermsLocation1', 'IncotermsLocation2',
        'ProductTaxClassification1', 'ProductTaxClassification2', 'ProductTaxClassification3',
        'ProductTaxClassification4', 'ProductTaxClassification5', 'ProductTaxClassification6',
        'ProductTaxClassification7', 'ProductTaxClassification8', 'ProductTaxClassification9',
        'MatlAccountAssignmentGroup', 'CustomerPaymentTerms', 'CustomerGroup',
        'SalesDocumentRjcnReason', 'ItemBillingBlockReason', 'SlsDocIsRlvtForProofOfDeliv',
        'WBSElement', 'ProfitCenter', 'AccountingExchangeRate', 'ReferenceSDDocument',
        'ReferenceSDDocumentItem', 'SDProcessStatus', 'DeliveryStatus',
        'OrderRelatedBillingStatus', 'ProductSeasonYear', 'ProductSeason',
        'ProductCollection', 'ProductTheme', 'SeasonCompletenessStatus',
        'FashionCancelDate', 'ProductCharacteristic1', 'ProductCharacteristic2',
        'ProductCharacteristic3', 'ShippingGroupNumber', 'ShippingGroupRule',
        'CrossPlantConfigurableProduct', 'ProductCategory', 'RequirementSegment',
        'Tax', 'Freight', 'Discount'
      ],
      navigationProperties: [
        'to_Partner', 'to_PricingElement', 'to_SalesOrder', 'to_ScheduleLine',
        'to_Text', 'to_ValueAddedService'
      ],
      keyFields: ['SalesOrder', 'SalesOrderItem']
    },
    A_SalesOrderHeaderPartner: {
      fields: [
        'SalesOrder', 'PartnerFunction', 'Customer', 'Supplier', 'Personnel', 'ContactPerson'
      ],
      navigationProperties: ['to_SalesOrder'],
      keyFields: ['SalesOrder', 'PartnerFunction']
    },
    A_SalesOrderItemPartner: {
      fields: [
        'SalesOrder', 'SalesOrderItem', 'PartnerFunction', 'Customer', 'Supplier',
        'Personnel', 'ContactPerson'
      ],
      navigationProperties: ['to_SalesOrder', 'to_SalesOrderItem'],
      keyFields: ['SalesOrder', 'SalesOrderItem', 'PartnerFunction']
    },
    A_SalesOrderHeaderPrElement: {
      fields: [
        'SalesOrder', 'PricingProcedureStep', 'PricingProcedureCounter', 'ConditionType',
        'PricingDateTime', 'ConditionCalculationType', 'ConditionBaseValue',
        'ConditionRateValue', 'ConditionCurrency', 'ConditionQuantity',
        'ConditionQuantityUnit', 'ConditionQuantitySAPUnit', 'ConditionQuantityISOUnit',
        'ConditionCategory', 'ConditionIsForStatistics', 'PricingScaleType',
        'ConditionOrigin', 'IsGroupCondition', 'ConditionRecord',
        'ConditionSequentialNumber', 'TaxCode', 'WithholdingTaxCode',
        'CndnRoundingOffDiffAmount', 'ConditionAmount', 'TransactionCurrency',
        'ConditionControl', 'ConditionInactiveReason', 'ConditionClass',
        'PrcgProcedureCounterForHeader', 'FactorForConditionBasisValue',
        'StructureCondition', 'PeriodFactorForCndnBasisValue', 'PricingScaleBasis',
        'ConditionScaleBasisValue', 'ConditionScaleBasisUnit', 'ConditionScaleBasisCurrency',
        'CndnIsRelevantForIntcoBilling', 'ConditionIsManuallyChanged',
        'ConditionIsForConfiguration', 'VariantCondition'
      ],
      navigationProperties: ['to_SalesOrder'],
      keyFields: ['SalesOrder', 'PricingProcedureStep', 'PricingProcedureCounter']
    },
    A_SalesOrderItemPrElement: {
      fields: [
        'SalesOrder', 'SalesOrderItem', 'PricingProcedureStep', 'PricingProcedureCounter',
        'ConditionType', 'PricingDateTime', 'ConditionCalculationType',
        'ConditionBaseValue', 'ConditionRateValue', 'ConditionCurrency',
        'ConditionQuantity', 'ConditionQuantityUnit', 'ConditionQuantitySAPUnit',
        'ConditionQuantityISOUnit', 'ConditionCategory', 'ConditionIsForStatistics',
        'PricingScaleType', 'IsRelevantForAccrual', 'CndnIsRelevantForInvoiceList',
        'ConditionOrigin', 'IsGroupCondition', 'ConditionRecord',
        'ConditionSequentialNumber', 'TaxCode', 'WithholdingTaxCode',
        'CndnRoundingOffDiffAmount', 'ConditionAmount', 'TransactionCurrency',
        'ConditionControl', 'ConditionInactiveReason', 'ConditionClass',
        'PrcgProcedureCounterForHeader', 'FactorForConditionBasisValue',
        'StructureCondition', 'PeriodFactorForCndnBasisValue', 'PricingScaleBasis',
        'ConditionScaleBasisValue', 'ConditionScaleBasisUnit', 'ConditionScaleBasisCurrency',
        'CndnIsRelevantForIntcoBilling', 'ConditionIsManuallyChanged',
        'ConditionIsForConfiguration', 'VariantCondition'
      ],
      navigationProperties: ['to_SalesOrder', 'to_SalesOrderItem'],
      keyFields: ['SalesOrder', 'SalesOrderItem', 'PricingProcedureStep', 'PricingProcedureCounter']
    },
    A_SalesOrderScheduleLine: {
      fields: [
        'SalesOrder', 'SalesOrderItem', 'ScheduleLine', 'RequestedDeliveryDate',
        'ConfirmedDeliveryDate', 'OrderQuantityUnit', 'OrderQuantitySAPUnit',
        'OrderQuantityISOUnit', 'ScheduleLineOrderQuantity', 'ConfdOrderQtyByMatlAvailCheck',
        'DeliveredQtyInOrderQtyUnit', 'OpenConfdDelivQtyInOrdQtyUnit',
        'CorrectedQtyInOrderQtyUnit', 'DelivBlockReasonForSchedLine'
      ],
      navigationProperties: [],
      keyFields: ['SalesOrder', 'SalesOrderItem', 'ScheduleLine']
    },
    A_SalesOrderText: {
      fields: ['SalesOrder', 'Language', 'LongTextID', 'LongText'],
      navigationProperties: ['to_SalesOrder'],
      keyFields: ['SalesOrder', 'Language', 'LongTextID']
    },
    A_SalesOrderItemText: {
      fields: ['SalesOrder', 'SalesOrderItem', 'Language', 'LongTextID', 'LongText'],
      navigationProperties: ['to_SalesOrder', 'to_SalesOrderItem'],
      keyFields: ['SalesOrder', 'SalesOrderItem', 'Language', 'LongTextID']
    },
    A_SalesOrderValAddedSrvc: {
      fields: [
        'ValueAddedServiceType', 'ValueAddedSubServiceType', 'SalesOrder', 'SalesOrderItem',
        'ValAddedSrvcTransactionNumber', 'ValAddedSrvcItemGroup', 'ValAddedSrvcItemNumber',
        'ValueAddedServiceProduct', 'ValAddedSrvcHasToBeOrdered', 'ValAddedSrvcIncrement',
        'ValueAddedServiceChargeCode', 'ValAddedSrvcIsCreatedManually',
        'ValAddedSrvcItemNumberInSD', 'ValAddedSrvcIsRlvtForProcmt',
        'ValueAddedServiceText1', 'ValueAddedServiceText2', 'ValueAddedServiceText3',
        'ValueAddedServiceLongText'
      ],
      navigationProperties: [],
      keyFields: ['ValueAddedServiceType', 'ValueAddedSubServiceType', 'SalesOrder', 'SalesOrderItem']
    },
    A_SlsOrdPaymentPlanItemDetails: {
      fields: [
        'SalesOrder', 'PaymentPlanItem', 'PaymentPlan', 'ElectronicPaymentType',
        'ElectronicPayment', 'EPaytValidityStartDate', 'EPaytValidityEndDate',
        'ElectronicPaymentHolderName', 'AuthorizedAmountInAuthznCrcy',
        'AuthorizationCurrency', 'AuthorizationByDigitalPaytSrvc',
        'AuthorizationByAcquirer', 'AuthorizationDate', 'AuthorizationTime',
        'AuthorizationStatusName', 'EPaytByDigitalPaymentSrvc',
        'ElectronicPaymentCallStatus', 'EPaytAuthorizationResult',
        'EPaytToBeAuthorizedAmount', 'EPaytAuthorizationIsExpired',
        'EPaytAmountIsChanged', 'PreauthorizationIsRequested',
        'PaymentServiceProvider', 'PaymentByPaymentServicePrvdr',
        'TransactionByPaytSrvcPrvdr', 'MerchantByClearingHouse',
        'MaximumToBeAuthorizedAmount', 'PaytPlnForAuthorizationItem',
        'PaytPlnItmForAuthorizationItem'
      ],
      navigationProperties: ['to_SalesOrder'],
      keyFields: ['SalesOrder', 'PaymentPlanItem']
    }
  }
};

function validateODataRequest(payload, entityType = 'A_SalesOrder') {
  const result = {
    valid: true,
    entityType: entityType,
    errors: [],
    warnings: [],
    invalidFields: [],
    missingEntities: [],
    invalidNavigationProperties: [],
    availableFields: [],
    availableNavigationProperties: [],
    summary: {}
  };

  if (!SAP_METADATA.entities[entityType]) {
    result.valid = false;
    result.errors.push(`Entity type '${entityType}' does not exist in SAP Sales Order API`);
    result.availableEntities = Object.keys(SAP_METADATA.entities);
    return result;
  }

  const entityMetadata = SAP_METADATA.entities[entityType];
  result.availableFields = entityMetadata.fields;
  result.availableNavigationProperties = entityMetadata.navigationProperties;

  const providedFields = Object.keys(payload);
  const validFields = [];
  const invalidFields = [];

  providedFields.forEach(field => {
    if (field.startsWith('to_')) {
      return;
    }
    if (entityMetadata.fields.includes(field)) {
      validFields.push(field);
    } else {
      invalidFields.push(field);
      result.valid = false;
    }
  });

  result.invalidFields = invalidFields;

  invalidFields.forEach(invalidField => {
    const suggestions = findSimilarFields(invalidField, entityMetadata.fields);
    result.errors.push({
      field: invalidField,
      message: `Field '${invalidField}' is not valid for entity '${entityType}'`,
      suggestions: suggestions.length > 0 ? suggestions : ['No similar fields found']
    });
  });

  const providedNavProps = providedFields.filter(f => f.startsWith('to_'));
  providedNavProps.forEach(navProp => {
    if (!entityMetadata.navigationProperties.includes(navProp)) {
      result.valid = false;
      result.invalidNavigationProperties.push(navProp);
      result.errors.push({
        navigationProperty: navProp,
        message: `Navigation property '${navProp}' is not valid for entity '${entityType}'`,
        availableNavProps: entityMetadata.navigationProperties
      });
    } else {
      const nestedEntityName = navPropToEntity(navProp, entityType);
      if (nestedEntityName && payload[navProp]) {
        const nestedPayload = Array.isArray(payload[navProp]) 
          ? payload[navProp] 
          : [payload[navProp]];
        
        nestedPayload.forEach((item, index) => {
          const nestedResult = validateODataRequest(item, nestedEntityName);
          if (!nestedResult.valid) {
            result.valid = false;
            result.errors.push({
              navigationProperty: navProp,
              index: index,
              nestedErrors: nestedResult.errors
            });
          }
        });
      }
    }
  });

  const missingKeys = entityMetadata.keyFields.filter(key => !payload[key]);
  if (missingKeys.length > 0) {
    result.warnings.push({
      message: 'Missing key fields (required for update operations)',
      fields: missingKeys
    });
  }

  result.summary = {
    totalFieldsProvided: providedFields.length - providedNavProps.length,
    validFields: validFields.length,
    invalidFields: invalidFields.length,
    navigationPropertiesProvided: providedNavProps.length,
    invalidNavigationProperties: result.invalidNavigationProperties.length
  };

  return result;
}

function findSimilarFields(invalidField, validFields) {
  const lowercaseInvalid = invalidField.toLowerCase();
  return validFields
    .filter(field => {
      const lowercaseField = field.toLowerCase();
      return lowercaseField.includes(lowercaseInvalid) || 
             lowercaseInvalid.includes(lowercaseField) ||
             levenshteinDistance(lowercaseInvalid, lowercaseField) <= 3;
    })
    .slice(0, 5);
}

function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function navPropToEntity(navProp, parentEntity) {
  const mapping = {
    'to_Item': 'A_SalesOrderItem',
    'to_Partner': parentEntity === 'A_SalesOrder' ? 'A_SalesOrderHeaderPartner' : 'A_SalesOrderItemPartner',
    'to_PricingElement': parentEntity === 'A_SalesOrder' ? 'A_SalesOrderHeaderPrElement' : 'A_SalesOrderItemPrElement',
    'to_Text': parentEntity === 'A_SalesOrder' ? 'A_SalesOrderText' : 'A_SalesOrderItemText',
    'to_ScheduleLine': 'A_SalesOrderScheduleLine',
    'to_ValueAddedService': 'A_SalesOrderValAddedSrvc',
    'to_PaymentPlanItemDetails': 'A_SlsOrdPaymentPlanItemDetails',
    'to_SalesOrder': 'A_SalesOrder',
    'to_SalesOrderItem': 'A_SalesOrderItem'
  };
  return mapping[navProp];
}

// MCP Server Implementation
class SAPValidatorServer {
  constructor() {
    this.server = new Server(
      {
        name: 'sap-odata-validator',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'validate_sales_order',
          description: 'Validates SAP Sales Order OData request payload against entity metadata. Checks field names, navigation properties, and provides suggestions for invalid fields.',
          inputSchema: {
            type: 'object',
            properties: {
              payload: {
                type: 'object',
                description: 'The OData request payload to validate (JSON object)',
              },
              entityType: {
                type: 'string',
                description: 'The entity type to validate against (default: A_SalesOrder)',
                enum: Object.keys(SAP_METADATA.entities),
                default: 'A_SalesOrder'
              }
            },
            required: ['payload']
          }
        },
        {
          name: 'get_entity_metadata',
          description: 'Get complete metadata for a specific SAP Sales Order entity including all fields and navigation properties',
          inputSchema: {
            type: 'object',
            properties: {
              entityType: {
                type: 'string',
                description: 'The entity type to get metadata for',
                enum: Object.keys(SAP_METADATA.entities)
              }
            },
            required: ['entityType']
          }
        },
        {
          name: 'list_available_entities',
          description: 'List all available SAP Sales Order entity types',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'validate_sales_order') {
        const { payload, entityType = 'A_SalesOrder' } = request.params.arguments;
        
        try {
          const result = validateODataRequest(payload, entityType);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: error.message,
                  valid: false
                }, null, 2)
              }
            ],
            isError: true
          };
        }
      }

      if (request.params.name === 'get_entity_metadata') {
        const { entityType } = request.params.arguments;
        
        if (!SAP_METADATA.entities[entityType]) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: `Entity type '${entityType}' not found`,
                  availableEntities: Object.keys(SAP_METADATA.entities)
                }, null, 2)
              }
            ],
            isError: true
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                entityType,
                metadata: SAP_METADATA.entities[entityType]
              }, null, 2)
            }
          ]
        };
      }

      if (request.params.name === 'list_available_entities') {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                entities: Object.keys(SAP_METADATA.entities).map(name => ({
                  name,
                  fieldCount: SAP_METADATA.entities[name].fields.length,
                  navigationProperties: SAP_METADATA.entities[name].navigationProperties.length,
                  keyFields: SAP_METADATA.entities[name].keyFields
                }))
              }, null, 2)
            }
          ]
        };
      }

      throw new Error(`Unknown tool: ${request.params.name}`);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('SAP OData Validator MCP server running on stdio');
  }
}

// Run the server
const server = new SAPValidatorServer();
server.run().catch(console.error);