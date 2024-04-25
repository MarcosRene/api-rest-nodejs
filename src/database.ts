import { Knex, knex as stupKnex } from 'knex'
import { env } from './env'

const connectionDatabaseURL =
  env.DATABASE_CLIENT === 'sqlite'
    ? {
        filename: env.DATABASE_URL,
      }
    : env.DATABASE_URL

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: connectionDatabaseURL,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const knex = stupKnex(config)
