import { Router, Response, Request } from 'express';
import tar from 'tar-stream';
import zlib from 'zlib';

import authz from './data/authz';
import authzTest from './data/test';

const router = Router();

const scopeParent = `
  {
    "global": null,
    "org:1": "global",
    "course:1": "org:1",
    "course:2": "org:1",
    "section:1a": "course:1",
    "section:1b": "course:1",
    "section:2a": "course:2"
  }
`;

const userRoles = `
  {
    "alice": {
      "section:1a": 0
    },
    "bob": {
      "section:1b": 0,
      "course:2": 2
    },
    "charlie": {
      "course:1": 1,
      "section:2a": 2
    },
    "david": {
      "course:2": 1
    },
    "edith": {
      "org:1": 3
    }
  }
`;

const roles = `
  [
    {
      "name": "Student",
      "permissions": ["view module items", "view my grades"]
    },
    {
      "name": "Prof",
      "permissions": ["view module items", "present", "assign", "view all grades", "edit all grades"]
    },
    {
      "name": "TA",
      "permissions": ["view module items", "present", "assign"]
    },
    {
      "name": "Department Head",
      "permissions": ["view module items", "view all grades"]
    }
  ]
`;

export const makeBundle = () => {
  const stream = tar.pack();

  const addFile = (name: string, contents: string) =>
    new Promise((resolve, reject) => {
      const entry = stream.entry({ name }, contents, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  
  addFile('authz.rego', authz).then(() =>
    addFile('authz_test.rego', authzTest).then(() =>
      addFile('roles/data.json', roles).then(() =>
        addFile('user_roles/data.json', userRoles).then(() =>
          addFile('scope_parent/data.json', scopeParent).then(() =>
            stream.finalize()
          )
        )
      )
    )
  );

  return stream.pipe(zlib.createGzip());
};

router.get('/bundle.tgz', (req: Request, res: Response) => {
  const tgz = makeBundle();
  res.set('Content-Type', 'application/gzip');
  res.set('Content-Disposition', 'attachment; filename="bundle.tgz"');
  tgz.pipe(res);
});

export default router;
