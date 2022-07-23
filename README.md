# Firestore Rule Compiler

Firestore rules can be complicated to work with and quickly get repetitive and verbose. However, to properly secure and structure a Firestore database they are essential. That's where the Rule Compiler comes in. You write a model in JSON that matches the [schema](https://raw.githubusercontent.com/tajetaje/firestore-rule-compiler/main/src/lib/model.schema.json), pass it through the compiler and use the resulting rules file.

## Features

- Powerful JSON schema
- Helpers for common security rules
- Scale your rules easily
- Enforce data types and structure
- Input raw strings for extra flexibility
- Granular operation control

## CLI Usage

```
Usage: Firestore Rule Compiler [options] <inputFile

Arguments:
  inputFile            json model file to load

Options:
  -d, --debug          output extra debugging
  -V, --version        output the version number
  -o, --output <path where to save the generated rules
  -h, --help           display help for command
```

## Editor autocomplete

To get autocomplete for ".rules.json" files in VSCode add the following to your settings.json

```
"json.schemas": [
    {
      "fileMatch": [
        "*.rules.json"
      ],
      "url": "https://raw.githubusercontent.com/tajetaje/firestore-rule-compiler/main/src/lib/model.schema.json"
    }
  ]
```

## Example rules

### Input model (this is not all possible options):

```json
{
  "topLevelMatchPath": "/databases/{database}/documents",
  "matches": [
    {
      "collectionPath": "users",
      "documentName": "uid",
      "isWildCardRecursive": true,
      "isWildCard": true,
      "allowRules": [
        {
          "methods": [
            "get"
          ],
          "requireAuth": true
        },
        {
          "methods": [
            "list",
            "update"
          ],
          "requireAuth": true,
          "conditions": [
            {
              "fieldA": {
                "fieldA": "request.auth.uid",
                "comparator": "==",
                "fieldB": "uid"
              },
              "comparator": "||",
              "fieldB": {
                "fieldA": "request.auth.token.permissions",
                "comparator": "==",
                "fieldB": "'admin'"
              }
            }
          ]
        }
      ],
      "children": [
        {
          "collectionPath": "internal",
          "documentName": "info",
          "allowRules": [
            {
              "methods": [
                "read",
                "write"
              ],
              "requireAuth": true,
              "requiredClaims": [
                {
                  "name": "permissions",
                  "value": "'admin'"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```


### Output rules

```javascript
rules_version = '2';

/*
 * Generated on: 7/20/2022, 10:31:58 PM
 */
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid=**} {
      allow get: if request.auth != null;
      allow list: if (request.auth.uid == uid || request.auth.token.permissions == 'admin') && request.auth != null;
      allow update: if (request.auth.uid == uid || request.auth.token.permissions == 'admin') && request.auth != null;
    
      match /internal/info {
        allow read: if request.auth != null && request.auth.token.permissions == 'admin';
        allow write: if request.auth != null && request.auth.token.permissions == 'admin';
      
      }    
    }
  }

  function getOr(request, field, alt) {
    return request.resource.data.get(field, alt);
  }
}
```

## In-depth explanation

The compiler refers to the input JSON file as the model for your rules. The structure
of the top level model is simple, with only three properties. The first is *topLevelMatchPath*,
which is usually just going to be "/databases/{database}/documents". The second is *matches*,
an array of `Match` objects, this is where the heavy lifting is done. The last top-level property is
*customFunctions*, an array of strings that will be formatted and added to the end of the rules file.
This is where you can add your own functions that you want to have access to in your rules.

**Match:**

| Property | Type | Description |
| --- | --- | --- |
| collectionPath (req) | string | The slash separated path to the field, e.g. "collection/document/sub-collection", no leading or trailing slashes |
| documentName (req) | string | The name of the document, e.g. "uid" |
| isWildCardRecursive | boolean | Whether or not the match is recursive, e.g. "collection/document/sub-collection/sub-sub-collection/sub-sub-document" |
| isWildCard | boolean | Whether or not the match is a wildcard, e.g. "collection/document/sub-collection/*" |
| allowRules | AllowRule[] | The logical rules to apply to the field |
| structureRules | StructureRule[] | The type-based rules to apply to the field |
| children | Match[] | The children of the match, if any |


**AllowRule:**

| Property | Type | Description |
| --- | --- | --- |
| methods (req) | string[] | An array of strings, each of which is a method name, e.g. "get", "list", "update" |
| requireAuth | boolean | Whether or not the rule requires authentication |
| conditions | Condition[] | An array of conditions, each of which has the following properties: |
| requiredClaims | { name: string; value?: string \| number \| boolean }[] | Adds a rule for each claim, if value is set for the claim, adds "request.auth.token.$\{name} == \${value}" to the condition, otherwise adds "request.auth.token.\${name} != null" |

**StructureRule:**

| Property | Type | Description |
| --- | --- | --- |
| field (req) | string | The name of the field to check |
| type | string[] | The allowed types for the field. If type is not specified, just make sure the field exists and ignore type (results in no effect to update) |
| required | boolean | Whether or not the field is required |


**Condition:**

| Property | Type | Description |
| --- | --- | --- |
| fieldA (req) | string \| Field | The lefthand field to compare, can be a field object, or a string that is taken literally |
| comparator (req) | string | The comparator to put between the two fields, e.g. "==", "!=", ">", "<", ">=", "<=" |
| fieldB (req) | string \| Field | The righthand field to compare, can be a field object, or a string that is taken literally |
| isInverted | boolean | Should the expression be preceded by "!" |

**Field:**

| Property | Type | Description |
| --- | --- | --- |
| fieldA (req) | string \| Field | The lefthand field to compare, can be a field object, or a string that is taken literally |
| comparator (req) | string | The comparator to put between the two fields, e.g. "==", "!=", ">", "<", ">=", "<=", "+", "/" |
| fieldB (req) | string \| Field | The righthand field to compare, can be a field object, or a string that is taken literally |

## Future project goals

- Generate client-side code
- Add more helpers to reduce boilerplate
- Add emulator testing to the project
