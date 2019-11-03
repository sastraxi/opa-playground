# OPA Playground API

The OPA Playground API provides an HTTP interface:
- `GET /bundle` allows OPA to download bundles in tgz format
- `POST /role` lets a client update set a `(user_id, scope)` tuple, in turn updating the bundles
