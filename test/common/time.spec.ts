import { timeUtils } from 'src/common/time.utils';

describe('time utils', () => {
  it('should be defined', () => {
    expect(timeUtils.formDate('单位净值2023-01-13')).toEqual('');
  });
});
