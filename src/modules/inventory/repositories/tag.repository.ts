import { PrismaClient } from "@prisma/client";
import { tag } from "@prisma/client";
import { TagDtoInput } from "../dtos/tag.dto";


export class TagRepository{
    constructor(private prisma: PrismaClient){}

    async findByName(tag: string){
        return this.prisma.tag.findUnique({
            where:{tag},
        })
    }

    async create(data: TagDtoInput):Promise<tag>{
        return this.prisma.tag.create({data});
    }

    
    async getAll():Promise<tag[]>{
        return this.prisma.tag.findMany({});
    }
    async getById(id: number): Promise<tag | null> {
        return this.prisma.tag.findUnique({
            where: { tag_id: id },
        });
    }

    async updateTag(id: number, data: { tag: string }): Promise<tag> {
        return this.prisma.tag.update({
            where: { tag_id: id },
            data,
    });
    }
};