const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTransactions = async (req, res) => {
  const userId = req.user.id;
  const { wallet_id, category_id, type, start_date, end_date, search } = req.query;

  try {
    let whereClause = {
      user_id: userId,
      deleted_at: null
    };

    if (wallet_id) {
      whereClause.wallet_id = parseInt(wallet_id);
    }

    if (category_id) {
      whereClause.category_id = parseInt(category_id);
    }

    if (type) {
      whereClause.category = {
        type: type 
      };
    }

    if (start_date && end_date) {
      whereClause.transaction_date = {
        gte: new Date(start_date), 
        lte: new Date(end_date)    
      };
    }

    if (search) {
      whereClause.description = {
        contains: search
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: true,
        wallet: true   
      },
      orderBy: { transaction_date: 'desc' }
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTransaction = async (req, res) => {
  const { wallet_id, category_id, amount, description, transaction_date } = req.body;
  const userId = req.user.id;
  const nominal = parseInt(amount);

  try {
    if (!wallet_id || !category_id || !amount || !transaction_date) {
        return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const wallet = await prisma.wallet.findUnique({ where: { id: parseInt(wallet_id) } });
    const category = await prisma.category.findUnique({ where: { id: parseInt(category_id) } });

    if (!wallet || !category) return res.status(404).json({ message: "Data tidak valid" });

    if (category.type === 'expense') {
        const incomeAgg = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { wallet_id: wallet.id, deleted_at: null, category: { type: 'income' } }
        });
        const expenseAgg = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { wallet_id: wallet.id, deleted_at: null, category: { type: 'expense' } }
        });

        const currentBalance = wallet.initial_balance + (incomeAgg._sum.amount || 0) - (expenseAgg._sum.amount || 0);

        if (nominal > currentBalance) {
            return res.status(400).json({ 
                message: `Saldo tidak cukup! Sisa: Rp ${currentBalance.toLocaleString('id-ID')}` 
            });
        }
    }

    const newTrx = await prisma.transaction.create({
      data: {
        user_id: userId,
        wallet_id: parseInt(wallet_id),
        category_id: parseInt(category_id),
        amount: nominal,
        description,
        transaction_date: new Date(transaction_date),
      }
    });

    res.status(201).json(newTrx);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTransaction = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.transaction.update({
            where: { id: parseInt(id) },
            data: { deleted_at: new Date() }
        });
        res.json({ message: "Transaksi dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getTransactions, createTransaction, deleteTransaction };