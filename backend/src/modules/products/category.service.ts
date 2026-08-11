import { CategoryRepository } from './category.repository';

export class CategoryService {
  private categoryRepository = new CategoryRepository();

  async createCategory(retailerId: number, data: { name: string; description?: string; status?: string }) {
    if (!data.name) {
      throw new Error('Category name is required');
    }
    return await this.categoryRepository.create(retailerId, data);
  }

  async getCategories(retailerId: number) {
    return await this.categoryRepository.findAll(retailerId);
  }

  async updateCategory(categoryId: number, retailerId: number, data: { name?: string; description?: string; status?: string }) {
    const existing = await this.categoryRepository.findById(categoryId, retailerId);
    if (!existing) {
      throw new Error('Category not found');
    }
    return await this.categoryRepository.update(categoryId, retailerId, data);
  }

  async archiveCategory(categoryId: number, retailerId: number) {
    const existing = await this.categoryRepository.findById(categoryId, retailerId);
    if (!existing) {
      throw new Error('Category not found');
    }
    return await this.categoryRepository.update(categoryId, retailerId, { status: 'archived' });
  }

  async deleteCategory(categoryId: number, retailerId: number) {
    const existing = await this.categoryRepository.findById(categoryId, retailerId);
    if (!existing) {
      throw new Error('Category not found');
    }
    return await this.categoryRepository.delete(categoryId, retailerId);
  }
}