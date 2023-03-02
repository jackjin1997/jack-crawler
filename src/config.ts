import { config } from "dotenv";

config();

// ELASTICSEARCH
export const ELASTIC_URL = process.env.ELASTIC_URL;
export const ELASTIC_USER = process.env.ELASTIC_USER!;
export const ELASTIC_PASSWORD = process.env.ELASTIC_PASSWORD!;

// OPEN SEARCH 配置
export const OPEN_SEARCH_URL = process.env.OPEN_SEARCH_URL;
export const ERROR_LOG_INDEX = process.env.ERROR_LOG_INDEX!;
export const EVENT_TRACE_INDEX = process.env.EVENT_TRACE_INDEX!;
export const INDEX_PREFIX = process.env.INDEX_PREFIX!;

export const XINGYE_URL = process.env.XINGYE_URL!;
