const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getWallets = async (req, res) => {
  try {
    const wallets = await prisma.wallet.findMany({
      where: { user_id: req.user.id, deleted_at: null }
    });
    res.json(wallets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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