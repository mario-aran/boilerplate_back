import { PERMISSIONS } from '@/constants/permissions';
import { ROUTE_SEGMENTS } from '@/constants/routes';
import { usersController } from '@/controllers/users.controller';
import {
  createUserSchema,
  getAllUsersSchema,
  updateUserPasswordSchema,
  updateUserSchema,
  userIdSchema,
} from '@/lib/zod/schemas/users.schema';
import { authenticateWithPermission } from '@/middleware/authenticate-with-permission';
import { validateWithZod } from '@/middleware/validate-with-zod';
import { Router } from 'express';

export const usersRoute = Router();

// Route definitions
usersRoute.get(
  '/',
  authenticateWithPermission(PERMISSIONS.READ_USERS),
  validateWithZod({ query: getAllUsersSchema }),
  usersController.getAll,
);

usersRoute.get(
  ROUTE_SEGMENTS.ID,
  authenticateWithPermission(PERMISSIONS.READ_USER),
  validateWithZod({ params: userIdSchema }),
  usersController.get,
);

usersRoute.post(
  '/',
  validateWithZod({ body: createUserSchema }),
  usersController.create,
);

usersRoute.patch(
  ROUTE_SEGMENTS.ID,
  authenticateWithPermission(PERMISSIONS.UPDATE_USER),
  validateWithZod({ params: userIdSchema, body: updateUserSchema }),
  usersController.update,
);

usersRoute.patch(
  ROUTE_SEGMENTS.ID_PASSWORD,
  authenticateWithPermission(PERMISSIONS.UPDATE_USER_PASSWORD),
  validateWithZod({ params: userIdSchema, body: updateUserPasswordSchema }),
  usersController.updatePassword,
);
