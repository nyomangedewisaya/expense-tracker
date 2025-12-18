const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// IMPORT CONTROLLERS
const authController = require('../controllers/authController');
const walletController = require('../controllers/walletController');
const categoryController = require('../controllers/categoryController');
const transactionController = require('../controllers/transactionController');
const dashboardController = require('../controllers/dashboardController');
const transferController = require('../controllers/transferController'); 
const budgetController = require('../controllers/budgetController');
const userController = require('../controllers/userController');

// 1. AUTH
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// 2. WALLET
router.get('/wallets', authMiddleware, walletController.getWallets);
router.patch('/wallets/:id/status', authMiddleware, walletController.toggleWalletStatus);
router.post('/wallets', authMiddleware, walletController.createWallet);

// 3. CATEGORY
router.get('/categories', authMiddleware, categoryController.getCategories);
router.get('/categories/trash', authMiddleware, categoryController.getDeletedCategories); 
router.post('/categories', authMiddleware, categoryController.createCategory);
router.put('/categories/:id', authMiddleware, categoryController.updateCategory); 
router.delete('/categories/:id', authMiddleware, categoryController.deleteCategory); 
router.patch('/categories/:id/restore', authMiddleware, categoryController.restoreCategory); 
router.delete('/categories/:id/permanent', authMiddleware, categoryController.permanentDeleteCategory); 

// 4. TRANSACTION
router.get('/transactions', authMiddleware, transactionController.getTransactions);
router.post('/transactions', authMiddleware, transactionController.createTransaction);
router.delete('/transactions/:id', authMiddleware, transactionController.deleteTransaction);

// 5. DASHBOARD
router.get('/dashboard', authMiddleware, dashboardController.getDashboardSummary);
router.get('/dashboard/chart', authMiddleware, dashboardController.getDashboardChart);
router.get('/dashboard/expenses', authMiddleware, dashboardController.getExpenseBreakdown); 

// 6. TRANSFER
router.get('/transfers', authMiddleware, transferController.getTransfers);
router.post('/transfers', authMiddleware, transferController.createTransfer);
router.delete('/transfers/:id', authMiddleware, transferController.deleteTransfer);

// 7. BUDGET
router.get('/budgets', authMiddleware, budgetController.getBudgets);
router.post('/budgets', authMiddleware, budgetController.createBudget);
router.put('/budgets/:id', authMiddleware, budgetController.updateBudget); 
router.delete('/budgets/:id', authMiddleware, budgetController.deleteBudget);

// 8. USER
router.get('/user/profile', authMiddleware, userController.getProfile);
router.put('/user/profile', authMiddleware, userController.updateProfile);
router.put('/user/password', authMiddleware, userController.changePassword);

module.exports = router;