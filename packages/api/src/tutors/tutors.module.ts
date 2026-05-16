import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TutorEntity } from "./tutor.entity";
import { TutorsService } from "./tutors.service";
import { TutorsController } from "./tutors.controller";

@Module({
  imports: [TypeOrmModule.forFeature([TutorEntity])],
  controllers: [TutorsController],
  providers: [TutorsService],
  exports: [TutorsService],
})
export class TutorsModule {}
