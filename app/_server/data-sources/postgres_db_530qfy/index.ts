import { KnexPgAdapter } from '@kottster/server';
import knex from 'knex';

/**
 * Learn more at https://knexjs.org/guide/#configuration-options
 */
const client = knex({
  client: 'pg',
  connection: 'postgresql://neondb_owner:npg_D9eUICtoT5gl@ep-little-resonance-afho8bbs-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  searchPath: ['public'],
});

export default new KnexPgAdapter(client);