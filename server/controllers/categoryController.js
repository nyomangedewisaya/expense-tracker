const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getCategories = async (req, res) => {
  try {
    const { type, search } = req.query;
    
    let whereClause = { 
      user_id: req.user.id, 
      deleted_at: null 
    };

    if (type) {
        whereClause.type = type;
    }

    if (search) {
        whereClause.name = {
            contains: search 
        };
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  const { name, type, color } = req.body;
  try {
    if (!name || !type) return res.status(400).json({ message: 'Nama dan Tipe wajib diisi' });

    const category = await prisma.category.create({
      data: { user_id: req.user.id, name, type, color }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const checkTrx = await prisma.transaction.findFirst({
            where: { category_id: parseInt(id), deleted_at: null }
        });

        if (checkTrx) {
            return res.status(400).json({ message: "Gagal! Kategori ini sedang dipakai di transaksi." });
        }

        await prisma.category.update({
            where: { id: parseInt(id) },
            data: { deleted_at: new Date() }
        });
        res.json({ message: "Kategori dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getCategories, createCategory, deleteCategory };