import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TenantEntity } from "./tenant.entity";

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly repo: Repository<TenantEntity>,
  ) {}

  async create(data: Partial<TenantEntity>): Promise<TenantEntity> {
    const tenant = this.repo.create({
      ...data,
      settings: {
        currency: "AOA",
        timezone: "Africa/Luanda",
        locale: "pt-AO",
        appointmentDuration: 30,
        workingHoursStart: "08:00",
        workingHoursEnd: "18:00",
        workingDays: [1, 2, 3, 4, 5],
        allowOnlineBooking: false,
        allowTeleconsult: false,
        ...(data.settings || {}),
      },
    });
    return this.repo.save(tenant);
  }

  async findById(id: string): Promise<TenantEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<TenantEntity | null> {
    return this.repo.findOne({ where: { slug } });
  }

  async update(
    id: string,
    data: Partial<TenantEntity>,
  ): Promise<TenantEntity | null> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this.repo.update(id, data);
    return this.findById(id);
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
}
