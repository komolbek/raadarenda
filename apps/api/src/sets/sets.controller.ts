import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SetsService } from './sets.service';

@ApiTags('Sets')
@Controller('sets')
export class SetsController {
  constructor(private readonly setsService: SetsService) {}

  @Get()
  @ApiOperation({ summary: 'List active sets (bundles) with their products' })
  async findAll() {
    return this.setsService.findAllPublic();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single active set' })
  async findOne(@Param('id') id: string) {
    return this.setsService.findOnePublic(id);
  }
}
