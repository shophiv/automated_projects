"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("./admin.service");
const AppError_1 = require("../../shared/errors/AppError");
class AdminController {
    adminService = new admin_service_1.AdminService();
    getRetailers = async (req, res, next) => {
        try {
            const search = req.query.search;
            const status = req.query.status;
            const retailers = await this.adminService.getRetailers(search, status);
            return res.status(200).json({
                status: 'success',
                data: retailers,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getRetailerById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const retailer = await this.adminService.getRetailerById(id);
            return res.status(200).json({
                status: 'success',
                data: retailer,
            });
        }
        catch (error) {
            next(error);
        }
    };
    approveRetailer = async (req, res, next) => {
        try {
            const { id } = req.params;
            await this.adminService.approveRetailer(id);
            return res.status(200).json({
                status: 'success',
                message: 'Retailer successfully approved',
            });
        }
        catch (error) {
            next(error);
        }
    };
    updateRetailerStatus = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!status || !['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(status)) {
                throw new AppError_1.AppError('Valid status is required', 400);
            }
            await this.adminService.updateRetailerStatus(id, status);
            return res.status(200).json({
                status: 'success',
                message: `Retailer status successfully updated to ${status}`,
            });
        }
        catch (error) {
            next(error);
        }
    };
    deleteRetailer = async (req, res, next) => {
        try {
            const { id } = req.params;
            await this.adminService.deleteRetailer(id);
            return res.status(200).json({
                status: 'success',
                message: 'Retailer successfully deleted',
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AdminController = AdminController;
