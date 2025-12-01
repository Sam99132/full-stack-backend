const express = require('express');
const prisma = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();


router.post('/', verifyToken, async (req, res) => {
    try {
        const { items } = req.body; 

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        
        let total = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId }
            });

            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
            }

            total += parseFloat(product.price) * item.quantity;
            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price
            });
        }

        
        const order = await prisma.$transaction(async (prisma) => {
            
            const newOrder = await prisma.order.create({
                data: {
                    userId: req.user.userId,
                    total,
                    status: 'PENDING',
                    items: {
                        create: orderItemsData
                    }
                },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            
            for (const item of items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    }
                });
            }

            return newOrder;
        });

        res.status(201).json(order);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: error.message });
    }
});


router.get('/', verifyToken, async (req, res) => {
    try {
        const where = {};

        if (req.user.role !== 'ADMIN') {
            where.userId = req.user.userId;
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/:id', verifyToken, async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        
        if (req.user.role !== 'ADMIN' && order.userId !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
