import { IsOptional, IsString, Matches } from 'class-validator';

export class SubmitAssignmentDto{
  @IsOptional()
  @IsString()
  answerText?: string;

  @IsOptional()
  @Matches(/^\/uploads\/[A-Za-z0-9._-]+$/, {
  message: 'fileUrl must be a file uploaded through /api/uploads',
  })
  fileUrl?: string;
}