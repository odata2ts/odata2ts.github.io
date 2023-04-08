---
id: generated-artefacts
sidebar_position: 10
---

# Generated Artefacts

## Artefact Listing

- Model Types
  - per EntityType & ComplexType: Model representation used for query responses
  - per EntityType & ComplexType: Editable model version used for requests (create, update, and patch)
  - per EntityType: Model representing the entity id
  - per Function / Action: Model representing all parameters of that operation
- Q-Objects
  - per EntityType, ComplexType and any form of collection: one QueryObject
  - per EntityType: one id function to format and parse entity paths, e.g. `/Person(userName='russellwhyte')`
  - per function or action: QFunction or QAction to handle operation calls
- OData Client Service
  - one main odata service as entry point
  - per EntityType, ComplexType, and any form of collection: one service

