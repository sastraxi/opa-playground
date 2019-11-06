import { Router, Response, Request } from 'express';
import tar from 'tar-stream';
import zlib from 'zlib';

const router = Router();

const authz = `
  package authz

  allow {
    some user_id, scope, permission
    input.scope = scope
    input.user_id = user_id
    input.permission = permission

    roleId := user_roles[user_id][scope]
    roles[roleId][_] == permission
  }

  default allow = false
`;

const other = `
  allow {
    some user_id, scope, permission
    input.scope = scope
    input.user_id = user_id
    input.permission = permission

    user_roles[user_id][scope] == undefined
    scope2 := scope_parent[scope]
    scope2 != undefined

    roleId := user_roles[user_id][scope2]
    roles[roleId][_] = permission
  }

  allow {
    some user_id, scope, permission
    input.scope = scope
    input.user_id = user_id
    input.permission = permission

    user_roles[user_id][scope] == undefined
    scope2 := scope_parent[scope]
    scope2 == undefined
    scope3 := scope_parent[scope2]
    scope3 != undefined

    roleId := user_roles[user_id][scope3]
    roles[roleId][_] = permission
  }

  allow {
    some user_id, scope, permission
    input.scope = scope
    input.user_id = user_id
    input.permission = permission

    user_roles[user_id][scope] == undefined
    scope2 := scope_parent[scope]
    scope2 == undefined
    scope3 := scope_parent[scope2]
    scope3 == undefined
    scope4 := scope_parent[scope3]
    scope4 != undefined

    roleId := user_roles[user_id][scope4]
    roles[roleId][_] = permission
  }
`;

const scopeParent = `
  {
    "global": null,
    "org:1": "global",
    "course:54": "org:1",
    "course:100": "org:1",
    "section:1": "course:54",
    "section:2": "course:54",
    "section:3": "course:100"
  }
`;

const userRoles = `
  {
    "144": {
      "course:54": 2,
      "section:1": 0
    }
  }
`;

const roles = `
  [
    {
      "name": "Prof",
      "permissions": ["present", "assign", "view all grades"]
    },
    {
      "name": "Student",
      "permissions": ["view my grades"]
    },
    {
      "name": "TA",
      "permissions": ["present", "assign"]
    }
  ]
`;

const makeBundle = () => {
  const stream = tar.pack();

  const addFile = (name: string, contents: string) =>
    new Promise((resolve, reject) => {
      const entry = stream.entry({ name }, contents, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  
  addFile('authz.rego', authz).then(() =>
    addFile('roles/data.json', roles).then(() =>
      addFile('user_roles/data.json', userRoles).then(() =>
        addFile('scope_parent/data.json', scopeParent).then(() => stream.finalize()))));

  return stream.pipe(zlib.createGzip());
};

router.get('/bundle.tgz', (req: Request, res: Response) => {
  const tgz = makeBundle();
  res.set('Content-Type', 'application/gzip');
  res.set('Content-Disposition', 'attachment; filename="bundle.tgz"');
  tgz.pipe(res);
});

export default router;
