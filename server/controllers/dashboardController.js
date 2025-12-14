const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Ambil Modal Awal Semua Wallet
    const wallets = await prisma.wallet.findMany({ where: { user_id: userId, deleted_at: null } });
    const totalInitial = wallets.reduce((acc, curr) => acc + curr.initial_balance, 0);

    // 2. Ambil Total Pemasukan Semua Waktu
    const incomeAgg = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { user_id: userId, deleted_at: null, category: { type: 'income' } }
    });

    // 3. Ambil Total Pengeluaran Semua Waktu
    const expenseAgg = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { user_id: userId, deleted_at: null, category: { type: 'expense' } }
    });

    const allIncome = incomeAgg._sum.amount || 0;
    const allExpense = expenseAgg._sum.amount || 0;

    // Hitung Saldo Total
    const totalBalance = totalInitial + allIncome - allExpense;

    // 4. Hitung Arus Kas Bulan Ini (Opsional, untuk UI)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisMonthIncome = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { 
            user_id: userId, 
            deleted_at: null, 
            category: { type: 'income' },
            transaction_date: { gte: startOfMonth, lte: endOfMonth }
        }
    });

    const thisMonthExpense = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { 
            user_id: userId, 
            deleted_at: null, 
            category: { type: 'expense' },
            transaction_date: { gte: startOfMonth, lte: endOfMonth }
        }
    });

    res.json({
        total_balance: totalBalance, // Angka Int biasa
        income_this_month: thisMonthIncome._sum.amount || 0,
        expense_this_month: thisMonthExpense._sum.amount || 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardSummary };