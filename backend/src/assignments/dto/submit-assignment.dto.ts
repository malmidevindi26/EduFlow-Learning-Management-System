import { IsOptional, IsString } from 'class-validator';

export class SubmitAssignmentDto{
  @IsOptional()
  @IsString()
  answerText?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}