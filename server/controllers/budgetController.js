const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const budgets = await prisma.budget.findMany({
      where: { user_id: userId, deleted_at: null },
      include: { category: true }, 
      orderBy: { end_date: 'asc' }
    });

    const budgetsWithProgress = await Promise.all(budgets.map(async (budget) => {
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
        const percentage = Math.round((spent / Number(budget.amount)) * 100);
        
        return {
            ...budget,
            amount: Number(budget.amount), 
            spent: spent,
            remaining: Number(budget.amount) - spent,
            percentage: percentage
        };
    }));

    res.json(budgetsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBudget = async (req, res) => {
  const { category_id, amount, start_date, end_date } = req.body;
  try {
    if (!category_id || !amount || !start_date || !end_date) {
        return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const newBudget = await prisma.budget.create({
      data: {
        user_id: req.user.id,
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

const updateBudget = async (req, res) => {
    const { id } = req.params;
    const { amount, start_date, end_date } = req.body;
    try {
        await prisma.budget.update({
            where: { id: parseInt(id) },
            data: {
                amount: parseInt(amount),
                start_date: new Date(start_date),
                end_date: new Date(end_date)
            }
        });
        res.json({ message: "Anggaran diperbarui" });
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
        res.json({ message: "Anggaran dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };