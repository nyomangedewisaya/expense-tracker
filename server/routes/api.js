const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// --- IMPORT CONTROLLERS ---
const authController = require('../controllers/authController');
const walletController = require('../controllers/walletController');
const categoryController = require('../controllers/categoryController');
const transactionController = require('../controllers/transactionController');
const dashboardController = require('../controllers/dashboardController');
const transferController = require('../controllers/transferController'); 
const budgetController = require('../controllers/budgetController');

// ==============================
// 1. AUTHENTICATION (Public)
// ==============================
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// ==============================
// 2. WALLET / DOMPET
// ==============================
// Semua rute di bawah ini WAJIB login (authMiddleware)
router.get('/wallets', authMiddleware, walletController.getWallets);
router.post('/wallets', authMiddleware, walletController.createWallet);

// ==============================
// 3. CATEGORY / KATEGORI
// ==============================
router.get('/categories', authMiddleware, categoryController.getCategories);
router.post('/categories', authMiddleware, categoryController.createCategory);
router.delete('/categories/:id', authMiddleware, categoryController.deleteCategory);

// ==============================
// 4. TRANSACTIONS / TRANSAKSI
// ==============================
router.get('/transactions', authMiddleware, transactionController.getTransactions);
router.post('/transactions', authMiddleware, transactionController.createTransaction);
router.delete('/transactions/:id', authMiddleware, transactionController.deleteTransaction);

// ==============================
// 5. DASHBOARD
// ==============================
router.get('/dashboard', authMiddleware, dashboardController.getDashboardSummary);

// ==============================
// 6. TRANSFERS (PINDAH DANA)
// ==============================
router.get('/transfers', authMiddleware, transferController.getTransfers);
router.post('/transfers', authMiddleware, transferController.createTransfer);
router.delete('/transfers/:id', authMiddleware, transferController.deleteTransfer);

// ==============================
// 7. BUDGETS (ANGGARAN)
// ==============================
router.get('/budgets', authMiddleware, budgetController.getBudgets);
router.post('/budgets', authMiddleware, budgetController.createBudget);
router.delete('/budgets/:id', authMiddleware, budgetController.deleteBudget)

module.exports = router;