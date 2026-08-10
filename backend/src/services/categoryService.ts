import { CategoryRepository, Category } from '../repositories/categoryRepository';

export class CategoryService {
  static async createCategory(tenantId: string, data: { name: string; description?: string }): Promise<Category> {
    return CategoryRepository.create(tenantId, data);
  }

  static async getCategories(tenantId: string): Promise<Category[]> {
    return CategoryRepository.findAll(tenantId);
  }

  static async updateCategory(tenantId: string, id: string, data: { name?: string; description?: string; status?: string }): Promise<Category> {
    const category = await CategoryRepository.update(tenantId, id, data);
    if (!category) {
      throw new Error('Category not found.');
    }
    return category;
  }

  static async archiveCategory(tenantId: string, id: string): Promise<void> {
    const success = await CategoryRepository.archive(tenantId, id);
    if (!success) {
      throw new Error('Category not found.');
    }
  }
}