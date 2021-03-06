import SyncServer, { SyncApi, SyncExpressMiddleWare, SyncOptions } from '@raincatcher/datasync-cloud';
import * as Promise from 'bluebird';
import { GlobalMongoDataHandler } from './MongoDataHandler';

const sync = SyncServer;

// Enable sync debug logs
process.env.DEBUG = 'fh-mbaas-api:sync';

// Sync connection options
const connectOptions: SyncOptions = {
  datasetConfiguration: {
    mongoDbConnectionUrl: process.env.MONGO_CONNECTION_URL || 'mongodb://127.0.0.1:27017/raincatcher',
    mongoDbOptions: {},
    redisConnectionUrl: process.env.REDIS_CONNECTION_URL || 'redis://127.0.0.1:6379'
  },
  globalSyncOptions: { useCache: false }
};

/**
 * Promise wrapper for sync api connect method
 * @return promise
 * @see SyncApi.connect
 */
export function connect() {
  return new Promise(function(resolve, reject) {
    sync.connect(connectOptions, function(err, mongo, redis) {
      if (err) {
        return reject(err);
      }
      if (!mongo) {
        return reject('Missing mongo client');
      }
      const handler = new GlobalMongoDataHandler(mongo);
      handler.initGlobalHandlers();
      return resolve({ mongo, redis });
    });
  });
}
