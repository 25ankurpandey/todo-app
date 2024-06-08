import { ReqContextManager } from "../context/ReqContextManager";
import { Logger } from "../logging/Logger";
import * as _ from "lodash";
import { CacheConfig } from "../../interfaces/Configs";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Aerospike = require("aerospike");

type AerospikeDefaultPolicies = {
  globalCommandQueuePolicy?: GlobalCommandQueuePolicy;
  maxConnsPerNode?: number;
  clientPolicies?: AeroPolicies;
};

type GlobalCommandQueuePolicy = {
  maxCommandsInProcess: number;
  maxCommandsInQueue: number;
};

type AeroPolicies = any;

const AEROSPIKE_MAX_CONN_PER_NODE: number = parseInt(
  _.get(process.env, "AEROSPIKE_MAX_CONN_PER_NODE", "100"),
  10
);
const AEROSPIKE_READ_POLICY_TIMEOUT: number = parseInt(
  _.get(process.env, "AEROSPIKE_READ_POLICY_TIMEOUT", "10000"),
  10
);

const AEROSPIKE_READ_POLICY_SOCKET_TIMEOUT = parseInt(
  _.get(process.env.AEROSPIKE_WRITE_POLICY_SOCKET_TIMEOUT, "1000"),
  10
);
const AEROSPIKE_READ_POLICY_MAX_RETRIES = parseInt(
  _.get(process.env.AEROSPIKE_WRITE_POLICY_MAX_RETRIES, "5"),
  10
);
const AEROSPIKE_BATCH_POLICY_TIMEOUT: number = parseInt(
  _.get(process.env, "AEROSPIKE_BATCH_POLICY_TIMEOUT", "10000"),
  10
);

const AEROSPIKE_WRITE_POLICY_TIMEOUT = parseInt(
  _.get(process.env, "AEROSPIKE_WRITE_POLICY_TIMEOUT", "10000"),
  10
);
const AEROSPIKE_WRITE_POLICY_SOCKET_TIMEOUT = parseInt(
  _.get(process.env, "AEROSPIKE_WRITE_POLICY_SOCKET_TIMEOUT", "1000"),
  10
);
const AEROSPIKE_WRITE_POLICY_MAX_RETRIES = parseInt(
  _.get(process.env, "AEROSPIKE_WRITE_POLICY_MAX_RETRIES", "5"),
  10
);

const MAX_COMMANDS_IN_PROCESS = parseInt(
  _.get(process.env, "MAX_COMMANDS_IN_PROCESS", "10"),
  10
);
const MAX_COMMANDS_IN_QUEUE = parseInt(
  _.get(process.env, "MAX_COMMANDS_IN_QUEUE", "50"),
  10
);

export class AerospikeAdapter {
  private static IS_CACHE_INITIALIZED = false;

  private static clientPolicies: AeroPolicies;

  private static maxConnectionsPerNode: number;

  private static aerospikeClient: any = {};
  private static ns: any = {};
  private static setPrefix: any = {};


  /**
   * Initializes the AerospikeAdapter. Call this method before
   * you invoke any other methods in this class.
   * @param cacheConfig: CacheConfig
   * @param cacheCreds: CacheCreds
   * @param config: AerospikeDefaultPolicies
   */
  public static async init(cacheConfig: CacheConfig, config: AerospikeDefaultPolicies): Promise<void> {
    AerospikeAdapter.processConfigs(config);

    await AerospikeAdapter.createAerospikeConn(cacheConfig);
    AerospikeAdapter.IS_CACHE_INITIALIZED = true;
  }

  static processConfigs(config: AerospikeDefaultPolicies) {
    const queuePolicy: GlobalCommandQueuePolicy = {
      maxCommandsInProcess: MAX_COMMANDS_IN_PROCESS,
      maxCommandsInQueue: MAX_COMMANDS_IN_QUEUE,
    };

    Object.assign(queuePolicy, config?.globalCommandQueuePolicy);
    Aerospike.setupGlobalCommandQueue(queuePolicy);

    AerospikeAdapter.maxConnectionsPerNode =
      config?.maxConnsPerNode || AEROSPIKE_MAX_CONN_PER_NODE;

    const clientPolicy: AeroPolicies = {
      read: new Aerospike.ReadPolicy({
        totalTimeout: AEROSPIKE_READ_POLICY_TIMEOUT,
        replica: Aerospike.policy.replica.RANDOM,
        maxRetries: AEROSPIKE_READ_POLICY_MAX_RETRIES,
        socketTimeout: AEROSPIKE_READ_POLICY_SOCKET_TIMEOUT,
      }),
      write: new Aerospike.WritePolicy({
        totalTimeout: AEROSPIKE_WRITE_POLICY_TIMEOUT,
        socketTimeout: AEROSPIKE_WRITE_POLICY_SOCKET_TIMEOUT,
        maxRetries: AEROSPIKE_WRITE_POLICY_MAX_RETRIES,
      }),
      batch: new Aerospike.BatchPolicy({
        totalTimeout: AEROSPIKE_BATCH_POLICY_TIMEOUT,
      }),
    };

    Object.assign(clientPolicy, config?.clientPolicies);
    AerospikeAdapter.clientPolicies = clientPolicy;
  }

