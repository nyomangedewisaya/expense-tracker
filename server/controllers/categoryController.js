const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET ACTIVE CATEGORIES
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

// GET DELETED CATEGORIES (HISTORY)
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

// CREATE
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

// UPDATE (Type tidak boleh diubah)
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;
  try {
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, color } // Type tidak dimasukkan disini
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SOFT DELETE
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        // Cek apakah dipakai transaksi aktif
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

// RESTORE (Pulihkan dari sampah)
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

// HARD DELETE (Hapus Selamanya)
const permanentDeleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        // Hapus paksa, transaksi terkait akan jadi orphan (atau set null jika relasi di DB on delete set null)
        // Sebaiknya transaksi lama yang deleted_at nya ada juga ikut dihapus atau dibiarkan.
        // Di sini kita asumsikan aman menghapus kategori yang sudah di trash.
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