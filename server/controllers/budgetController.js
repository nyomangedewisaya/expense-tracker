const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: Ambil Budget + Progress (Terpakai berapa?)
const getBudgets = async (req, res) => {
  const userId = req.user.id;
  
  try {
    const budgets = await prisma.budget.findMany({
      where: { user_id: userId, deleted_at: null },
      include: { category: true }
    });

    // Logic Spesial: Hitung progress pemakaian budget
    // Kita pakai Promise.all agar mapping async berjalan paralel
    const budgetsWithProgress = await Promise.all(budgets.map(async (budget) => {
        // Hitung total pengeluaran untuk kategori ini dalam rentang tanggal budget
        const expenseAgg = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
                user_id: userId,
                category_id: budget.category_id,
                deleted_at: null,
                transaction_date: {
                    gte: budget.start_date,
                    lte: budget.end_date
                }
            }
        });

        const spent = expenseAgg._sum.amount || 0;
        
        return {
            ...budget,
            spent: spent, // Data tambahan untuk Frontend (Progress Bar)
            remaining: budget.amount - spent,
            percentage: Math.min(100, Math.round((spent / budget.amount) * 100)) // Persentase 0-100%
        };
    }));

    res.json(budgetsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST: Pasang Budget Baru
const createBudget = async (req, res) => {
  const userId = req.user.id;
  const { category_id, amount, start_date, end_date } = req.body;

  try {
    const category = await prisma.category.findUnique({ where: { id: parseInt(category_id) } });
    if (!category || category.type !== 'expense') {
        return res.status(400).json({ message: "Budget hanya bisa untuk kategori Pengeluaran (Expense)" });
    }

    const newBudget = await prisma.budget.create({
      data: {
        user_id: userId,
        category_id: parseInt(category_id),
        amount: parseInt(amount),
        start_date: new Date(start_date),
        end_date: new Date(end_date)
      }
    });

    res.status(201).json(newBudget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBudget = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.budget.update({
            where: { id: parseInt(id) },
            data: { deleted_at: new Date() }
        });
        res.json({ message: "Budget dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getBudgets, createBudget, deleteBudget };