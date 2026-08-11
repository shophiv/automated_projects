"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_1 = require("../middleware/adminAuth");
const retailerAdminController_1 = require("../controllers/admin/retailerAdminController");
const subscriptionController_1 = require("../controllers/admin/subscriptionController");
const platformController_1 = require("../controllers/admin/platformController");
const router = (0, express_1.Router)();
router.post('/auth/login', platformController_1.PlatformController.adminLogin);
// Protected Admin Routes
router.use(adminAuth_1.adminAuthMiddleware);
router.get('/retailers', retailerAdminController_1.RetailerAdminController.listRetailers);
router.put('/retailers/:id/status', retailerAdminController_1.RetailerAdminController.updateStatus);
router.get('/subscriptions', subscriptionController_1.SubscriptionController.listSubscriptions);
router.post('/subscriptions/assign', subscriptionController_1.SubscriptionController.assignSubscription);
router.get('/analytics', platformController_1.PlatformController.getAnalytics);
router.get('/support/logs', platformController_1.PlatformController.getSupportLogs);
router.post('/support/broadcast', platformController_1.PlatformController.broadcastAnnouncement);
exports.default = router;
