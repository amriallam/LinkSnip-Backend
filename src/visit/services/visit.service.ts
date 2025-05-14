import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Visit } from "../entities/visit.entity";
import { Url } from "src/url/entities/url.entity";

@Injectable()
export class VisitService {
    constructor(
        @InjectRepository(Visit)
        private readonly visitRepository: Repository<Visit>,

        @InjectRepository(Url)
        private readonly urlRepository: Repository<Url>,
    ) { }

    async saveVisit(urlShortCode: string, ip: string): Promise<Visit> {
        const existing = await this.visitRepository.findOne({ where: { ipAddress: ip } });
        if (existing) {
            return existing;
        }
        const url = await this.urlRepository.findOne({ where: { shortCode: urlShortCode } });
        if (!url) throw new Error('URL not found');
        const visit = this.visitRepository.create({ 
            ipAddress: ip,
            url: url
        });
        return this.visitRepository.save(visit);
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
}
