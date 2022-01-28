import { IsEmail, IsString } from 'class-validator';

export class createUserDto {
    @IsString()
    email: string;

    @IsString()
    password: string;
}