import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EventsService } from './events.service';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List active events (upcoming first)' })
  async findAll() {
    return this.eventsService.findAllPublic();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single active event' })
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOnePublic(id);
  }
}
