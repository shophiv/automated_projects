import { CategoryRepository } from './category.repository';

export class CategoryService {
  private categoryRepo: CategoryRepository;

  constructor() {
    this.categoryRepo = new CategoryRepository();
  }

  async getCategories(tenantId: string) {
    return await this.categoryRepo.findAll(tenantId);
  }

  async createCategory(tenantId: string, data: { name: string; description?: string; status?: string }) {
    return await this.categoryRepo.create(tenantId, data.name, data.description, data.status);
  }

  async updateCategory(tenantId: string, id: string, data: { name: string; description?: string; status?: string }) {
    const existing = await this.categoryRepo.findById(tenantId, id);
    if (!existing) {
      const err: any = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }
    return await this.categoryRepo.update(tenantId, id, data.name, data.description, data.status);
  }

  async deleteCategory(tenantId: string, id: string) {
    const existing = await this.categoryRepo.findById(tenantId, id);
    if (!existing) {
      const err: any = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }
    return await this.categoryRepo.delete(tenantId, id);
  }
}