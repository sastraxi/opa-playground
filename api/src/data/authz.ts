export default `
  package authz

  default allow = false

  # user role is on exact scope
  allow {
    some user_id, scope, permission
    input.scope = scope
    input.user_id = user_id
    input.permission = permission

    role_id := data.user_roles[user_id][scope]
    data.roles[role_id].permissions[_] == permission
  }

  # user role is on scope parent
  allow {
    some user_id, scope, permission
    input.scope = scope
    input.user_id = user_id
    input.permission = permission

    not data.user_roles[user_id][scope]
    scope2 := data.scope_parent[scope]

    role_id := data.user_roles[user_id][scope2]
    data.roles[role_id].permissions[_] == permission
  }

  # TODO: grandparent, great-grandparent...
`;
