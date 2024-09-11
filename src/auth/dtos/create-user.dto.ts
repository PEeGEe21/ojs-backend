export class CreateUserDto {
  email: string;
  password: string;
  fname?: string;
  lname?: string;
  username?: string;
  cpassword?: string;
  signup_as?: number;
}
