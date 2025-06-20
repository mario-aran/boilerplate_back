import { HTTP_STATUS } from '@/constants/http-status';
import { db } from '@/lib/drizzle/db';
import {
  userRolesTable,
  userRolesToPermissionsTable,
} from '@/lib/drizzle/schemas';
import { queryPaginatedData } from '@/lib/drizzle/utils/query-paginated-data';
import {
  GetAllUserRoles,
  UpdateUserRole,
  UserRoleId,
} from '@/lib/zod/schemas/user-roles.schema';
import { HttpError } from '@/utils/http-error';
import { eq, ilike } from 'drizzle-orm';

class UserRolesService {
  public getAll = async ({
    limit,
    page,
    sort,
    search = '',
  }: GetAllUserRoles) => {
    return queryPaginatedData({
      schema: userRolesTable,
      filters: ilike(userRolesTable.id, `%${search}%`),
      limit,
      page,
      sort,
    });
  };

  public get = async ({ id }: UserRoleId) => {
    const record = await db.query.userRolesTable.findFirst({
      with: { userRolesToPermissions: { columns: { permissionId: true } } },
      where: eq(userRolesTable.id, id),
    });
    if (!record) throw this.generateNotFoundError();

    // Flatten info
    const { userRolesToPermissions, ...restOfRecord } = record;
    return {
      ...restOfRecord,
      permissionIds: userRolesToPermissions.map(
        ({ permissionId }) => permissionId,
      ),
    };
  };

  public update = async (
    { id }: UserRoleId,
    { permissionIds, ...restOfData }: UpdateUserRole,
  ) => {
    return db.transaction(async (tx) => {
      // Update values
      const [updatedRecord] = await tx
        .update(userRolesTable)
        .set(restOfData)
        .where(eq(userRolesTable.id, id))
        .returning();
      if (!updatedRecord) throw this.generateNotFoundError();

      if (permissionIds) {
        // Remove all existing permissions for this role
        await tx
          .delete(userRolesToPermissionsTable)
          .where(eq(userRolesToPermissionsTable.userRoleId, id));

        // Add new permissions for this role
        await tx.insert(userRolesToPermissionsTable).values(
          permissionIds.map((permissionId) => ({
            userRoleId: id,
            permissionId,
          })),
        );
      }

      return updatedRecord;
    });
  };

  private generateNotFoundError = () =>
    new HttpError({
      message: 'User role not found',
      httpStatus: HTTP_STATUS.NOT_FOUND,
    });
}

export const userRolesService = new UserRolesService();
