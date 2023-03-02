import {
  ELASTIC_PASSWORD,
  ELASTIC_USER,
  ELASTIC_URL,
  OPEN_SEARCH_URL,
} from "../../config";
import { Client as OsClient } from "@opensearch-project/opensearch";
import { Client as EsClient } from "@elastic/elasticsearch";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SearchEngineRepository {
  private client;
  private usingElastic = true;

  constructor() {
    if (ELASTIC_URL) {
      this.client = new EsClient({
        node: ELASTIC_URL,
        auth: { username: ELASTIC_USER, password: ELASTIC_PASSWORD },
      });
    } else if (OPEN_SEARCH_URL) {
      this.usingElastic = false;
      this.client = new OsClient({
        node: OPEN_SEARCH_URL,
        ssl: {
          // todo opensearch证书
          rejectUnauthorized: false,
        },
      });
      // } else {
      //   throw new Error("Cannot found search engine config!");
    }
  }

  async getMapping() {
    if (this.usingElastic) {
      return await this.client.indices.getMapping();
    } else {
      const { body: result } = await this.client.indices.getMapping();
      return result;
    }
  }
}
