import { IsDateString, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min,} from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  dueDate: string;

  @IsInt()
  @Min(1)
  @Max(1000)
  maxMarks: number;
}