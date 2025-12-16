const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getWallets = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // PERUBAHAN: Hapus "deleted_at: null" agar semua wallet (aktif/nonaktif) terambil
    const wallets = await prisma.wallet.findMany({
      where: { user_id: userId }, 
      orderBy: { id: 'asc' }
    });

    const walletsWithBalance = await Promise.all(wallets.map(async (wallet) => {
        // Logic hitung saldo (SAMA SEPERTI SEBELUMNYA, Copy Paste saja bagian hitungnya)
        const incomeAgg = await prisma.transaction.aggregate({ _sum: { amount: true }, where: { wallet_id: wallet.id, deleted_at: null, category: { type: 'income' } } });
        const expenseAgg = await prisma.transaction.aggregate({ _sum: { amount: true }, where: { wallet_id: wallet.id, deleted_at: null, category: { type: 'expense' } } });
        const transferInAgg = await prisma.transfer.aggregate({ _sum: { amount: true }, where: { to_wallet_id: wallet.id, deleted_at: null } });
        const transferOutAgg = await prisma.transfer.aggregate({ _sum: { amount: true }, where: { from_wallet_id: wallet.id, deleted_at: null } });

        const currentBalance = Number(wallet.initial_balance) 
            + (incomeAgg._sum.amount || 0) 
            - (expenseAgg._sum.amount || 0)
            + (transferInAgg._sum.amount || 0)
            - (transferOutAgg._sum.amount || 0);

        return { ...wallet, current_balance: currentBalance };
    }));

    res.json(walletsWithBalance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [BARU] Fungsi Aktif/Nonaktifkan Wallet
const toggleWalletStatus = async (req, res) => {
    const { id } = req.params;
    try {
        // Cek dulu status sekarang
        const wallet = await prisma.wallet.findUnique({ where: { id: parseInt(id) } });
        if (!wallet) return res.status(404).json({ message: "Wallet tidak ditemukan" });

        // Jika null maka isi tanggal (Nonaktif), jika ada tanggal maka null-kan (Aktif)
        const newStatus = wallet.deleted_at ? null : new Date();

        await prisma.wallet.update({
            where: { id: parseInt(id) },
            data: { deleted_at: newStatus }
        });

        res.json({ message: `Dompet berhasil ${newStatus ? 'dinonaktifkan' : 'diaktifkan'}` });
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

module.exports = { getWallets, toggleWalletStatus, createWallet };