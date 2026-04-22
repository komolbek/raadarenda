import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { MulticardService } from './multicard.service';

@Module({
  controllers: [PaymentsController],
  providers: [MulticardService],
  exports: [MulticardService],
})
export class PaymentsModule {}
