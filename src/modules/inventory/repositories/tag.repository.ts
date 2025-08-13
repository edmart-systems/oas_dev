import { PrismaClient } from "@prisma/client";
import { Tag } from "@prisma/client";
import { TagDtoInput } from "../dtos/tag.dto";


export class TagRepository{
    constructor(private prisma: PrismaClient){}

    async findByName(tag: string){
        return this.prisma.tag.findUnique({
            where:{tag},
        })
    }

    async create(data: TagDtoInput):Promise<Tag>{
        return this.prisma.tag.create({data});
    }

    
    async getAll():Promise<Tag[]>{
        return this.prisma.tag.findMany({
            include: {
                creator: {
                    select: {
                        co_user_id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                Product: {
                    take: 5,
                    select: {
                        product_name: true
                    }
                }
            }
        });
    }
    async getById(id: number): Promise<Tag | null> {
        return this.prisma.tag.findUnique({
            where: { tag_id: id },
        });
    }

    async updateTag(id: number, data: { tag: string }): Promise<Tag> {
        return this.prisma.tag.update({
            where: { tag_id: id },
            data,
    });
    }
};