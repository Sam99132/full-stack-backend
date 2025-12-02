const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = ["Electronics", "Accessories", "Furniture", "Home", "Clothing", "Books", "Sports", "Toys"];
const adjectives = ["Premium", "Wireless", "Ergonomic", "Smart", "Vintage", "Modern", "Durable", "Compact", "Luxury", "Essential"];
const nouns = ["Headphones", "Watch", "Chair", "Tracker", "Backpack", "Keyboard", "Mug", "Speaker", "T-Shirt", "Bottle", "Camera", "Plant", "Desk", "Lamp", "Shoes", "Wallet"];

const images = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80",
    "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    "https://images.unsplash.com/photo-1587829741301-dc798b91add1?w=800&q=80",
    "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80",
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    "https://images.unsplash.com/photo-1602143407151-01114192003f?w=800&q=80",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80",
    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80"
];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateProducts(count) {
    const products = [];
    for (let i = 0; i < count; i++) {
        const adj = getRandomElement(adjectives);
        const noun = getRandomElement(nouns);
        const category = getRandomElement(categories);
        const price = (Math.random() * 19500 + 500).toFixed(2); // Price between 500 and 20000 INR
        const stock = Math.floor(Math.random() * 200);

        products.push({
            name: `${adj} ${noun} ${i + 1}`,
            description: `This is a high-quality ${adj.toLowerCase()} ${noun.toLowerCase()} perfect for your needs. It features top-notch materials and excellent craftsmanship.`,
            price: parseFloat(price),
            stock: stock,
            category: category,
            imageUrl: getRandomElement(images)
        });
    }
    return products;
}

async function main() {
    console.log('Start seeding ...');


    await prisma.orderItem.deleteMany({});
    await prisma.product.deleteMany({});

    const products = generateProducts(200);


    const batchSize = 100;
    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        await prisma.product.createMany({
            data: batch
        });
        console.log(`Inserted batch ${i / batchSize + 1}`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
