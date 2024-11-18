import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { RolesService } from '../services/roles.service';

@Controller('roles')
export class RolesController {
    constructor(private rolesService: RolesService) {}

    // roles
    @Get('/')
    findAllRoles() {
        return this.rolesService.findAllRoles();
    }

    @Delete('delete/:id')
    removeRole(@Param('id') id: number) {
        return this.rolesService.deleteRole(+id);
    }

    @Post('/add-role')
    async createRole(
        @Body() roleCreateDto: any,
    ): Promise<any> {
        return this.rolesService.createRole(roleCreateDto);
    }

    @Post('/update-active-status/:role_id')
    async updateRoleStatus(
        @Param('role_id', ParseIntPipe) role_id: number,
    ): Promise<any> {
        return this.rolesService.updateRoleStatus(role_id);
    }

    @Post('/update-role/:role_id')
    async updateRole(
        @Param('role_id', ParseIntPipe) role_id: number,
        @Body() roleUpdateDto: any,
    ): Promise<any> {
        return this.rolesService.updateRole(role_id, roleUpdateDto);
    }
}
