import { Injectable } from '@nestjs/common';
import * as ExcelJs from 'exceljs';
import * as _ from 'lodash';
import {
  esDataMapType,
  SearchEngineService,
} from './modules/searchEngine/searchEngine.service';
export type statusType =
  | '正常'
  | '已弃用'
  | '待检查'
  | '需要补参数'
  | '未埋点'
  | '已过期'
  | 'os有但未整理'
  | '疑似注入攻击';
export type propertiesType = {
  [key: string]: string;
};
export type MatchResultType = RawDataType & {
  typeFields: propertiesType;
  matchedStatus: statusType;
};
type RawDataType = {
  rowNumber?: number;
  eventName: string;
  status: statusType;
  migratedToOs: boolean;
};
const regEn = /[`~!@#$%^&*()+=<>?:"{},.\/\\;'[\]]/im,
  regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im,
  regSpace = /\s/;

@Injectable()
export class AppService {
  constructor(private readonly searchEngineService: SearchEngineService) {}

  async checkIndexOnSearchEngine(buffer: Buffer): Promise<void> {
    const rawData: RawDataType[] = await this._getRawData(buffer);
    const rawDataMap = _.groupBy(rawData, 'eventName');
    const esResultMap: esDataMapType =
      await this.searchEngineService.getAllFieldInIndex();

    const matchResult: MatchResultType[] = [];
    for (const [index, value] of esResultMap) {
      const data = rawDataMap[index];
      if (data) {
        matchResult.push({
          ...data[0],
          ...value,
        });
      } else {
        const matchedStatus: statusType =
          regEn.test(index) || regCn.test(index) || regSpace.test(index)
            ? '疑似注入攻击'
            : '正常';
        matchResult.push({
          ...value,
          status: 'os有但未整理',
          matchedStatus,
        });
      }
    }

    await this._outputFile(buffer, matchResult);
  }

  /**
   * 获取excel中的数据并转化成相对标准格式。
   * @param buffer
   * @returns
   */
  private async _getRawData(buffer: Buffer): Promise<RawDataType[]> {
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.load(buffer);
    const workSheet = workbook.getWorksheet(2);
    const rawData: RawDataType[] = [];
    workSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && row.getCell(1))
        rawData.push({
          rowNumber,
          eventName: row.getCell(1).value.toString(),
          status: row.getCell(5).value.toString() as statusType, // 第一列是1而不是0
          migratedToOs: false,
        });
    });
    return rawData;
  }

  /**
   * 输出文件到指定地点
   * @param buffer
   * @param data
   */
  private async _outputFile(
    buffer: Buffer,
    data: MatchResultType[],
  ): Promise<void> {
    try {
      const workbook = new ExcelJs.Workbook();
      await workbook.xlsx.load(buffer);
      const workSheet = workbook.getWorksheet(2);
      for (const item of data) {
        if (item.rowNumber) {
          workSheet.getRow(item.rowNumber).getCell(9).value =
            item.matchedStatus;
          workSheet.getRow(item.rowNumber).getCell(10).value = JSON.stringify(
            item.typeFields,
          );
        } else {
          workSheet.addRow([
            item.eventName,
            '',
            '',
            '',
            item.status,
            ,
            '',
            item.migratedToOs,
            '',
            JSON.stringify(item.typeFields),
            item.matchedStatus,
          ]); // excel下面加row
        }
      }
      // const result = await workbook.xlsx.writeBuffer();
      await workbook.xlsx.writeFile('eventMatched.xlsx');
      // download到本地或上传至云服务器
      // await this.awsService.uploadFile(result, process.env.NODE_ENV+'/checkedCityList'+Date.now()+'.xlsx');
    } catch (e) {
      console.log(e);
    }
  }
}
