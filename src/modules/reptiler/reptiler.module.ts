import { Module } from '@nestjs/common';
import { ReptilerController } from './reptiler.controller';
import { ReptilerService } from './reptiler.service';

@Module({
  controllers: [ReptilerController],
  providers: [ReptilerService],
  exports: [],
})
export class ReptilerModule {}
