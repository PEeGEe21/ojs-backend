import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/typeorm/entities/Role';
import { Repository } from 'typeorm';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async seedRoles() {
    const roles = [
      { id: 1, name: 'Admin' },
      { id: 2, name: 'Reader' },
      { id: 3, name: 'Author' },
      { id: 4, name: 'Editor' },
    ];

    // Check if the roles already exist
    for (const role of roles) {
      const existingRole = await this.roleRepository.findOne({ where: { id: role.id } });
      if (!existingRole) {
        const newRole = this.roleRepository.create(role);
        await this.roleRepository.save(newRole);
        console.log(`Role ${role.name} has been seeded`);
      }
    }

    console.log('Roles seeding completed');
  }
}
