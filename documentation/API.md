# API Documentation

---

## 1. Quotation Verification API

### Overview

This API endpoint verifies a quotation document by decrypting a verification id and validating its existence.

### Endpoint

`GET /api/verify/document/quotation/:id`

### Request Parameters

- `id` (string, required): The encrypted quotation id.

### Response

#### Success Response

**Status Code: 200 OK**

```json
{
  "status": true,
  "message": "Successful",
  "data": {
    "quotationStatus": "active",
    "quotationNumber": "Q250213994",
    "issueDate": "02 Feb, 2025"
  }
}
```

OR if the quotation is `expired`:

```json
{
  "status": true,
  "message": "Successful",
  "data": {
    "quotationStatus": "expired",
    "quotationNumber": "Q250213991",
    "issueDate": "01 Jan, 2025"
  }
}
```

#### Error Responses

#### Invalid Verification Key

**Status Code: 400 Bad Request**

```json
{
  "status": false,
  "message": "Invalid verification key."
}
```

##### Invalid Quotation id

**Status Code: 400 Bad Request**

```json
{
  "status": false,
  "message": "Invalid quotation Id."
}
```

##### Quotation Not Found

**Status Code: 404 Not Found**

```json
{
  "status": false,
  "message": "Quotation does not exist."
}
```

##### Internal Server Error

**Status Code: 500 Internal Server Error**

```json
{
  "status": false,
  "message": "Something went wrong"
}
```

---
