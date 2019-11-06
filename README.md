# Playing around with Open Policy Agent

To get started, follow these steps:

1. `cd api && yarn start` to get the API that integrates with OPA started.
2. Run `docker-compose up` to get OPA started.
3. Navigate to http://localhost:8081 and start evaluating queries, e.g.

```
{
  input: {
    scope: "section:2",
    user_id: 144,
    permission: "view my grades"
  }
}
```
