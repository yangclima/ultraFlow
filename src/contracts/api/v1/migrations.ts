export type MigrationPublicObject = {
  name: string;
  path: string;
  timestamp: number;
};

export type MigrationsGetResponse = MigrationPublicObject[];

export type MigrationsPostResponse = MigrationPublicObject[];
