const express = require('express');
const prisma = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();


router.get('/:id', verifyToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        
        if (req.user.userId !== userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                orders: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        items: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
