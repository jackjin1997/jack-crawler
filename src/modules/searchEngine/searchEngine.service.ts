import { Injectable, Logger } from "@nestjs/common";
import { statusType } from "src/app.service";
import { SearchEngineRepository } from "./searchEngine.repository";
type typeFieldsType = {
  [key: string]: string;
};
type esDataType = {
  // rowNumber: number,
  eventName: string;
  matchedStatus: statusType;
  migratedToOs: boolean;
  typeFields: typeFieldsType;
};
export type esDataMapType = Map<string, esDataType>;

@Injectable()
export class SearchEngineService {
  constructor(
    private readonly searchEngineRepository: SearchEngineRepository
  ) {}

  async getAllFieldInIndex(): Promise<esDataMapType> {
    const result = await this.searchEngineRepository.getMapping();
    let types = {};
    for (const index in result) {
      if (result[index].mappings?.properties) {
        types = {
          ...types,
          ...result[index].mappings.properties,
        };
      }
    }
    return this._fromRawMapping(types);
  }

  private _fromRawMapping(rawData: object): esDataMapType {
    const result: esDataMapType = new Map();
    for (const index in rawData) {
      const typeFields: typeFieldsType = {};
      for (const property in rawData[index].properties) {
        typeFields[property] = rawData[index].properties[property].type;
      }
      result.set(index, {
        eventName: index,
        matchedStatus: "正常",
        migratedToOs: true,
        typeFields,
      });
    }
    return result;
  }
}
