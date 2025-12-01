const express = require('express');
const prisma = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

        const where = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (category) {
            where.category = category;
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.count({ where })
        ]);

        res.json({
            products,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, description, price, stock, category, imageUrl } = req.body;

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                category,
                imageUrl
            }
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, description, price, stock, category, imageUrl } = req.body;

        const product = await prisma.product.update({
            where: { id: parseInt(req.params.id) },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                stock: stock ? parseInt(stock) : undefined,
                category,
                imageUrl
            }
        });

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await prisma.product.delete({
            where: { id: parseInt(req.params.id) }
        });

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
