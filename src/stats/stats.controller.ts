import { Controller, Get, Param, NotFoundException, Query } from "@nestjs/common";
import { UrlWithVisitCountResponseDto } from "src/url/dto/url-with-visit-count-response-dto";
import { UrlService } from "src/url/services/url.service";
;
@Controller('stats')
// @UseGuards(AuthGuard) // For Future Stats / Analytics Flow
export class StatsController {
    constructor(private readonly urlService: UrlService) { }

    @Get()
    async getUrlsWithVisitCounts(@Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<UrlWithVisitCountResponseDto[]> {
        const skip = (page - 1) * limit;
        const take = limit;

        const urlsWithVisitCounts = await this.urlService.getUrlsWithVisitCountsPaginated(skip, take);

        return urlsWithVisitCounts;
    }

    @Get('url/:shortCode')
    async getUrlAndCount(@Param('shortCode') shortCode: string): Promise<UrlWithVisitCountResponseDto> {
        const urlWithCount = await this.urlService.getUrlAndCount(shortCode);
        if (!urlWithCount) {
            throw new NotFoundException(`URL not found`);
        }
        return urlWithCount;
    }
}