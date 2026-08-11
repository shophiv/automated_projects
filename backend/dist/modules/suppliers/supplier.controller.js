"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierController = void 0;
const supplier_service_1 = require("./supplier.service");
class SupplierController {
    supplierService = new supplier_service_1.SupplierService();
    createSupplier = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const supplier = await this.supplierService.createSupplier(retailerId, req.body);
            res.status(201).json(supplier);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    getSuppliers = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const suppliers = await this.supplierService.getSuppliers(retailerId);
            res.status(200).json(suppliers);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    updateSupplier = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const supplierId = parseInt(req.params.id, 10);
            const supplier = await this.supplierService.updateSupplier(supplierId, retailerId, req.body);
            res.status(200).json(supplier);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    deactivateSupplier = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const supplierId = parseInt(req.params.id, 10);
            const supplier = await this.supplierService.deactivateSupplier(supplierId, retailerId);
            res.status(200).json(supplier);
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    };
    deleteSupplier = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const supplierId = parseInt(req.params.id, 10);
            await this.supplierService.deleteSupplier(supplierId, retailerId);
            res.status(200).json({ message: 'Supplier deleted successfully' });
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    getSupplierReports = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const supplierId = parseInt(req.params.id, 10);
            const report = await this.supplierService.getSupplierReports(supplierId, retailerId);
            res.status(200).json(report);
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    };
}
exports.SupplierController = SupplierController;
