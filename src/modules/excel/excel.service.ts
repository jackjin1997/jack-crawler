import { BadRequestException, Injectable } from '@nestjs/common';
import * as ExcelJs from 'exceljs';
import * as _ from 'lodash';
import { timeUtils } from 'src/common/time.utils';
import {
  esDataMapType,
  SearchEngineService,
} from '../searchEngine/searchEngine.service';
import {
  MatchResultType,
  PESourceRawDataType,
  RawDataType,
  statusType,
} from './dto/excel.type';

const regEn = /[`~!@#$%^&*()+=<>?:"{},.\/\\;'[\]]/im,
  regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im,
  regSpace = /\s/;
let rawDataInCache;
// let rawDataMapInCache;
let dateInCache;

@Injectable()
export class ExcelService {
  constructor(private readonly searchEngineService: SearchEngineService) {}

  async uploadPrivateEquity(buffer: Buffer): Promise<void> {
    const { rawData, rawDataMap } = await this._getPESourceRawData(buffer);
    rawDataInCache = rawData;
    // rawDataMapInCache = rawDataMap;
  }

  async generatePEStatistic(buffer: Buffer): Promise<Buffer> {
    if (!rawDataInCache) throw new BadRequestException('请先上传私募产品净值');
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.load(buffer);
    workbook.eachSheet((workSheet) => {
      // const data = rawDataMapInCache.get(
      //   workSheet.getRow(1).getCell(2).value.toString(),
      // ); // get中加include
      const productionNameInSheet = workSheet
        .getRow(1)
        .getCell(2)
        .value?.toString();
      if (productionNameInSheet) {
        const data = rawDataInCache.find((item) =>
          item.productionName.includes(productionNameInSheet),
        );
        if (data) {
          workSheet.addRow([dateInCache, data.unitValue]); // excel下面加row
        }
      }
    });
    await workbook.xlsx.writeFile('eventMatched.xlsx');
    // const data = await workbook.xlsx.writeBuffer();
    // return new Blob([data], {
    //   type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // });
    return (await workbook.xlsx.writeBuffer()) as any;
  }

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

  private async _getPESourceRawData(buffer: Buffer): Promise<{
    rawData: PESourceRawDataType[];
    rawDataMap: Map<string, PESourceRawDataType>;
  }> {
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.load(buffer);
    const workSheet = workbook.getWorksheet(1);
    const rawData: PESourceRawDataType[] = [];
    const rawDataMap = new Map<string, PESourceRawDataType>();
    dateInCache = timeUtils.formDate(
      workSheet.getRow(2).getCell(6).value.toString()?.slice(4),
    ); // 截取时间
    workSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 2 && row.getCell(1)) {
        // 第一列是1而不是0
        const cur = {
          rowNumber,
          productionName: row.getCell(2).value.toString(),
          productionCode: row.getCell(3).value.toString(),
          unitValue: Number(row.getCell(6).value),
        };
        rawData.push(cur);
        rawDataMap.set(cur.productionName, cur);
      }
    });
    return { rawData, rawDataMap };
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
