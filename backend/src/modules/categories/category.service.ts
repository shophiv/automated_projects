import { CategoryRepository } from './category.repository';

export class CategoryService {
  private categoryRepo = new CategoryRepository();

  async getCategories(retailerId: string) {
    return await this.categoryRepo.findAllByRetailer(retailerId);
  }

  async createCategory(retailerId: string, data: { name: string; description?: string }) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    try {
      return await this.categoryRepo.create({
        retailerId,
        name: data.name,
        slug,
        description: data.description,
      });
    } catch (error: any) {
      if (error.code === '23505') {
        const err: any = new Error('Category with this name already exists');
        err.statusCode = 400;
        err.code = 'DUPLICATE_CATEGORY';
        throw err;
      }
      throw error;
    }
  }

  async updateCategory(id: string, retailerId: string, data: { name: string; description?: string; archived?: boolean }) {
    const existing = await this.categoryRepo.findById(id, retailerId);
    if (!existing) {
      const err: any = new Error('Category not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    try {
      return await this.categoryRepo.update(id, retailerId, {
        name: data.name,
        slug,
        description: data.description,
        archived: data.archived,
      });
    } catch (error: any) {
      if (error.code === '23505') {
        const err: any = new Error('Category with this name already exists');
        err.statusCode = 400;
        err.code = 'DUPLICATE_CATEGORY';
        throw err;
      }
      throw error;
    }
  }

  async deleteCategory(id: string, retailerId: string) {
    const existing = await this.categoryRepo.findById(id, retailerId);
    if (!existing) {
      const err: any = new Error('Category not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return await this.categoryRepo.delete(id, retailerId);
  }
}