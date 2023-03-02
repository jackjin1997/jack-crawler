export type BaseRawType = {
  rowNumber?: number;
};

export type RawDataType = BaseRawType & {
  eventName: string;
  status: statusType;
  migratedToOs: boolean;
};

export type PESourceRawDataType = BaseRawType & {
  productionName: string;
  productionCode: string;
  unitValue: number;
};

export type MatchResultType = RawDataType & {
  typeFields: propertiesType;
  matchedStatus: statusType;
};

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
