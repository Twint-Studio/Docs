---
name: OpenAPI
---

# OpenAPI

OpenAPI is a re-implementation of the [API](https://api.serversmp.xyz) while having a developer friendly mindset and independence from the closed source version.

<!-- `[TOC]` -->
[TOC]

## Endpoints

### Codebin

#### Create

```js
POST => /codebin/create
// Create a new codebin

BODY => {
    content // The contents of the codebin (required)
    type // The type of file to be created (optional)
}

RESPONSE => {
    success: true,
    message: "Successfully created codebin",
    data: {
        id: "" // The id for the codebin
    }
}
```

#### Get All

```js
GET => /codebin/get
// Get all codebins

RESPONSE => {
    success: true,
    message: "Successfully fetched all codebin",
    data: [] // Array of objects
}
```

#### Get One

```js
GET => /codebin/get/:id
// Get a specified codebin

PARAM => {
    id // The id for the codebin (required)
}

RESPONSE => {
    success: true,
    message: "Successfully fetched codebin",
    data: {} // Object with shorted data
}
```

### Shorten

#### Create

```js
POST => /shorten/create
// Create a new shortened URL

BODY => {
    code // The code for the shorten (optional)
    url // The URL to shorten (required)
}

RESPONSE => {
    success: true,
    message: "Successfully created shorten",
    data: {
        code: "" // The code for the shorten
    }
}
```

#### Get All

```js
GET => /shorten/get
// Get all shortened URLs

RESPONSE => {
    success: true,
    message: "Successfully fetched all shorten",
    data: [] // Array of objects
}
```

#### Get One

```js
GET => /shorten/get/:code
// Get a specified shortened URL

PARAM => {
    code // The code for the shortened URL (required)
}

RESPONSE => {
    success: true,
    message: "Successfully fetched shorten",
    data: {} // Object with shorted data
}
```