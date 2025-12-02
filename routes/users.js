const express = require('express');
const prisma = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get current user's profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                address: true,
                city: true,
                state: true,
                postalCode: true,
                country: true,
                phone: true,
                createdAt: true
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

// Update current user's profile (including address)
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { name, address, city, state, postalCode, country, phone } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (state !== undefined) updateData.state = state;
        if (postalCode !== undefined) updateData.postalCode = postalCode;
        if (country !== undefined) updateData.country = country;
        if (phone !== undefined) updateData.phone = phone;

        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                address: true,
                city: true,
                state: true,
                postalCode: true,
                country: true,
                phone: true,
                createdAt: true
            }
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', verifyToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        // Only allow users to view their own profile or admins to view any profile
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
