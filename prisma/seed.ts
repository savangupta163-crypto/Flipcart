import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Mobiles',
        slug: 'mobiles',
        image: 'https://placehold.co/200x200/2874f0/FFFFFF?text=📱+Mobiles',
        order: 1,
        active: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Laptops',
        slug: 'laptops',
        image: 'https://placehold.co/200x200/2874f0/FFFFFF?text=💻+Laptops',
        order: 2,
        active: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Fashion',
        slug: 'fashion',
        image: 'https://placehold.co/200x200/ff9f00/FFFFFF?text=👔+Fashion',
        order: 3,
        active: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
        image: 'https://placehold.co/200x200/2874f0/FFFFFF?text=🎧+Electronics',
        order: 4,
        active: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Home & Furniture',
        slug: 'home-furniture',
        image: 'https://placehold.co/200x200/388e3c/FFFFFF?text=🏠+Home',
        order: 5,
        active: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Appliances',
        slug: 'appliances',
        image: 'https://placehold.co/200x200/2874f0/FFFFFF?text=🔌+Appliances',
        order: 6,
        active: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Beauty & Health',
        slug: 'beauty-health',
        image: 'https://placehold.co/200x200/e91e63/FFFFFF?text=💄+Beauty',
        order: 7,
        active: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Grocery',
        slug: 'grocery',
        image: 'https://placehold.co/200x200/388e3c/FFFFFF?text=🛒+Grocery',
        order: 8,
        active: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sports & Toys',
        slug: 'sports-toys',
        image: 'https://placehold.co/200x200/ff5722/FFFFFF?text=⚽+Sports',
        order: 9,
        active: true,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create subcategories
  const mobilesId = categories[0].id;
  const laptopsId = categories[1].id;
  const fashionId = categories[2].id;
  const electronicsId = categories[3].id;
  const homeId = categories[4].id;
  const appliancesId = categories[5].id;
  const beautyId = categories[6].id;
  const groceryId = categories[7].id;
  const sportsId = categories[8].id;

  const subcategories = await Promise.all([
    // Mobiles subcategories
    prisma.subCategory.create({ data: { name: 'Smartphones', slug: 'smartphones', image: 'https://placehold.co/150x150/2874f0/FFFFFF?text=Smartphones', categoryId: mobilesId, order: 1, active: true } }),
    prisma.subCategory.create({ data: { name: 'Feature Phones', slug: 'feature-phones', image: 'https://placehold.co/150x150/2874f0/FFFFFF?text=Feature+Phones', categoryId: mobilesId, order: 2, active: true } }),
    prisma.subCategory.create({ data: { name: 'Phone Cases', slug: 'phone-cases', image: 'https://placehold.co/150x150/2874f0/FFFFFF?text=Phone+Cases', categoryId: mobilesId, order: 3, active: true } }),
    // Laptops subcategories
    prisma.subCategory.create({ data: { name: 'Gaming Laptops', slug: 'gaming-laptops', image: 'https://placehold.co/150x150/2874f0/FFFFFF?text=Gaming', categoryId: laptopsId, order: 1, active: true } }),
    prisma.subCategory.create({ data: { name: 'Business Laptops', slug: 'business-laptops', image: 'https://placehold.co/150x150/2874f0/FFFFFF?text=Business', categoryId: laptopsId, order: 2, active: true } }),
    prisma.subCategory.create({ data: { name: 'Thin & Light', slug: 'thin-light', image: 'https://placehold.co/150x150/2874f0/FFFFFF?text=Thin+Light', categoryId: laptopsId, order: 3, active: true } }),
    // Fashion subcategories
    prisma.subCategory.create({ data: { name: 'Men\'s Clothing', slug: 'mens-clothing', image: 'https://placehold.co/150x150/ff9f00/FFFFFF?text=Men', categoryId: fashionId, order: 1, active: true } }),
    prisma.subCategory.create({ data: { name: 'Women\'s Clothing', slug: 'womens-clothing', image: 'https://placehold.co/150x150/ff9f00/FFFFFF?text=Women', categoryId: fashionId, order: 2, active: true } }),
    prisma.subCategory.create({ data: { name: 'Footwear', slug: 'footwear', image: 'https://placehold.co/150x150/ff9f00/FFFFFF?text=Footwear', categoryId: fashionId, order: 3, active: true } }),
    // Electronics subcategories
    prisma.subCategory.create({ data: { name: 'Headphones', slug: 'headphones', image: 'https://placehold.co/150x150/2874f0/FFFFFF?text=Headphones', categoryId: electronicsId, order: 1, active: true } }),
    prisma.subCategory.create({ data: { name: 'Speakers', slug: 'speakers', image: 'https://placehold.co/150x150/2874f0/FFFFFF?text=Speakers', categoryId: electronicsId, order: 2, active: true } }),
    prisma.subCategory.create({ data: { name: 'Tablets', slug: 'tablets', image: 'https://placehold.co/150x150/2874f0/FFFFFF?text=Tablets', categoryId: electronicsId, order: 3, active: true } }),
    // Home subcategories
    prisma.subCategory.create({ data: { name: 'Sofas', slug: 'sofas', image: 'https://placehold.co/150x150/388e3c/FFFFFF?text=Sofas', categoryId: homeId, order: 1, active: true } }),
    prisma.subCategory.create({ data: { name: 'Beds', slug: 'beds', image: 'https://placehold.co/150x150/388e3c/FFFFFF?text=Beds', categoryId: homeId, order: 2, active: true } }),
    // Appliances subcategories
    prisma.subCategory.create({ data: { name: 'Washing Machines', slug: 'washing-machines', image: 'https://placehold.co/150x150/2874f0/FFFFFF?text=WM', categoryId: appliancesId, order: 1, active: true } }),
    prisma.subCategory.create({ data: { name: 'Refrigerators', slug: 'refrigerators', image: 'https://placehold.co/150x150/2874f0/FFFFFF?text=Fridge', categoryId: appliancesId, order: 2, active: true } }),
    prisma.subCategory.create({ data: { name: 'Air Conditioners', slug: 'air-conditioners', image: 'https://placehold.co/150x150/2874f0/FFFFFF?text=AC', categoryId: appliancesId, order: 3, active: true } }),
    // Beauty subcategories
    prisma.subCategory.create({ data: { name: 'Skincare', slug: 'skincare', image: 'https://placehold.co/150x150/e91e63/FFFFFF?text=Skincare', categoryId: beautyId, order: 1, active: true } }),
    prisma.subCategory.create({ data: { name: 'Makeup', slug: 'makeup', image: 'https://placehold.co/150x150/e91e63/FFFFFF?text=Makeup', categoryId: beautyId, order: 2, active: true } }),
    // Grocery subcategories
    prisma.subCategory.create({ data: { name: 'Snacks', slug: 'snacks', image: 'https://placehold.co/150x150/388e3c/FFFFFF?text=Snacks', categoryId: groceryId, order: 1, active: true } }),
    prisma.subCategory.create({ data: { name: 'Beverages', slug: 'beverages', image: 'https://placehold.co/150x150/388e3c/FFFFFF?text=Beverages', categoryId: groceryId, order: 2, active: true } }),
    // Sports subcategories
    prisma.subCategory.create({ data: { name: 'Cricket', slug: 'cricket', image: 'https://placehold.co/150x150/ff5722/FFFFFF?text=Cricket', categoryId: sportsId, order: 1, active: true } }),
    prisma.subCategory.create({ data: { name: 'Fitness', slug: 'fitness', image: 'https://placehold.co/150x150/ff5722/FFFFFF?text=Fitness', categoryId: sportsId, order: 2, active: true } }),
  ]);

  console.log(`✅ Created ${subcategories.length} subcategories`);

  // Create products
  const productData = [
    // Mobiles - Smartphones
    { name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra', price: 129999, mrp: 144999, categoryId: mobilesId, subCategoryId: subcategories[0].id, brand: 'Samsung', seller: 'Samsung Official Store', rating: 4.6, reviewCount: 12543, isFeatured: true, isDealOfDay: true, images: JSON.stringify(['https://placehold.co/300x300/1a1a2e/FFFFFF?text=Galaxy+S24+Ultra']), features: JSON.stringify(['200MP Camera', '12GB RAM', '256GB Storage', '6.8" Dynamic AMOLED', '5000mAh Battery', 'Snapdragon 8 Gen 3']) },
    { name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', price: 134900, mrp: 159900, categoryId: mobilesId, subCategoryId: subcategories[0].id, brand: 'Apple', seller: 'Apple Official Store', rating: 4.7, reviewCount: 18920, isFeatured: true, isDealOfDay: false, images: JSON.stringify(['https://placehold.co/300x300/1a1a2e/FFFFFF?text=iPhone+15+Pro+Max']), features: JSON.stringify(['48MP Camera System', 'A17 Pro Chip', '256GB Storage', '6.7" Super Retina XDR', 'Titanium Design']) },
    { name: 'OnePlus 12', slug: 'oneplus-12', price: 64999, mrp: 69999, categoryId: mobilesId, subCategoryId: subcategories[0].id, brand: 'OnePlus', seller: 'OnePlus Official Store', rating: 4.5, reviewCount: 8721, isFeatured: true, isDealOfDay: true, images: JSON.stringify(['https://placehold.co/300x300/1a1a2e/FFFFFF?text=OnePlus+12']), features: JSON.stringify(['50MP Hasselblad Camera', '16GB RAM', '256GB Storage', '6.82" 2K LTPO', '5400mAh Battery', '100W SUPERVOOC']) },
    { name: 'Redmi Note 13 Pro+', slug: 'redmi-note-13-pro-plus', price: 29999, mrp: 35999, categoryId: mobilesId, subCategoryId: subcategories[0].id, brand: 'Xiaomi', seller: 'Mi Official Store', rating: 4.3, reviewCount: 15432, isFeatured: false, isDealOfDay: true, images: JSON.stringify(['https://placehold.co/300x300/1a1a2e/FFFFFF?text=Redmi+Note+13+Pro+']), features: JSON.stringify(['200MP Camera', '8GB RAM', '256GB Storage', '6.67" AMOLED', '5000mAh Battery', '120W Fast Charging']) },
    { name: 'Realme GT 5 Pro', slug: 'realme-gt-5-pro', price: 35999, mrp: 40999, categoryId: mobilesId, subCategoryId: subcategories[0].id, brand: 'Realme', seller: 'Realme Official Store', rating: 4.4, reviewCount: 5621, isFeatured: false, isDealOfDay: false, images: JSON.stringify(['https://placehold.co/300x300/1a1a2e/FFFFFF?text=Realme+GT+5+Pro']), features: JSON.stringify(['50MP Sony IMX890', '12GB RAM', '256GB Storage', '6.78" AMOLED', '5400mAh Battery']) },

    // Laptops
    { name: 'MacBook Air M3', slug: 'macbook-air-m3', price: 114900, mrp: 134900, categoryId: laptopsId, subCategoryId: subcategories[3].id, brand: 'Apple', seller: 'Apple Official Store', rating: 4.8, reviewCount: 9876, isFeatured: true, isDealOfDay: false, images: JSON.stringify(['https://placehold.co/300x300/2d2d44/FFFFFF?text=MacBook+Air+M3']), features: JSON.stringify(['Apple M3 Chip', '8GB RAM', '256GB SSD', '13.6" Liquid Retina', '18hr Battery', 'MagSafe Charging']) },
    { name: 'ASUS ROG Strix G16', slug: 'asus-rog-strix-g16', price: 129990, mrp: 159990, categoryId: laptopsId, subCategoryId: subcategories[3].id, brand: 'ASUS', seller: 'ASUS Official Store', rating: 4.5, reviewCount: 4321, isFeatured: true, isDealOfDay: true, images: JSON.stringify(['https://placehold.co/300x300/2d2d44/FFFFFF?text=ROG+Strix+G16']), features: JSON.stringify(['Intel i9-14900HX', '32GB DDR5', '1TB SSD', 'RTX 4070 8GB', '16" 165Hz QHD']) },
    { name: 'HP Pavilion 15', slug: 'hp-pavilion-15', price: 54990, mrp: 67890, categoryId: laptopsId, subCategoryId: subcategories[4].id, brand: 'HP', seller: 'HP Official Store', rating: 4.2, reviewCount: 7654, isFeatured: false, isDealOfDay: false, images: JSON.stringify(['https://placehold.co/300x300/2d2d44/FFFFFF?text=HP+Pavilion+15']), features: JSON.stringify(['Intel i5-1340P', '16GB RAM', '512GB SSD', '15.6" FHD IPS', 'Windows 11', 'Fingerprint Reader']) },
    { name: 'Dell XPS 14', slug: 'dell-xps-14', price: 149990, mrp: 174990, categoryId: laptopsId, subCategoryId: subcategories[4].id, brand: 'Dell', seller: 'Dell Official Store', rating: 4.6, reviewCount: 3456, isFeatured: true, isDealOfDay: false, images: JSON.stringify(['https://placehold.co/300x300/2d2d44/FFFFFF?text=Dell+XPS+14']), features: JSON.stringify(['Intel Ultra 7', '16GB RAM', '512GB SSD', '14.5" OLED', 'Intel Arc Graphics']) },
    { name: 'Lenovo IdeaPad Slim 3', slug: 'lenovo-ideapad-slim-3', price: 37990, mrp: 47990, categoryId: laptopsId, subCategoryId: subcategories[5].id, brand: 'Lenovo', seller: 'Lenovo Official Store', rating: 4.1, reviewCount: 12345, isFeatured: false, isDealOfDay: true, images: JSON.stringify(['https://placehold.co/300x300/2d2d44/FFFFFF?text=Lenovo+IdeaPad']), features: JSON.stringify(['AMD Ryzen 5', '8GB RAM', '512GB SSD', '15.6" FHD', 'Windows 11', 'Anti-Glare Display']) },

    // Fashion - Men
    { name: 'Men\'s Slim Fit Cotton Shirt', slug: 'mens-slim-fit-cotton-shirt', price: 799, mrp: 1999, categoryId: fashionId, subCategoryId: subcategories[6].id, brand: 'Allen Solly', seller: 'FashionHub', rating: 4.2, reviewCount: 23456, isFeatured: false, isDealOfDay: true, images: JSON.stringify(['https://placehold.co/300x300/3d2b1f/FFFFFF?text=Cotton+Shirt']), features: JSON.stringify(['100% Cotton', 'Slim Fit', 'Full Sleeve', 'Formal Wear', 'Machine Washable']) },
    { name: 'Men\'s Denim Jeans', slug: 'mens-denim-jeans', price: 1299, mrp: 2999, categoryId: fashionId, subCategoryId: subcategories[6].id, brand: 'Levi\'s', seller: 'Levi\'s Official', rating: 4.4, reviewCount: 34567, isFeatured: true, isDealOfDay: false, images: JSON.stringify(['https://placehold.co/300x300/1e3a5f/FFFFFF?text=Denim+Jeans']), features: JSON.stringify(['100% Denim', 'Slim Fit', 'Mid Rise', '5 Pockets', 'Zip Fly']) },
    { name: 'Men\'s Running Shoes', slug: 'mens-running-shoes', price: 2499, mrp: 4999, categoryId: fashionId, subCategoryId: subcategories[8].id, brand: 'Nike', seller: 'Nike Official', rating: 4.5, reviewCount: 8765, isFeatured: true, isDealOfDay: true, images: JSON.stringify(['https://placehold.co/300x300/333333/FFFFFF?text=Running+Shoes']), features: JSON.stringify(['Mesh Upper', 'Rubber Sole', 'Lightweight', 'Cushioned Insole', 'Breathable']) },

    // Fashion - Women
    { name: 'Women\'s Ethnic Kurta Set', slug: 'womens-ethnic-kurta-set', price: 1499, mrp: 3999, categoryId: fashionId, subCategoryId: subcategories[7].id, brand: 'W for Women', seller: 'EthnicWorld', rating: 4.3, reviewCount: 15678, isFeatured: true, isDealOfDay: false, images: JSON.stringify(['https://placehold.co/300x300/8b1a4a/FFFFFF?text=Kurta+Set']), features: JSON.stringify(['Cotton Silk', 'Straight Fit', '3 Piece Set', 'Machine Wash', 'Traditional Print']) },
    { name: 'Women\'s Handbag', slug: 'womens-handbag', price: 899, mrp: 2499, categoryId: fashionId, subCategoryId: subcategories[7].id, brand: 'Hidesign', seller: 'BagWorld', rating: 4.1, reviewCount: 6543, isFeatured: false, isDealOfDay: true, images: JSON.stringify(['https://placehold.co/300x300/5c4033/FFFFFF?text=Handbag']), features: JSON.stringify(['Genuine Leather', 'Spacious', 'Multiple Pockets', 'Zip Closure', 'Adjustable Strap']) },

    // Electronics
    { name: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', price: 24990, mrp: 34990, categoryId: electronicsId, subCategoryId: subcategories[9].id, brand: 'Sony', seller: 'Sony Official', rating: 4.7, reviewCount: 12345, isFeatured: true, isDealOfDay: true, images: JSON.stringify(['https://placehold.co/300x300/1a1a2e/FFFFFF?text=Sony+XM5']), features: JSON.stringify(['Active Noise Cancellation', '30hr Battery', 'Multipoint Connection', 'Speak-to-Chat', 'Hi-Res Audio']) },
    { name: 'JBL Flip 6', slug: 'jbl-flip-6', price: 8999, mrp: 14999, categoryId: electronicsId, subCategoryId: subcategories[10].id, brand: 'JBL', seller: 'JBL Official', rating: 4.4, reviewCount: 9876, isFeatured: false, isDealOfDay: false, images: JSON.stringify(['https://placehold.co/300x300/ff6600/FFFFFF?text=JBL+Flip+6']), features: JSON.stringify(['IP67 Waterproof', '12hr Battery', 'Bluetooth 5.1', 'PartyBoost', 'Racetrack Driver']) },
    { name: 'Samsung Galaxy Tab S9', slug: 'samsung-galaxy-tab-s9', price: 69999, mrp: 84999, categoryId: electronicsId, subCategoryId: subcategories[11].id, brand: 'Samsung', seller: 'Samsung Official', rating: 4.5, reviewCount: 5432, isFeatured: true, isDealOfDay: false, images: JSON.stringify(['https://placehold.co/300x300/1a1a2e/FFFFFF?text=Galaxy+Tab+S9']), features: JSON.stringify(['11" AMOLED', '128GB Storage', 'S Pen Included', 'IP68 Rated', 'Snapdragon 8 Gen 2']) },
    { name: 'Boat Rockerz 450', slug: 'boat-rockerz-450', price: 1499, mrp: 2990, categoryId: electronicsId, subCategoryId: subcategories[9].id, brand: 'boAt', seller: 'boAt Official', rating: 4.0, reviewCount: 45678, isFeatured: false, isDealOfDay: true, images: JSON.stringify(['https://placehold.co/300x300/222222/FFFFFF?text=boAt+450']), features: JSON.stringify(['40mm Drivers', '15hr Battery', 'Bluetooth 5.0', 'Padded Ear Cushions', 'Foldable Design']) },

    // Home & Furniture
    { name: '3-Seater Fabric Sofa', slug: '3-seater-fabric-sofa', price: 18999, mrp: 34999, categoryId: homeId, subCategoryId: subcategories[12].id, brand: 'Urban Ladder', seller: 'HomeTown', rating: 4.3, reviewCount: 2345, isFeatured: true, isDealOfDay: false, images: JSON.stringify(['https://placehold.co/300x300/8B4513/FFFFFF?text=Fabric+Sofa']), features: JSON.stringify(['Fabric Upholstery', 'Solid Wood Frame', 'High Density Foam', '3-Seater', 'Easy Assembly']) },
    { name: 'King Size Bed with Storage', slug: 'king-size-bed-storage', price: 22999, mrp: 45999, categoryId: homeId, subCategoryId: subcategories[13].id, brand: 'Wakefit', seller: 'Wakefit Official', rating: 4.4, reviewCount: 3456, isFeatured: false, isDealOfDay: true, images: JSON.stringify(['https://placehold.co/300x300/654321/FFFFFF?text=King+Bed']), features: JSON.stringify(['Sheesham Wood', 'Hydraulic Storage', 'King Size', 'Mattress Not Included', '10yr Warranty']) },

    // Appliances
    { name: 'LG 8kg Washing Machine', slug: 'lg-8kg-washing-machine', price: 29990, mrp: 39990, categoryId: appliancesId, subCategoryId: subcategories[14].id, brand: 'LG', seller: 'LG Official', rating: 4.3, reviewCount: 5678, isFeatured: true, isDealOfDay: true, images: JSON.stringify(['https://placehold.co/300x300/cccccc/333333?text=LG+WM']), features: JSON.stringify(['8kg Capacity', 'Front Load', '1000 RPM', 'Inverter Motor', 'Steam Wash', '10yr Motor Warranty']) },
    { name: 'Samsung 265L Refrigerator', slug: 'samsung-265l-refrigerator', price: 24990, mrp: 31990, categoryId: appliancesId, subCategoryId: subcategories[15].id, brand: 'Samsung', seller: 'Samsung Official', rating: 4.2, reviewCount: 7890, isFeatured: false, isDealOfDay: false, images: JSON.stringify(['https://placehold.co/300x300/cccccc/333333?text=Samsung+Fridge']), features: JSON.stringify(['265L Capacity', 'Frost Free', 'Digital Inverter', '2 Star Rating', 'Convertible Freezer']) },
    { name: 'Daikin 1.5 Ton Split AC', slug: 'daikin-1-5-ton-split-ac', price: 39990, mrp: 54990, categoryId: appliancesId, subCategoryId: subcategories[16].id, brand: 'Daikin', seller: 'Daikin Official', rating: 4.4, reviewCount: 4567, isFeatured: true, isDealOfDay: true, images: JSON.stringify(['https://placehold.co/300x300/eeeeee/333333?text=Daikin+AC']), features: JSON.stringify(['1.5 Ton', 'Inverter', '5 Star Rating', 'Copper Condenser', 'PM 2.5 Filter', '10yr Warranty']) },

    // Beauty & Health
    { name: 'Face Serum Vitamin C', slug: 'face-serum-vitamin-c', price: 499, mrp: 999, categoryId: beautyId, subCategoryId: subcategories[17].id, brand: 'Minimalist', seller: 'Nykaa', rating: 4.3, reviewCount: 23456, isFeatured: false, isDealOfDay: true, images: JSON.stringify(['https://placehold.co/300x300/ffe4e1/333333?text=Vitamin+C+Serum']), features: JSON.stringify(['15% Vitamin C', '30ml', 'For All Skin Types', 'Brightening', 'Anti-Aging', 'Paraben Free']) },
    { name: 'MAC Lipstick Matte', slug: 'mac-lipstick-matte', price: 1499, mrp: 1799, categoryId: beautyId, subCategoryId: subcategories[18].id, brand: 'MAC', seller: 'MAC Official', rating: 4.5, reviewCount: 8765, isFeatured: true, isDealOfDay: false, images: JSON.stringify(['https://placehold.co/300x300/cc0000/FFFFFF?text=MAC+Lipstick']), features: JSON.stringify(['Matte Finish', 'Long Wearing', 'High Pigment', 'Multiple Shades', 'Dermatologist Tested']) },

    // Grocery
    { name: 'Tata Gold Tea 1kg', slug: 'tata-gold-tea-1kg', price: 549, mrp: 620, categoryId: groceryId, subCategoryId: subcategories[20].id, brand: 'Tata', seller: 'Tata Consumer', rating: 4.4, reviewCount: 34567, isFeatured: false, isDealOfDay: false, images: JSON.stringify(['https://placehold.co/300x300/006400/FFFFFF?text=Tata+Gold+Tea']), features: JSON.stringify(['1kg Pack', 'Premium Assam Tea', 'Rich Flavor', 'Natural Antioxidants']) },
    { name: 'Lays Classic Salted 52g (Pack of 6)', slug: 'lays-classic-salted-6pack', price: 180, mrp: 240, categoryId: groceryId, subCategoryId: subcategories[19].id, brand: 'Lays', seller: 'PepsiCo Official', rating: 4.2, reviewCount: 56789, isFeatured: false, isDealOfDay: true, images: JSON.stringify(['https://placehold.co/300x300/f4e04d/333333?text=Lays+6+Pack']), features: JSON.stringify(['Pack of 6', '52g Each', 'Classic Salted', 'No Preservatives', 'Vegetarian']) },

    // Sports
    { name: 'SG Kashmir Eco Cricket Bat', slug: 'sg-kashmir-eco-cricket-bat', price: 1599, mrp: 2499, categoryId: sportsId, subCategoryId: subcategories[21].id, brand: 'SG', seller: 'SportsDirect', rating: 4.3, reviewCount: 4321, isFeatured: false, isDealOfDay: false, images: JSON.stringify(['https://placehold.co/300x300/D2691E/FFFFFF?text=SG+Cricket+Bat']), features: JSON.stringify(['Kashmir Willow', 'Full Size', 'Traditional Shape', 'Gripped Handle', 'Leather Ball']) },
    { name: 'PowerMax Treadmill', slug: 'powermax-treadmill', price: 29999, mrp: 49999, categoryId: sportsId, subCategoryId: subcategories[22].id, brand: 'PowerMax', seller: 'FitGear', rating: 4.1, reviewCount: 2345, isFeatured: true, isDealOfDay: true, images: JSON.stringify(['https://placehold.co/300x300/333333/FFFFFF?text=Treadmill']), features: JSON.stringify(['3HP Motor', 'Max Speed 14km/h', 'Auto Incline', 'LCD Display', 'Foldable Design', 'Music Port']) },
  ];

  for (const p of productData) {
    const discount = Math.round(((p.mrp - p.price) / p.mrp) * 100);
    await prisma.product.create({ data: { ...p, discount } });
  }

  console.log(`✅ Created ${productData.length} products`);

  // Create banners
  const banners = await Promise.all([
    prisma.banner.create({
      data: {
        title: 'Mega Electronics Sale',
        subtitle: 'Up to 80% Off on Electronics',
        image: 'https://placehold.co/1344x768/2874f0/FFFFFF?text=⚡+Mega+Electronics+Sale+-+Up+to+80%25+Off',
        link: '/category/electronics',
        order: 1,
        active: true,
      },
    }),
    prisma.banner.create({
      data: {
        title: 'Fashion Carnival',
        subtitle: 'Min 40%-80% Off on Fashion',
        image: 'https://placehold.co/1344x768/ff9f00/FFFFFF?text=👗+Fashion+Carnival+-+Min+40%25-80%25+Off',
        link: '/category/fashion',
        order: 2,
        active: true,
      },
    }),
    prisma.banner.create({
      data: {
        title: 'Smartphones Fest',
        subtitle: 'Exchange Offers & No Cost EMI',
        image: 'https://placehold.co/1344x768/2874f0/FFFFFF?text=📱+Smartphones+Fest+-+Exchange+Offers+%26+No+Cost+EMI',
        link: '/category/mobiles',
        order: 3,
        active: true,
      },
    }),
    prisma.banner.create({
      data: {
        title: 'Home Appliances Deals',
        subtitle: 'Starting ₹4,999 | Extra 10% Off',
        image: 'https://placehold.co/1344x768/388e3c/FFFFFF?text=🏠+Home+Appliances+Deals+-+Starting+₹4,999',
        link: '/category/appliances',
        order: 4,
        active: true,
      },
    }),
  ]);

  console.log(`✅ Created ${banners.length} banners`);
  console.log('🎉 Seeding completed successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });