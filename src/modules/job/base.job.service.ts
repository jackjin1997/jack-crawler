import { Logger } from '@nestjs/common';
import _ from 'lodash';
import { timeUtils } from '../../common/time.utils';

export abstract class BaseJobService {
  enabled = false;
  converted = 0;
  total = 0;

  // TODO 确定不会导致所有jobservice公用一个enabled？
  async execute(enabled: boolean, params?: object) {
    this.enabled = enabled;
    const result = {};
    this.total = 0;
    this.converted = 0;
    while (this.enabled) {
      const source = params ? await this.extract(params) : await this.extract();
      if (_.size(source) === 0) {
        this.enabled = false;
        break;
      }
      await this.iterate(source, result, params);
    }
    await this.final(result);
    const now = timeUtils.formTime(new Date());
    Logger.log(`---------------finished in ${now}----------------`);
    return result;
  }

  abstract extract(params?: object): Promise<any>;
  abstract iterate(source: any, result?: any, params?: any): Promise<void>;
  abstract final(result?: object): Promise<any>;
}
