import { Response } from 'express';
import { UserRepository } from '../repositories/user.repository.js';

export class AdminController {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  getTenants = async (req: any, res: Response): Promise<void> => {
    try {
      const tenants = await this.userRepository.findAllTenants();
      res.status(200).json({ tenants });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to retrieve tenants' });
    }
  };
}