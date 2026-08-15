import { Module } from '@nestjs/common';
import { SetsController } from './sets.controller';
import { AdminSetsController } from './admin-sets.controller';
import { SetsService } from './sets.service';

@Module({
  controllers: [SetsController, AdminSetsController],
  providers: [SetsService],
})
export class SetsModule {}
