import { CategoryRepository } from './category.repository';

export class CategoryService {
  private categoryRepo = new CategoryRepository();

  async getCategories(tenantId: string, includeArchived = false) {
    return await this.categoryRepo.findAll(tenantId, includeArchived);
  }

  async getCategoryById(id: string, tenantId: string) {
    const category = await this.categoryRepo.findById(id, tenantId);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async createCategory(tenantId: string, data: { name: string; description?: string }) {
    const existing = await this.categoryRepo.findByName(data.name, tenantId);
    if (existing) {
      throw new Error('Category with this name already exists');
    }
    return await this.categoryRepo.create({ tenantId, ...data });
  }

  async updateCategory(id: string, tenantId: string, data: { name?: string; description?: string; is_archived?: boolean }) {
    await this.getCategoryById(id, tenantId);
    if (data.name) {
      const existing = await this.categoryRepo.findByName(data.name, tenantId);
      if (existing && existing.id !== id) {
        throw new Error('Another category with this name already exists');
      }
    }
    await this.categoryRepo.update(id, tenantId, data);
    return await this.getCategoryById(id, tenantId);
  }

  async archiveCategory(id: string, tenantId: string) {
    await this.getCategoryById(id, tenantId);
    await this.categoryRepo.update(id, tenantId, { is_archived: true });
    return { message: 'Category archived successfully' };
  }

  async deleteCategory(id: string, tenantId: string) {
    const category = await this.getCategoryById(id, tenantId);
    if (category.products && category.products.length > 0) {
      throw new Error('Cannot delete category containing products. Archive it instead.');
    }
    await this.categoryRepo.delete(id, tenantId);
    return { message: 'Category deleted successfully' };
  }
}