import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnimalEntity } from "../animals/animal.entity";
import { TutorEntity } from "../tutors/tutor.entity";
import { ClinicalRecordEntity } from "../records/clinical-record.entity";
import { SearchService } from "./search.service";
import { SearchController } from "./search.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([AnimalEntity, TutorEntity, ClinicalRecordEntity]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
