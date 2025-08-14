import { TagRepository } from "../repositories/tag.repository";
import { TagDtoInput } from "../dtos/tag.dto";
import { tag } from "@prisma/client";



export class TagService{
    constructor(private TagRepo: TagRepository){}

    async createTag(data: TagDtoInput): Promise<tag> {
        const existingTag = await this.TagRepo.findByName(data.tag);
        if(existingTag){
            throw new Error(`Tag '${data.tag}' already exists.`);
        }
        return this.TagRepo.create(data)

    }
    async getAllTags(): Promise<tag[]> { 
        return this.TagRepo.getAll();  

  }
     async getTagsById(id: number): Promise<tag> {
        const tag = await this.TagRepo.getById(id);
        if (!tag) {
            throw new Error(`Tag with id '${id}' not found.`);
        }
        return tag;
    }

    async updateTag(id: number, data: { tag: string }): Promise<tag> {
        const existing = await this.TagRepo.findByName(data.tag);

        if (existing && existing.tag_id !== id) {
            throw new Error(`Tag '${data.tag}' already exists.`);
        }

        return this.TagRepo.updateTag(id, data);
    }   
    
}