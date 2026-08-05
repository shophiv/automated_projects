"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
class AdminController {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    getTenants = async (req, res) => {
        try {
            const tenants = await this.userRepository.findAllTenants();
            res.status(200).json({ tenants });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to retrieve tenants' });
        }
    };
}
exports.AdminController = AdminController;
