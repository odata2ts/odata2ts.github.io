---
id: nod-js
title: Node.js
sidebar_position: 20
---

# Node.js

odata2ts works the same in a Node.js environment. In the end we're just talking TypeScript and don't make any
use of the DOM.

The one point where it is special though is the HTTP client. Here you must use Axios and
the [`@odata2ts/http-client-axios`](../odata-client/http-client/axios).
