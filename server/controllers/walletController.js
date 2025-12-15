const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET WALLETS (Dengan Saldo Terkini/Real-time)
const getWallets = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const wallets = await prisma.wallet.findMany({
      where: { user_id: userId, deleted_at: null },
      orderBy: { id: 'asc' } // Urutkan biar rapi
    });

    // Kita harus hitung saldo satu per satu secara Async
    const walletsWithBalance = await Promise.all(wallets.map(async (wallet) => {
        // 1. Hitung Total Pemasukan (Income) di dompet ini
        const incomeAgg = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { 
                wallet_id: wallet.id, 
                deleted_at: null, 
                category: { type: 'income' } 
            }
        });

        // 2. Hitung Total Pengeluaran (Expense) di dompet ini
        const expenseAgg = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { 
                wallet_id: wallet.id, 
                deleted_at: null, 
                category: { type: 'expense' } 
            }
        });

        // 3. Hitung Transfer MASUK ke dompet ini
        const transferInAgg = await prisma.transfer.aggregate({
            _sum: { amount: true },
            where: { to_wallet_id: wallet.id, deleted_at: null }
        });

        // 4. Hitung Transfer KELUAR dari dompet ini
        const transferOutAgg = await prisma.transfer.aggregate({
            _sum: { amount: true },
            where: { from_wallet_id: wallet.id, deleted_at: null }
        });

        // 5. Rumus Saldo Akhir
        const currentBalance = wallet.initial_balance 
            + (incomeAgg._sum.amount || 0) 
            - (expenseAgg._sum.amount || 0)
            + (transferInAgg._sum.amount || 0)
            - (transferOutAgg._sum.amount || 0);

        // Kembalikan objek wallet ditambah field current_balance
        return {
            ...wallet,
            current_balance: currentBalance 
        };
    }));

    res.json(walletsWithBalance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE WALLET (Masih sama, logicnya oke)
const createWallet = async (req, res) => {
  const { name, type, initial_balance } = req.body;
  
  try {
    if (!name || initial_balance === undefined) {
        return res.status(400).json({ message: 'Nama dan Saldo Awal wajib diisi' });
    }

    const newWallet = await prisma.wallet.create({
      data: {
        user_id: req.user.id,
        name,
        type,
        initial_balance: parseInt(initial_balance) 
      }
    });
    res.status(201).json(newWallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWallets, createWallet };