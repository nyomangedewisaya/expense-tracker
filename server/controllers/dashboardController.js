const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getWIBDateString = (date) => {
    return new Intl.DateTimeFormat('en-CA', { 
        timeZone: 'Asia/Jakarta',
    }).format(date);
};

const getDashboardSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    const wallets = await prisma.wallet.findMany({ where: { user_id: userId, deleted_at: null } });
    let totalBalance = 0;

    for (const wallet of wallets) {
        const incomeAgg = await prisma.transaction.aggregate({ _sum: { amount: true }, where: { wallet_id: wallet.id, deleted_at: null, category: { type: 'income' } } });
        const expenseAgg = await prisma.transaction.aggregate({ _sum: { amount: true }, where: { wallet_id: wallet.id, deleted_at: null, category: { type: 'expense' } } });
        const trfInAgg = await prisma.transfer.aggregate({ _sum: { amount: true }, where: { to_wallet_id: wallet.id, deleted_at: null } });
        const trfOutAgg = await prisma.transfer.aggregate({ _sum: { amount: true }, where: { from_wallet_id: wallet.id, deleted_at: null } });

        const balance = wallet.initial_balance 
            + (incomeAgg._sum.amount || 0) 
            - (expenseAgg._sum.amount || 0)
            + (trfInAgg._sum.amount || 0)
            - (trfOutAgg._sum.amount || 0);
        
        totalBalance += balance;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisMonthIncome = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { user_id: userId, deleted_at: null, category: { type: 'income' }, transaction_date: { gte: startOfMonth, lte: endOfMonth } }
    });

    const thisMonthExpense = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { user_id: userId, deleted_at: null, category: { type: 'expense' }, transaction_date: { gte: startOfMonth, lte: endOfMonth } }
    });

    res.json({
        total_balance: totalBalance,
        income_this_month: thisMonthIncome._sum.amount || 0,
        expense_this_month: thisMonthExpense._sum.amount || 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardChart = async (req, res) => {
    const userId = req.user.id;
    const { period } = req.query;

    try {
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();

        if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else {
            startDate = new Date();
            startDate.setDate(now.getDate() - 6);
            endDate = new Date();
        }

        const chartMap = new Map();
        let loopDate = new Date(startDate);
        
        while (loopDate <= endDate) {
            const dateKey = getWIBDateString(loopDate); 
            
            let label = "";
            if (period === 'month') {
                label = new Intl.DateTimeFormat('id-ID', { day: 'numeric' }).format(loopDate); 
            } else {
                label = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric' }).format(loopDate); 
            }

            chartMap.set(dateKey, {
                name: label,
                date: dateKey,
                income: 0,
                expense: 0
            });

            loopDate.setDate(loopDate.getDate() + 1);
        }

        const queryStart = new Date(startDate); queryStart.setHours(0,0,0,0);
        const queryEnd = new Date(endDate); queryEnd.setHours(23,59,59,999);

        const transactions = await prisma.transaction.findMany({
            where: {
                user_id: userId,
                deleted_at: null,
                transaction_date: {
                    gte: queryStart,
                    lte: queryEnd
                }
            },
            include: { category: true }
        });

        transactions.forEach(trx => {
            const trxDateKey = getWIBDateString(new Date(trx.transaction_date));

            if (chartMap.has(trxDateKey)) {
                const dayData = chartMap.get(trxDateKey);
                if (trx.category.type === 'income') {
                    dayData.income += trx.amount;
                } else {
                    dayData.expense += trx.amount;
                }
            }
        });

        const result = Array.from(chartMap.values());
        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const getExpenseBreakdown = async (req, res) => {
    const userId = req.user.id;
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const transactions = await prisma.transaction.findMany({
            where: {
                user_id: userId,
                deleted_at: null,
                category: { type: 'expense' },
                transaction_date: { gte: startOfMonth, lte: endOfMonth }
            },
            include: { category: true }
        });

        const breakdown = transactions.reduce((acc, curr) => {
            const catName = curr.category.name;
            const catColor = curr.category.color || '#94a3b8'; 
            
            if (!acc[catName]) {
                acc[catName] = { name: catName, value: 0, color: catColor };
            }
            acc[catName].value += curr.amount;
            return acc;
        }, {});

        const result = Object.values(breakdown).sort((a, b) => b.value - a.value);

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardSummary, getDashboardChart, getExpenseBreakdown };