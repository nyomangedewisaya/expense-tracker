const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: List Transfer
const getTransfers = async (req, res) => {
  const userId = req.user.id;
  const { from_wallet_id, to_wallet_id, start_date, end_date } = req.query;

  try {
    let whereClause = {
      user_id: userId,
      deleted_at: null
    };

    if (from_wallet_id) whereClause.from_wallet_id = parseInt(from_wallet_id);
    if (to_wallet_id) whereClause.to_wallet_id = parseInt(to_wallet_id);

    if (start_date && end_date) {
      whereClause.transaction_date = {
        gte: new Date(start_date),
        lte: new Date(end_date)
      };
    }

    const transfers = await prisma.transfer.findMany({
      where: whereClause,
      include: {
        from_wallet: true, // Sertakan info dompet pengirim
        to_wallet: true    // Sertakan info dompet penerima
      },
      orderBy: { transaction_date: 'desc' }
    });

    res.json(transfers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST: Buat Transfer Baru (Dengan Validasi Saldo Ketat)
const createTransfer = async (req, res) => {
  const userId = req.user.id;
  const { from_wallet_id, to_wallet_id, amount, description, transaction_date } = req.body;
  const nominal = parseInt(amount);

  try {
    // 1. Validasi Input
    if (!from_wallet_id || !to_wallet_id || !amount) {
        return res.status(400).json({ message: "Data tidak lengkap" });
    }

    if (parseInt(from_wallet_id) === parseInt(to_wallet_id)) {
        return res.status(400).json({ message: "Tidak bisa transfer ke dompet yang sama" });
    }

    // 2. Cek Dompet Pengirim
    const sourceWallet = await prisma.wallet.findFirst({
        where: { id: parseInt(from_wallet_id), user_id: userId }
    });

    if (!sourceWallet) return res.status(404).json({ message: "Dompet pengirim tidak ditemukan" });

    // 3. HITUNG SALDO DOMPET PENGIRIM (Rumus Lengkap)
    // Saldo = Modal Awal + (Income Trx) - (Expense Trx) + (Transfer Masuk) - (Transfer Keluar)
    
    // A. Transaksi Masuk/Keluar
    const incomeAgg = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { wallet_id: sourceWallet.id, deleted_at: null, category: { type: 'income' } }
    });
    const expenseAgg = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { wallet_id: sourceWallet.id, deleted_at: null, category: { type: 'expense' } }
    });

    // B. Transfer Masuk/Keluar (History sebelumnya)
    const transferInAgg = await prisma.transfer.aggregate({
        _sum: { amount: true },
        where: { to_wallet_id: sourceWallet.id, deleted_at: null }
    });
    const transferOutAgg = await prisma.transfer.aggregate({
        _sum: { amount: true },
        where: { from_wallet_id: sourceWallet.id, deleted_at: null }
    });

    const totalIncome = (incomeAgg._sum.amount || 0);
    const totalExpense = (expenseAgg._sum.amount || 0);
    const totalTransferIn = (transferInAgg._sum.amount || 0);
    const totalTransferOut = (transferOutAgg._sum.amount || 0);

    const currentBalance = sourceWallet.initial_balance + totalIncome - totalExpense + totalTransferIn - totalTransferOut;

    // 4. Cek Cukup Gak?
    if (nominal > currentBalance) {
        return res.status(400).json({ 
            message: `Saldo tidak cukup untuk transfer! Sisa: Rp ${currentBalance.toLocaleString('id-ID')}` 
        });
    }

    // 5. Eksekusi Transfer
    const newTransfer = await prisma.transfer.create({
      data: {
        user_id: userId,
        from_wallet_id: parseInt(from_wallet_id),
        to_wallet_id: parseInt(to_wallet_id),
        amount: nominal,
        description,
        transaction_date: new Date(transaction_date)
      }
    });

    res.status(201).json(newTransfer);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTransfer = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.transfer.update({
            where: { id: parseInt(id) },
            data: { deleted_at: new Date() }
        });
        res.json({ message: "Transfer dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getTransfers, createTransfer, deleteTransfer };