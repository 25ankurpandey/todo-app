import { Dialect, ReplicationOptions } from "sequelize";

export interface ServiceConfig {
	config_json: ConfigJson
}

export interface ConfigJson {
	db_config?: DbConfig,
	cache_config: CacheConfig,
}

export interface DbConfig {
	default?: DbConfigDefault,
	replica?: DbConfigReplica
}

export interface DbConfigDefault {
    host: string,
	port: number,
	username: string,
	password: string,
	database: string
	dialect?: Dialect,
	pool?: PoolOptions,
	dialectOptions?: {},
	timezone?: string,
	replication?: ReplicationOptions,
	logging?: boolean,
}

export interface DbConfigReplica {
	host: string,
	port: number,
    username: string,
	password: string,
	database: string
	dialect?: Dialect,
	pool?: PoolOptions,
	dialectOptions?: {},
	timezone?: string,
	replication?: ReplicationOptions,
	logging?: boolean,
}

interface PoolOptions {
	max: number, 
	min: number, 
	acquire: number, 
	idle: number
}

export interface CacheConfig {
	host: string;
	namespace: string,
	set_prefix: string
}

export interface HealthResponse {
	HOST: string;
	uptime: string;
	SLA: string;
	version: string;
	finalstatus: string;
	dependencies?: any;
}