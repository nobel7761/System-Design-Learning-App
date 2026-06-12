import { Controller, Get } from '@nestjs/common';
import { CurriculumService } from './curriculum.service';

@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Get()
  getWorlds() {
    return this.curriculumService.getWorlds();
  }
}
