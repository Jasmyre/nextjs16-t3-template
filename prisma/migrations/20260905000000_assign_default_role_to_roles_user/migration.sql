-- Assign the default USER role to every user that currently has no roles.
-- Guards against OAuth sign-ups created by the adapter before the
-- createUser event began assigning a default role.
INSERT INTO "_RoleToUser" ("A", "B")
SELECT
    role."id",
    "User"."id"
FROM "User"
CROSS JOIN "Role" AS role
WHERE role."name" = 'USER'
  AND NOT EXISTS (
    SELECT 1
    FROM "_RoleToUser" rt
    WHERE rt."B" = "User"."id"
  );
