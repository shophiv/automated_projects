const { prisma } = require('../config/db');

class CategoryService {
  async createCategory(userId, name) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new Error('Category name is required');
    }

    const trimmedName = name.trim();

    // Check if category already exists for this user
    const existing = await prisma.category.findFirst({
      where: {
        user_id: userId,
        name: {
          equals: trimmedName,
          mode: 'insensitive'
        }
      }
    });

    if (existing) {
      throw new Error('Category with this name already exists');
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        user_id: userId
      }
    });

    return category;
  }

  async getCategories(userId) {
    const categories = await prisma.category.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });

    return categories;
  }
}

module.exports = new CategoryService();