  static async createAerospikeConn(cacheConfig: CacheConfig): Promise<void> {
      AerospikeAdapter.aerospikeClient = { conn: null };
      AerospikeAdapter.ns = _.get(
        cacheConfig,
        "namespace"
      );
      AerospikeAdapter.setPrefix = cacheConfig.set_prefix;
      AerospikeAdapter.aerospikeClient.conn = await Aerospike.connect(
        {
          hosts: getHostsFromStr(cacheConfig.host),
          policies: AerospikeAdapter.clientPolicies,
          maxConnsPerNode: AerospikeAdapter.maxConnectionsPerNode,
        }
      );
      AerospikeAdapter.aerospikeClient.conn.on("disconnected", () => {
        Logger.info(
          "---------------------Client got disconnected from cluster---------------------"
        );
      });

    Logger.info("Aerospike Connection Initialised");
  }

  public static async getKey(set_name: string, key: string, tenant_id?: string) {
    if (!AerospikeAdapter.IS_CACHE_INITIALIZED) {
      throw new Error("Cache is not initilized, please use init first");
    }
    const fullSetName = AerospikeAdapter.setPrefix + set_name;
    return new Aerospike.Key(
      AerospikeAdapter.ns,
      fullSetName,
      `${key}`
    );
  }

  public static async set(key: string, bin: any, ttl: any, tenant_id?: string) {
    if (!AerospikeAdapter.IS_CACHE_INITIALIZED) {
      throw new Error("Cache is not initilized, please use init first");
    }
    const meta = { ttl };
    const value = { key, value: JSON.stringify(bin) };
    try {
      await AerospikeAdapter.aerospikeClient.conn.put(
        key,
        value,
        meta
      );
      return true;
    } catch (e) {
      Logger.error(e, "", "Error while inserting record into cache.");
      return false;
    }
  }

  public static async get(key: string, tenant_id?: string) {
    if (!AerospikeAdapter.IS_CACHE_INITIALIZED) {
      throw new Error("Cache is not initilized, please use init first");
    }
    try {
      const data = await AerospikeAdapter.aerospikeClient.conn.get(
        key
      );
      if (!data) {
        return data;
      }
      if (!data.bins) {
        return data;
      }
      const value = JSON.parse(data.bins.value);
      return value;
    } catch (err) {
      Logger.error(err, "", "Error fetching record from cache.");
      return null;
    }
  }

  public static async remove(key: string, tenant_id?: string) {
    if (!AerospikeAdapter.IS_CACHE_INITIALIZED) {
      throw new Error("Cache is not initilized, please use init first");
    }
    try {
      await AerospikeAdapter.aerospikeClient.conn.remove(key);
      return true;
    } catch (err) {
      Logger.error(err, "", "Error deleting record from cache.");
      return false;
    }
  }

  public static async getSetSize(setName: string): Promise<number> {
    if (!AerospikeAdapter.IS_CACHE_INITIALIZED) {
      throw new Error("Cache is not initialized, please use init first");
    }
    try {
      const aero_namespace = AerospikeAdapter.ns;
      const setPrefix = AerospikeAdapter.setPrefix;
      const fullSetName = `${setPrefix}${setName}`;
      let setSize = 0;  // Initialize the setSize to 0

      const scan = AerospikeAdapter.aerospikeClient.conn.scan(aero_namespace, fullSetName);
      scan.concurrent = true;  // Scans in parallel
      scan.nobins = true;
      const stream = scan.foreach();

      return new Promise((resolve, reject) => {
        stream.on("data", (record) => {
          setSize++;  // Increment count for each record
        });

        stream.on("error", (error) => {
          Logger.error(error, "", `Error while calculating set size for set: ${fullSetName}`);
          reject(error);  // Reject the promise on error
        });

        stream.on("end", () => {
          console.timeEnd("setsize");
          resolve(setSize);  // Resolve the promise with the count
        });
      });
    } catch (err) {
      Logger.error(err, "", "Error while calculating set size");
      throw err;
    }
  }

  public static async truncateSetbyName(setName: string): Promise<number> {
    if (!AerospikeAdapter.IS_CACHE_INITIALIZED) {
      throw new Error("Cache is not initialized, please use init first");
    }

    try {
      const aero_namespace = AerospikeAdapter.ns;
      const setPrefix = AerospikeAdapter.setPrefix;
      const fullSetName = `${setPrefix}${setName}`;
      let deleteCount = 0;

      const scan = AerospikeAdapter.aerospikeClient.conn.scan(aero_namespace, fullSetName);
      scan.concurrent = true;
      scan.nobins = true;
      const stream = scan.foreach();
      const deletePromises = []; // Array to hold promises for each delete operation

      return new Promise((resolve, reject) => {
        stream.on("data", (record) => {
          // Push the delete promise into the array
          const deletePromise = AerospikeAdapter.aerospikeClient.conn.remove(record.key)
            .then(() => deleteCount++)
            .catch((error) => console.error("Error during record deletion:", error));
          deletePromises.push(deletePromise);
        });

        stream.on("error", (error) => {
          Logger.error(error, "", `Error while clearing record from set: ${fullSetName}`);
          reject(error);  // Reject the promise on error
        });

        stream.on("end", async () => {
          // Wait for all delete operations to complete
          await Promise.all(deletePromises).then(() => {
            console.timeEnd("deletionTime");
            resolve(deleteCount);  // Resolve the promise with the delete count
          });
        });
      });
    } catch (err) {
      Logger.error(err, "", "Error while truncating set.");
      throw err;
    }
  }
}

function getHostsFromStr(hostStr: string) {
  return hostStr.split(",").map(host => {
    return {
      "addr": host.split(":")[0],
      "port": parseInt(hostStr.split(":")[1])
    };
  });

}

