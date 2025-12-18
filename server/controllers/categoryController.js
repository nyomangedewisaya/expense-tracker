const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getCategories = async (req, res) => {
  try {
    const { type, search } = req.query;
    let whereClause = { user_id: req.user.id, deleted_at: null };

    if (type) whereClause.type = type;
    if (search) whereClause.name = { contains: search };

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDeletedCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { user_id: req.user.id, NOT: { deleted_at: null } },
      orderBy: { deleted_at: 'desc' }
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
      data: { user_id: req.user.id, name, type, color: color || '#cccccc' }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;
  try {
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, color }
    });
    res.json(category);
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
        if (checkTrx) return res.status(400).json({ message: "Gagal! Kategori dipakai di transaksi aktif." });

        await prisma.category.update({
            where: { id: parseInt(id) },
            data: { deleted_at: new Date() }
        });
        res.json({ message: "Kategori dipindahkan ke sampah" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const restoreCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.category.update({
            where: { id: parseInt(id) },
            data: { deleted_at: null }
        });
        res.json({ message: "Kategori dipulihkan" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const permanentDeleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.category.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "Kategori dihapus permanen" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getCategories, getDeletedCategories, 
    createCategory, updateCategory, 
    deleteCategory, restoreCategory, permanentDeleteCategory 
};