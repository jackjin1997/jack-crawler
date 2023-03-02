import { Test, TestingModule } from '@nestjs/testing';
import { ExcelController } from '../../src/modules/excel/excel.controller';
import { ExcelService } from '../../src/modules/excel/excel.service';

describe('ExcelController', () => {
  let controller: ExcelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExcelController],
      providers: [ExcelService],
    }).compile();

    controller = module.get<ExcelController>(ExcelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
