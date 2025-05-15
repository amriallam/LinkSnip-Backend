import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Visit } from "../entities/visit.entity";
import { Url } from "src/url/entities/url.entity";

@Injectable()
export class VisitService {
    private readonly logger = new Logger(VisitService.name);
    constructor(
        @InjectRepository(Visit)
        private readonly visitRepository: Repository<Visit>,

        @InjectRepository(Url)
        private readonly urlRepository: Repository<Url>,
    ) { }

    async saveVisit(urlShortCode: string, ip: string): Promise<Visit> {
        const existing = await this.visitRepository.findOne({ where: { ipAddress: ip } });
        if (existing) {
            this.logger.log(`Visit already exists for IP: ${ip}`);
            return existing;
        }
        const url = await this.urlRepository.findOne({ where: { shortCode: urlShortCode } });
        if (!url) {
            this.logger.warn(`URL not found for shortCode: ${urlShortCode}`);
            throw new Error('URL not found');
        }
        const visit = this.visitRepository.create({ 
            ipAddress: ip,
            url: url
        });
        const saved = await this.visitRepository.save(visit);
        this.logger.log(`Saved new visit for shortCode: ${urlShortCode}, IP: ${ip}`);
        return saved;
    }

    async getVisitsByUrlCode(urlShortCode: string): Promise<Visit[]> {
        return this.visitRepository.find({ 
            where: { url: { shortCode: urlShortCode } },
            relations: ['url']
        });
    }

    async getVisitCountByUrlCode(urlShortCode: string): Promise<number> {
        return this.visitRepository.count({ 
            where: { url: { shortCode: urlShortCode } }
        });
    }

    async getVisitCountsByShortCodes(shortCodes: string[]): Promise<{ shortCode: string, visitCount: number }[]> {
        if (!shortCodes.length) return [];
        const results = await this.visitRepository
            .createQueryBuilder('visit')
            .leftJoin('visit.url', 'url')
            .select('url.shortCode', 'shortCode')
            .addSelect('COUNT(visit.id)', 'visitCount')
            .where('url.shortCode IN (:...shortCodes)', { shortCodes })
            .groupBy('url.shortCode')
            .getRawMany();
        const resultMap = new Map(results.map(r => [r.shortCode, parseInt(r.visitCount, 10)]));
        return shortCodes.map(shortCode => ({
            shortCode,
            visitCount: resultMap.get(shortCode) || 0
        }));
    }
}
