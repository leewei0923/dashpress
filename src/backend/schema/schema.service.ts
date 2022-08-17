import { introspect, Entity } from "@adminator/bacteria";
import {
  CredentialsService,
  credentialsService,
} from "backend/credentials/credentials.service";
import { CREDENTIALS_DOMAINS } from "backend/credentials/crendential.types";
import { IDBCredentials, IDBSchema, IEntityField } from "shared/types";
import {
  createConfigDomainPersistenceService,
  AbstractConfigDataPersistenceService,
} from "../lib/config-persistence";

export class SchemasService {
  private dbSchema: IDBSchema[];

  constructor(
    private _schemaConfigDataPersistenceService: AbstractConfigDataPersistenceService<IDBSchema>,
    private _credentialsService: CredentialsService
  ) {}

  private async loadDbSchema(): Promise<IDBSchema[]> {
    if (this.dbSchema) {
      return this.dbSchema;
    }
    const dbCredentials =
      await this._credentialsService.getDomainCredentials<IDBCredentials>(
        CREDENTIALS_DOMAINS.database
      );

    const schema = await introspect({
      databaseType: dbCredentials.databaseType,
      host: dbCredentials.host,
      password: dbCredentials.password,
      schemaNames: ["public"],
      database: dbCredentials.database,
      port: dbCredentials.port,
      ssl: dbCredentials.ssl,
      user: dbCredentials.user,
    });

    this.dbSchema = this.formatIntrospectData(schema);

    this._schemaConfigDataPersistenceService.saveAllItems(
      "name",
      this.dbSchema
    );

    return this.dbSchema;
  }

  private formatIntrospectData(rawEntity: Entity[]): IDBSchema[] {
    const dbSchema = rawEntity.map((entity) => {
      return {
        name: entity.name,
        fields: entity.columns.map((column) => {
          const column$: IEntityField = {
            name: column.options.name,
            isRequired: column.options.nullable ? true : undefined,
            length: column.options.length,
            isId: column.primary ? true : undefined,
            isReference: column.isUsedInRelationAsOwner ? true : undefined,
            type: column.options.enum
              ? "enum"
              : (column.tscType.toLocaleLowerCase() as IEntityField["type"]),
            enumeration: column.options.enum,
          };
          return column$;
        }),
        relations: entity.relations.map((relation) => {
          const relation$: IDBSchema["relations"][0] = {
            table: relation.relatedTable,
            relationType: relation.relationType,
            joinColumnOptions: relation.joinColumnOptions,
          };
          return relation$;
        }),
        uniqueFields: entity.indices
          .filter((index) => index.options.unique)
          .map((index) => index.columns),
      } as IDBSchema;
    });
    dbSchema.sort((a, b) => a.name.localeCompare(b.name));
    return dbSchema;
  }

  async getDBSchema(): Promise<IDBSchema[]> {
    return await this.loadDbSchema();
  }
}

const schemaPersistenceService =
  createConfigDomainPersistenceService<IDBSchema>("schema");

export const schemasService = new SchemasService(
  schemaPersistenceService,
  credentialsService
);