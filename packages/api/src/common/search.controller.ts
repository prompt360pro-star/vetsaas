import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(AuthGuard('jwt'))
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Request() req: any, @Query('q') query: string) {
    const results = await this.searchService.search(req.user.tenantId, query);
    return { success: true, data: results };
  }
}
