/* =====================================================
   SHAANWEAR — MASTER PRODUCT CATALOG
   Shared product data for PDP, grids, cart, and search
   ===================================================== */

(function () {
    'use strict';

    const JACKET_PATH = 'assets/images/products/jackets/';
    const SWEAT_PATH = 'assets/images/products/sweatshirts/';
    const TROUSER_PATH = 'assets/images/products/trousers/';
    const SHIRT_PATH = 'assets/images/products/casual-shirts/';
    const BELT_PATH = 'assets/images/products/belts/';

    const PRODUCTS = [
        /* ---------- EXPORT SURPLUS JACKETS ---------- */
        {
            id: 1,
            sku: 'SW-JKT-001',
            name: 'Olive Bomber Jacket (Factory Surplus)',
            category: 'Jackets',
            categorySlug: 'jackets',
            price: 3500,
            oldPrice: 4200,
            tag: 'SURPLUS',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Olive',
                    hex: '#556B2F',
                    images: [
                        JACKET_PATH + 'olive-front.jpg',
                        JACKET_PATH + 'olive-back.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg',
                        JACKET_PATH + 'grey-front.jpg'
                    ]
                },
                {
                    name: 'Grey',
                    hex: '#7A8288',
                    images: [
                        JACKET_PATH + 'grey-front.jpg',
                        JACKET_PATH + 'grey-back.jpg',
                        JACKET_PATH + 'olive-front.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'The Olive Bomber Jacket is engineered from heavy-duty flight satin with a water-resistant finish and plush insulated lining. Features custom antique brass hardware, ribbed storm cuffs, an arm utility pocket, and a structured silhouette tailored for contemporary streetwear aesthetics.',
            itemsIncluded: [
                {
                    item: 'Shirt / Upper Jacket',
                    fabric: 'High-density Flight Satin Shell with Diamond-Quilted Thermal Lining',
                    measurement: 'Small: Chest 40", Length 26" | Medium: Chest 42", Length 27" | Large: Chest 44", Length 28" | XL: Chest 46", Length 29"'
                },
                {
                    item: 'Shawl / Outer Wrap',
                    fabric: 'Cashmere-Blend Heavy Brushed Knit with finished self-fringes',
                    measurement: 'Length: 90 Inches (2.5 Metres) | Width: 42 Inches'
                },
                {
                    item: 'Trouser / Cargo Jogger',
                    fabric: 'Heavyweight Stretch Twill with elastic waistband and internal cotton drawstring',
                    measurement: 'Waist: 30-36" (Elasticated) | Outseam: 40" | Inseam: 30"'
                }
            ],
            disclaimer: 'This garment is curated from authentic export factory surplus and overstock manufacturing lots. SHAANWEAR is an independent surplus curator and is not an authorized distributor for third-party licensed labels. Slight shade or trim variations may exist between dye batches. Dry clean or machine wash cold gentle.',
            relatedIds: [2, 5, 7, 101]
        },
        {
            id: 2,
            sku: 'SW-JKT-002',
            name: 'Classic Zip Jacket - Export Stock',
            category: 'Jackets',
            categorySlug: 'jackets',
            price: 3000,
            oldPrice: 3500,
            tag: '-20%',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Grey',
                    hex: '#8C9298',
                    images: [
                        JACKET_PATH + 'grey-front.jpg',
                        JACKET_PATH + 'grey-back.jpg',
                        JACKET_PATH + 'blue-front.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg'
                    ]
                },
                {
                    name: 'Blue',
                    hex: '#2B3E50',
                    images: [
                        JACKET_PATH + 'blue-front.jpg',
                        JACKET_PATH + 'blue-back.jpg',
                        JACKET_PATH + 'grey-front.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Minimalist zip jacket crafted with premium brushed twill and weather-ready lining. Designed with an ergonomic drop-shoulder fit, dual exterior welt pockets, and reinforced flat-lock seam construction.',
            itemsIncluded: [
                {
                    item: 'Shirt / Jacket',
                    fabric: '100% Pre-washed Cotton Twill with breathable lining',
                    measurement: 'Small: Chest 40", Length 27" | Medium: Chest 42", Length 28" | Large: Chest 44", Length 29"'
                },
                {
                    item: 'Shawl / Wrap',
                    fabric: 'Thermal Wool-Blend Soft Knit',
                    measurement: 'Length: 90 Inches (2.5 Metres) | Width: 40 Inches'
                },
                {
                    item: 'Trouser / Bottom',
                    fabric: 'French Terry Cotton with ribbed ankles and drawcord',
                    measurement: 'Waist: 30-36" | Length: 40" | Inseam: 30"'
                }
            ],
            disclaimer: 'Curated as authentic export leftovers. All third-party trademarks belong to their rightful owners.',
            relatedIds: [1, 3, 6, 103]
        },
        {
            id: 3,
            sku: 'SW-JKT-003',
            name: 'Navy Urban Jacket (Factory Surplus)',
            category: 'Jackets',
            categorySlug: 'jackets',
            price: 3200,
            oldPrice: 3800,
            tag: '-15%',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Blue',
                    hex: '#1D2A3A',
                    images: [
                        JACKET_PATH + 'blue-front.jpg',
                        JACKET_PATH + 'blue-back.jpg',
                        JACKET_PATH + 'orange-front.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg'
                    ]
                },
                {
                    name: 'Orange',
                    hex: '#D35400',
                    images: [
                        JACKET_PATH + 'orange-front.jpg',
                        JACKET_PATH + 'orange-back.jpg',
                        JACKET_PATH + 'blue-front.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Engineered for metropolitan style and transition weather, this Navy Urban Jacket features storm flap protection, internal zip chest security pocket, and premium matte snaps.',
            itemsIncluded: [
                {
                    item: 'Shirt / Jacket',
                    fabric: 'Tech Micro-Canvas with DWR Water Repellent Coating',
                    measurement: 'Medium: Chest 42.5", Length 28" | Large: Chest 44.5", Length 29"'
                },
                {
                    item: 'Shawl / Wrap',
                    fabric: 'High GSM Woven Acrylic & Wool Warm Blend',
                    measurement: 'Length: 92 Inches | Width: 42 Inches'
                },
                {
                    item: 'Trouser / Bottom',
                    fabric: 'Tailored Twill with reinforced knee articulation',
                    measurement: 'Waist: 32-36" | Length: 40.5" | Inseam: 30.5"'
                }
            ],
            disclaimer: 'Curated as authentic export leftovers. All third-party trademarks belong to their rightful owners.',
            relatedIds: [1, 4, 7, 107]
        },
        {
            id: 4,
            sku: 'SW-JKT-004',
            name: 'Orange Track Jacket - Export Stock',
            category: 'Jackets',
            categorySlug: 'jackets',
            price: 3499,
            oldPrice: 4100,
            tag: 'SURPLUS',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Orange',
                    hex: '#E65100',
                    images: [
                        JACKET_PATH + 'orange-front.jpg',
                        JACKET_PATH + 'orange-back.jpg',
                        JACKET_PATH + 'olive-front.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg'
                    ]
                },
                {
                    name: 'Olive',
                    hex: '#556B2F',
                    images: [
                        JACKET_PATH + 'olive-front.jpg',
                        JACKET_PATH + 'olive-back.jpg',
                        JACKET_PATH + 'orange-front.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Vibrant color-block retro athletic track jacket with contrast piped arm taping, stand collar, and brushed tricot backing for supreme all-day comfort.',
            itemsIncluded: [
                {
                    item: 'Shirt / Jacket',
                    fabric: 'Performance Poly-Tricot with Brushed Interior',
                    measurement: 'Medium: Chest 42", Length 27.5" | Large: Chest 44", Length 28.5"'
                },
                {
                    item: 'Shawl / Wrap',
                    fabric: 'Thermal Brushed Wrap (2.5 Metres)',
                    measurement: 'Length: 90 Inches | Width: 40 Inches'
                },
                {
                    item: 'Trouser / Bottom',
                    fabric: 'Matching Track Pants with zippered side pockets',
                    measurement: 'Waist: 30-36" | Length: 40" | Inseam: 30"'
                }
            ],
            disclaimer: 'Factory surplus merchandise sourced via wholesale export lines.',
            relatedIds: [3, 8, 104, 108]
        },
        {
            id: 5,
            sku: 'SW-JKT-005',
            name: 'Minimalist Olive Jacket (Factory Surplus)',
            category: 'Jackets',
            categorySlug: 'jackets',
            price: 3799,
            oldPrice: 4500,
            tag: 'NEW',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Olive',
                    hex: '#4A5D33',
                    images: [
                        JACKET_PATH + 'olive-front.jpg',
                        JACKET_PATH + 'olive-back.jpg',
                        JACKET_PATH + 'grey-front.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg'
                    ]
                },
                {
                    name: 'Grey',
                    hex: '#6E767E',
                    images: [
                        JACKET_PATH + 'grey-front.jpg',
                        JACKET_PATH + 'grey-back.jpg',
                        JACKET_PATH + 'olive-front.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Streamlined utilitarian silhouette with concealed front snap placket, dual angled chest pockets, and relaxed dropped shoulder seams.',
            itemsIncluded: [
                {
                    item: 'Shirt / Jacket',
                    fabric: 'Premium Mercerized Cotton Canvas (340 GSM)',
                    measurement: 'Small: Chest 40", Length 27" | Medium: Chest 42", Length 28"'
                },
                {
                    item: 'Shawl / Outer',
                    fabric: 'Soft Pashmina-Touch Thermal Shawl',
                    measurement: 'Length: 90 Inches | Width: 42 Inches'
                },
                {
                    item: 'Trouser / Bottom',
                    fabric: 'Comfort Chino Stretch Fabric',
                    measurement: 'Waist: 32-35" | Length: 40" | Inseam: 30"'
                }
            ],
            disclaimer: 'Curated as authentic export leftovers. All third-party trademarks belong to their rightful owners.',
            relatedIds: [1, 2, 6, 106]
        },
        {
            id: 6,
            sku: 'SW-JKT-006',
            name: 'Sport Zip Jacket - Export Stock',
            category: 'Jackets',
            categorySlug: 'jackets',
            price: 3199,
            oldPrice: 3999,
            tag: '-20%',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Grey',
                    hex: '#7A8288',
                    images: [
                        JACKET_PATH + 'grey-front.jpg',
                        JACKET_PATH + 'grey-back.jpg',
                        JACKET_PATH + 'blue-front.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg'
                    ]
                },
                {
                    name: 'Blue',
                    hex: '#2B3E50',
                    images: [
                        JACKET_PATH + 'blue-front.jpg',
                        JACKET_PATH + 'blue-back.jpg',
                        JACKET_PATH + 'grey-front.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Active lifestyle zip jacket built with 4-way stretch weave, ergonomic raglan sleeves, and laser-cut breathability panels for uninhibited movement.',
            itemsIncluded: [
                {
                    item: 'Shirt / Jacket',
                    fabric: '4-Way Stretch Windproof Softshell',
                    measurement: 'Medium: Chest 42", Length 27.5"'
                },
                {
                    item: 'Shawl / Wrap',
                    fabric: 'Thermal Brushed Wrap (2.5 Metres)',
                    measurement: 'Length: 90 Inches | Width: 40 Inches'
                },
                {
                    item: 'Trouser / Bottom',
                    fabric: 'Athletic Tapered Jogger with zip cuffs',
                    measurement: 'Waist: 30-36" | Length: 40"'
                }
            ],
            disclaimer: 'Curated as authentic export leftovers.',
            relatedIds: [2, 3, 7, 107]
        },
        {
            id: 7,
            sku: 'SW-JKT-007',
            name: 'Navy Signature Jacket (Factory Surplus)',
            category: 'Jackets',
            categorySlug: 'jackets',
            price: 3899,
            oldPrice: 4800,
            tag: 'BESTSELLER',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Blue',
                    hex: '#1B263B',
                    images: [
                        JACKET_PATH + 'blue-front.jpg',
                        JACKET_PATH + 'blue-back.jpg',
                        JACKET_PATH + 'orange-front.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg'
                    ]
                },
                {
                    name: 'Orange',
                    hex: '#D35400',
                    images: [
                        JACKET_PATH + 'orange-front.jpg',
                        JACKET_PATH + 'orange-back.jpg',
                        JACKET_PATH + 'blue-front.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Our flagship Navy Signature Jacket features high-thread-count memory fabric that resists wrinkles, tonal gunmetal zipper pulls, and dual hidden security compartments.',
            itemsIncluded: [
                {
                    item: 'Shirt / Jacket',
                    fabric: 'High-Thread Count Poly-Nylon Memory Shell',
                    measurement: 'Medium: Chest 43", Length 28" | Large: Chest 45", Length 29"'
                },
                {
                    item: 'Shawl / Wrap',
                    fabric: 'High-Grade Wool Blend with Soft Touch (2.5 Metres)',
                    measurement: 'Length: 92 Inches | Width: 42 Inches'
                },
                {
                    item: 'Trouser / Bottom',
                    fabric: 'Matching Heavy Rib Knit Bottoms with drawstring',
                    measurement: 'Waist: 32-37" | Length: 41"'
                }
            ],
            disclaimer: 'Curated as authentic export leftovers. All third-party trademarks belong to their rightful owners.',
            relatedIds: [1, 3, 5, 103]
        },
        {
            id: 8,
            sku: 'SW-JKT-008',
            name: 'Rust Orange Jacket - Export Stock',
            category: 'Jackets',
            categorySlug: 'jackets',
            price: 3299,
            oldPrice: 3999,
            tag: 'SURPLUS',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Orange',
                    hex: '#C0392B',
                    images: [
                        JACKET_PATH + 'orange-front.jpg',
                        JACKET_PATH + 'orange-back.jpg',
                        JACKET_PATH + 'olive-front.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg'
                    ]
                },
                {
                    name: 'Olive',
                    hex: '#556B2F',
                    images: [
                        JACKET_PATH + 'olive-front.jpg',
                        JACKET_PATH + 'olive-back.jpg',
                        JACKET_PATH + 'orange-front.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Warm rust tone jacket lined with lightweight polar fleece for optimal heat retention during chilly winter evenings.',
            itemsIncluded: [
                {
                    item: 'Shirt / Jacket',
                    fabric: 'Brushed Micro-Ripstop with Polar Fleece Core',
                    measurement: 'Medium: Chest 42", Length 27"'
                },
                {
                    item: 'Shawl / Wrap',
                    fabric: 'Brushed Wool Blend Wrap (2.5 Metres)',
                    measurement: 'Length: 90 Inches | Width: 40 Inches'
                },
                {
                    item: 'Trouser / Bottom',
                    fabric: 'Comfort French Terry Joggers',
                    measurement: 'Waist: 30-35" | Length: 40"'
                }
            ],
            disclaimer: 'Curated as authentic export leftovers.',
            relatedIds: [4, 7, 104, 108]
        },

        /* ---------- SWEATSHIRTS COLLECTION ---------- */
        {
            id: 101,
            sku: 'SW-SWT-101',
            name: 'SHAANWEAR Essential Crewneck Sweatshirt',
            category: 'Sweatshirts',
            categorySlug: 'sweatshirts',
            price: 3999,
            oldPrice: 4799,
            tag: 'NEW',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Grey',
                    hex: '#8E959B',
                    images: [
                        SWEAT_PATH + 'premium-sweatshirt=03.jpg',
                        SWEAT_PATH + 'premium-sweatshirt-01.jpg',
                        JACKET_PATH + 'grey-front.jpg',
                        JACKET_PATH + 'grey-back.jpg'
                    ]
                },
                {
                    name: 'Olive',
                    hex: '#556B2F',
                    images: [
                        JACKET_PATH + 'olive-front.jpg',
                        JACKET_PATH + 'olive-back.jpg',
                        SWEAT_PATH + 'premium-sweatshirt=03.jpg',
                        SWEAT_PATH + 'oversized-sweatshirt-01.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            description: 'A timeless wardrobe essential crafted from 100% combed cotton fleece (380 GSM). Built with reinforced double-needle coverstitching, a classic crew neckline with V-notch triangle detailing, and pre-shrunk construction for longevity.',
            itemsIncluded: [
                {
                    item: 'Shirt / Crewneck Top',
                    fabric: '100% Combed Cotton Fleece (380 GSM Brushed Interior)',
                    measurement: 'Small: Chest 40", Length 27" | Medium: Chest 42", Length 28" | Large: Chest 44", Length 29" | XL: Chest 46", Length 30"'
                },
                {
                    item: 'Shawl / Winter Stole',
                    fabric: 'Super-Soft Cashmere-Touch Acrylic & Wool Blend',
                    measurement: 'Length: 90 Inches (2.5 Metres) | Width: 42 Inches'
                },
                {
                    item: 'Trouser / Fleece Jogger',
                    fabric: 'Matching Heavyweight Cotton Fleece with Cotton Drawcord',
                    measurement: 'Waist: 30-36" (Elasticated) | Length: 40.5" | Inseam: 30"'
                }
            ],
            disclaimer: 'All items are genuine surplus and direct factory stock. SHAANWEAR guarantees authentic fabric quality and careful inspection before shipping.',
            relatedIds: [102, 103, 105, 1]
        },
        {
            id: 102,
            sku: 'SW-SWT-102',
            name: 'SHAANWEAR Oversized Heavyweight Sweatshirt',
            category: 'Sweatshirts',
            categorySlug: 'sweatshirts',
            price: 4299,
            oldPrice: 4999,
            tag: '-15%',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Olive',
                    hex: '#4F5D38',
                    images: [
                        SWEAT_PATH + 'oversized-sweatshirt-01.jpg',
                        SWEAT_PATH + 'oversized-sweatshirt-02.jpg',
                        JACKET_PATH + 'olive-front.jpg',
                        JACKET_PATH + 'olive-back.jpg'
                    ]
                },
                {
                    name: 'Blue',
                    hex: '#2B3E50',
                    images: [
                        JACKET_PATH + 'blue-front.jpg',
                        JACKET_PATH + 'blue-back.jpg',
                        SWEAT_PATH + 'oversized-sweatshirt-01.jpg',
                        SWEAT_PATH + 'premium-sweatshirt=03.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Designed with an exaggerated boxy drape, our Heavyweight 400 GSM fleece sweatshirt gives you effortless volume and unparalleled cozy warmth. Features dense ribbed cuffs and dropped shoulders.',
            itemsIncluded: [
                {
                    item: 'Shirt / Oversized Top',
                    fabric: '400 GSM Ultra-Heavy Cotton Fleece with Brushed Lining',
                    measurement: 'Small: Chest 44", Length 28" | Medium: Chest 46", Length 29" | Large: Chest 48", Length 30"'
                },
                {
                    item: 'Shawl / Blanket Wrap',
                    fabric: 'Thermal Wool-Blend Oversized Shawl (2.5 Metres)',
                    measurement: 'Length: 92 Inches | Width: 44 Inches'
                },
                {
                    item: 'Trouser / Wide-Leg Jogger',
                    fabric: 'Matching Heavy French Terry with Deep Pockets',
                    measurement: 'Waist: 30-38" | Outseam: 41" | Inseam: 31"'
                }
            ],
            disclaimer: 'Curated as authentic export leftovers. Machine wash cold with similar colors.',
            relatedIds: [101, 103, 106, 3]
        },
        {
            id: 103,
            sku: 'SW-SWT-103',
            name: 'SHAANWEAR Signature Zip-Up Sweatshirt',
            category: 'Sweatshirts',
            categorySlug: 'sweatshirts',
            price: 4499,
            oldPrice: 5299,
            tag: 'HOT',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Blue',
                    hex: '#1F2A38',
                    images: [
                        JACKET_PATH + 'blue-front.jpg',
                        JACKET_PATH + 'blue-back.jpg',
                        SWEAT_PATH + 'premium-sweatshirt=03.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg'
                    ]
                },
                {
                    name: 'Orange',
                    hex: '#D35400',
                    images: [
                        JACKET_PATH + 'orange-front.jpg',
                        JACKET_PATH + 'orange-back.jpg',
                        SWEAT_PATH + 'oversized-sweatshirt-01.jpg',
                        JACKET_PATH + 'jacketcategory-01.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Premium brushed fleece zip-up with two-way heavy metal zipper, split kangaroo pockets, and high stand collar. Ergonomically tailored for layering over tees or under topcoats.',
            itemsIncluded: [
                {
                    item: 'Shirt / Zip-Up Top',
                    fabric: '100% Pre-Shrunk Brushed Cotton Fleece (380 GSM)',
                    measurement: 'Small: Chest 41", Length 27" | Medium: Chest 43", Length 28" | Large: Chest 45", Length 29"'
                },
                {
                    item: 'Shawl / Wrap',
                    fabric: 'Cashmere-Finish Thermal Stole (2.5 Metres)',
                    measurement: 'Length: 90 Inches | Width: 42 Inches'
                },
                {
                    item: 'Trouser / Bottom',
                    fabric: 'Fleece Jogger with custom metal eyelets & thick drawstring',
                    measurement: 'Waist: 31-36" | Length: 40.5" | Inseam: 30"'
                }
            ],
            disclaimer: 'All garments are authentic quality factory surplus. SHAANWEAR is not an official distributor of third-party licensed brands.',
            relatedIds: [101, 107, 3, 7]
        },
        {
            id: 104,
            sku: 'SW-SWT-104',
            name: 'SHAANWEAR Athletic Pullover Sweatshirt',
            category: 'Sweatshirts',
            categorySlug: 'sweatshirts',
            price: 3799,
            oldPrice: 4499,
            tag: '-15%',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Orange',
                    hex: '#E65100',
                    images: [
                        JACKET_PATH + 'orange-front.jpg',
                        JACKET_PATH + 'orange-back.jpg',
                        SWEAT_PATH + 'premium-sweatshirt=03.jpg',
                        JACKET_PATH + 'grey-front.jpg'
                    ]
                },
                {
                    name: 'Grey',
                    hex: '#7A8288',
                    images: [
                        JACKET_PATH + 'grey-front.jpg',
                        JACKET_PATH + 'grey-back.jpg',
                        SWEAT_PATH + 'premium-sweatshirt-01.jpg',
                        JACKET_PATH + 'orange-front.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Engineered with quick-dry cotton-poly blend and soft looped French Terry interior for training, leisure, or everyday comfort.',
            itemsIncluded: [
                {
                    item: 'Shirt / Pullover',
                    fabric: 'Performance French Terry (340 GSM)',
                    measurement: 'Medium: Chest 42", Length 27.5"'
                },
                {
                    item: 'Shawl / Wrap',
                    fabric: 'Thermal Soft Wrap (2.5 Metres)',
                    measurement: 'Length: 90 Inches | Width: 40 Inches'
                },
                {
                    item: 'Trouser / Bottom',
                    fabric: 'Athletic Tapered Joggers',
                    measurement: 'Waist: 30-36" | Length: 40"'
                }
            ],
            disclaimer: 'Curated as authentic export leftovers.',
            relatedIds: [101, 108, 4, 8]
        },
        {
            id: 105,
            sku: 'SW-SWT-105',
            name: 'SHAANWEAR Vintage Wash Sweatshirt',
            category: 'Sweatshirts',
            categorySlug: 'sweatshirts',
            price: 4199,
            oldPrice: 4899,
            tag: 'NEW',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Grey',
                    hex: '#5E656B',
                    images: [
                        SWEAT_PATH + 'premium-sweatshirt=03.jpg',
                        SWEAT_PATH + 'premium-sweatshirt-01.jpg',
                        JACKET_PATH + 'grey-front.jpg',
                        JACKET_PATH + 'olive-front.jpg'
                    ]
                },
                {
                    name: 'Olive',
                    hex: '#4B5539',
                    images: [
                        JACKET_PATH + 'olive-front.jpg',
                        JACKET_PATH + 'olive-back.jpg',
                        SWEAT_PATH + 'oversized-sweatshirt-01.jpg',
                        JACKET_PATH + 'grey-front.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Pigment-dyed and garment washed with pumice stones for an authentic vintage sun-faded patina. Soft, broken-in feel from day one.',
            itemsIncluded: [
                {
                    item: 'Shirt / Sweatshirt',
                    fabric: '100% Pigment-Dyed Cotton French Terry',
                    measurement: 'Medium: Chest 43", Length 28"'
                },
                {
                    item: 'Shawl / Wrap',
                    fabric: 'Pashmina Touch Acrylic/Wool Blend',
                    measurement: 'Length: 90 Inches | Width: 42 Inches'
                },
                {
                    item: 'Trouser / Bottom',
                    fabric: 'Matching Pigment Wash Jogger Bottom',
                    measurement: 'Waist: 31-36" | Length: 40.5"'
                }
            ],
            disclaimer: 'Curated as authentic export leftovers.',
            relatedIds: [101, 106, 5, 2]
        },
        {
            id: 106,
            sku: 'SW-SWT-106',
            name: 'SHAANWEAR Minimalist Olive Sweatshirt',
            category: 'Sweatshirts',
            categorySlug: 'sweatshirts',
            price: 3899,
            oldPrice: 4599,
            tag: '-15%',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Olive',
                    hex: '#4F5D38',
                    images: [
                        JACKET_PATH + 'olive-front.jpg',
                        JACKET_PATH + 'olive-back.jpg',
                        SWEAT_PATH + 'premium-sweatshirt=03.jpg',
                        JACKET_PATH + 'blue-front.jpg'
                    ]
                },
                {
                    name: 'Blue',
                    hex: '#2B3E50',
                    images: [
                        JACKET_PATH + 'blue-front.jpg',
                        JACKET_PATH + 'blue-back.jpg',
                        SWEAT_PATH + 'oversized-sweatshirt-02.jpg',
                        JACKET_PATH + 'olive-front.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Subtle tone-on-tone embroidery, minimal seam design, and an exceptionally soft cotton-modal fleece interior.',
            itemsIncluded: [
                {
                    item: 'Shirt / Top',
                    fabric: 'Cotton-Modal Fleece (360 GSM)',
                    measurement: 'Medium: Chest 42", Length 28"'
                },
                {
                    item: 'Shawl / Wrap',
                    fabric: 'Thermal Soft Wrap (2.5 Metres)',
                    measurement: 'Length: 90 Inches | Width: 40 Inches'
                },
                {
                    item: 'Trouser / Bottom',
                    fabric: 'Slim-Tapered Cotton Jogger',
                    measurement: 'Waist: 30-36" | Length: 40"'
                }
            ],
            disclaimer: 'Curated as authentic export leftovers.',
            relatedIds: [101, 105, 5, 1]
        },
        {
            id: 107,
            sku: 'SW-SWT-107',
            name: 'SHAANWEAR Urban Sport Sweatshirt',
            category: 'Sweatshirts',
            categorySlug: 'sweatshirts',
            price: 4599,
            oldPrice: 5399,
            tag: 'BESTSELLER',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Blue',
                    hex: '#1D2A3A',
                    images: [
                        JACKET_PATH + 'blue-front.jpg',
                        JACKET_PATH + 'blue-back.jpg',
                        SWEAT_PATH + 'premium-sweatshirt=03.jpg',
                        JACKET_PATH + 'orange-front.jpg'
                    ]
                },
                {
                    name: 'Orange',
                    hex: '#D35400',
                    images: [
                        JACKET_PATH + 'orange-front.jpg',
                        JACKET_PATH + 'orange-back.jpg',
                        SWEAT_PATH + 'oversized-sweatshirt-01.jpg',
                        JACKET_PATH + 'blue-front.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Modern technical silhouette with bonded zipper sleeve pocket, articulated sleeve elbows, and premium interlock fleece.',
            itemsIncluded: [
                {
                    item: 'Shirt / Top',
                    fabric: 'Tech Interlock Double-Knit Cotton (370 GSM)',
                    measurement: 'Medium: Chest 43", Length 28.5"'
                },
                {
                    item: 'Shawl / Wrap',
                    fabric: 'Soft Wool-Touch Shawl (2.5 Metres)',
                    measurement: 'Length: 92 Inches | Width: 42 Inches'
                },
                {
                    item: 'Trouser / Bottom',
                    fabric: 'Matching Interlock Bottoms with waterproof pocket zips',
                    measurement: 'Waist: 32-37" | Length: 41"'
                }
            ],
            disclaimer: 'Curated as authentic export leftovers.',
            relatedIds: [103, 101, 7, 3]
        },
        {
            id: 108,
            sku: 'SW-SWT-108',
            name: 'SHAANWEAR Rust Fleece Sweatshirt',
            category: 'Sweatshirts',
            categorySlug: 'sweatshirts',
            price: 3999,
            oldPrice: 4699,
            tag: 'NEW',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Orange',
                    hex: '#C0392B',
                    images: [
                        JACKET_PATH + 'orange-front.jpg',
                        JACKET_PATH + 'orange-back.jpg',
                        SWEAT_PATH + 'premium-sweatshirt=03.jpg',
                        JACKET_PATH + 'grey-front.jpg'
                    ]
                },
                {
                    name: 'Grey',
                    hex: '#7A8288',
                    images: [
                        JACKET_PATH + 'grey-front.jpg',
                        JACKET_PATH + 'grey-back.jpg',
                        SWEAT_PATH + 'oversized-sweatshirt-01.jpg',
                        JACKET_PATH + 'orange-front.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Rich rust terracotta dye with brushed sherpa micro-fleece interior lining, perfect for layering during chilly evenings.',
            itemsIncluded: [
                {
                    item: 'Shirt / Top',
                    fabric: 'Heavyweight Sherpa-Backed Cotton Fleece (390 GSM)',
                    measurement: 'Medium: Chest 42", Length 28"'
                },
                {
                    item: 'Shawl / Wrap',
                    fabric: 'Thermal Wool-Blend Wrap (2.5 Metres)',
                    measurement: 'Length: 90 Inches | Width: 40 Inches'
                },
                {
                    item: 'Trouser / Bottom',
                    fabric: 'Warm French Terry Joggers',
                    measurement: 'Waist: 30-36" | Length: 40"'
                }
            ],
            disclaimer: 'Curated as authentic export leftovers.',
            relatedIds: [104, 101, 8, 4]
        },

        /* ---------- TROUSERS COLLECTION ---------- */
        {
            id: 201,
            sku: 'SW-TRS-201',
            name: 'Modern Tailored Slim-Fit Trousers',
            category: 'Trousers',
            categorySlug: 'trousers',
            price: 3290,
            oldPrice: 3890,
            tag: 'BESTSELLER',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Charcoal',
                    hex: '#2F3542',
                    images: [
                        TROUSER_PATH + 'slim-fit-trousers-01.jpg',
                        TROUSER_PATH + 'relaxed-fit-trousers-01.jpg',
                        SWEAT_PATH + 'premium-sweatshirt=03.jpg',
                        JACKET_PATH + 'grey-front.jpg'
                    ]
                },
                {
                    name: 'Khaki',
                    hex: '#B79A68',
                    images: [
                        TROUSER_PATH + 'relaxed-fit-trousers-01.jpg',
                        TROUSER_PATH + 'slim-fit-trousers-01.jpg',
                        JACKET_PATH + 'olive-front.jpg',
                        SWEAT_PATH + 'oversized-sweatshirt-01.jpg'
                    ]
                }
            ],
            sizes: ['30', '32', '34', '36', '38'],
            description: 'Crafted from high-tensile stretch twill with a tailored clean leg line. Features a concealed comfort stretch waistband, blind-stitched hems, and crease-resistant finishing.',
            itemsIncluded: [
                {
                    item: 'Shirt / Top',
                    fabric: 'Tailored Oxford Cotton Button-Down (220 GSM)',
                    measurement: 'Medium: Chest 42", Length 29"'
                },
                {
                    item: 'Shawl / Wrap',
                    fabric: 'Textured Wool Stole (2.5 Metres)',
                    measurement: 'Length: 90 Inches | Width: 40 Inches'
                },
                {
                    item: 'Trouser / Bottom',
                    fabric: 'Four-Way Stretch Cotton-Spandex Chino Twill',
                    measurement: 'Size 32: Waist 32", Outseam 41", Inseam 31", Leg Opening 14"'
                }
            ],
            disclaimer: 'Curated as authentic surplus and export stock. SHAANWEAR is an independent apparel curator.',
            relatedIds: [202, 101, 1, 401]
        },
        {
            id: 202,
            sku: 'SW-TRS-202',
            name: 'Relaxed Fit Everyday Trousers',
            category: 'Trousers',
            categorySlug: 'trousers',
            price: 2990,
            oldPrice: 3490,
            tag: 'NEW',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Olive',
                    hex: '#556B2F',
                    images: [
                        TROUSER_PATH + 'relaxed-fit-trousers-01.jpg',
                        TROUSER_PATH + 'slim-fit-trousers-01.jpg',
                        JACKET_PATH + 'olive-front.jpg',
                        SWEAT_PATH + 'oversized-sweatshirt-02.jpg'
                    ]
                }
            ],
            sizes: ['30', '32', '34', '36'],
            description: 'Easy-wearing relaxed cut with slight taper towards the ankle. Features deep slash front pockets and dual rear buttoned pockets.',
            itemsIncluded: [
                {
                    item: 'Shirt / Top',
                    fabric: 'Casual Cotton Slub Tee (190 GSM)',
                    measurement: 'Medium: Chest 42", Length 28"'
                },
                {
                    item: 'Shawl / Wrap',
                    fabric: 'Soft Brushed Acrylic Shawl (2.5 Metres)',
                    measurement: 'Length: 90 Inches | Width: 40 Inches'
                },
                {
                    item: 'Trouser / Bottom',
                    fabric: '100% Breathable Enzyme-Washed Cotton Twill',
                    measurement: 'Size 32: Waist 32-34", Outseam 40.5", Inseam 30.5"'
                }
            ],
            disclaimer: 'Curated as authentic export leftovers.',
            relatedIds: [201, 102, 5, 402]
        },

        /* ---------- CASUAL SHIRTS COLLECTION ---------- */
        {
            id: 301,
            sku: 'SW-SHT-301',
            name: 'Oxford Button-Down Casual Shirt',
            category: 'Casual Shirts',
            categorySlug: 'casual-shirts',
            price: 2790,
            oldPrice: 3290,
            tag: 'POPULAR',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Sky Blue',
                    hex: '#A0C4E2',
                    images: [
                        SHIRT_PATH + 'oxford-casual-shirt-01.jpg',
                        SHIRT_PATH + 'classic-casual-shirt-01.jpg',
                        TROUSER_PATH + 'slim-fit-trousers-01.jpg',
                        BELT_PATH + 'classic-leather-belt-01.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Classic heavy Oxford cloth woven from two-ply combed cotton. Features mother-of-pearl buttons, a soft rolled collar, and box pleat with locker loop.',
            itemsIncluded: [
                {
                    item: 'Shirt / Oxford Shirt',
                    fabric: '100% Two-Ply Combed Oxford Cotton (180 GSM)',
                    measurement: 'Small: Chest 39", Collar 15" | Medium: Chest 42", Collar 15.5" | Large: Chest 44", Collar 16"'
                },
                {
                    item: 'Shawl / Wrap',
                    fabric: 'Wool-Blend Lightweight Wrap (2.5 Metres)',
                    measurement: 'Length: 90 Inches | Width: 40 Inches'
                },
                {
                    item: 'Trouser / Bottom',
                    fabric: 'Tailored Twill Chino',
                    measurement: 'Waist: 32" | Outseam: 41"'
                }
            ],
            disclaimer: 'Curated as authentic surplus and export stock.',
            relatedIds: [302, 201, 101, 401]
        },
        {
            id: 302,
            sku: 'SW-SHT-302',
            name: 'Classic Fit Denim Casual Shirt',
            category: 'Casual Shirts',
            categorySlug: 'casual-shirts',
            price: 2990,
            oldPrice: 3590,
            tag: 'NEW',
            itemType: '3 Piece',
            items: ['3 Piece', '2 Piece', '1 Piece'],
            colors: [
                {
                    name: 'Indigo',
                    hex: '#2B4A6F',
                    images: [
                        SHIRT_PATH + 'classic-casual-shirt-01.jpg',
                        SHIRT_PATH + 'oxford-casual-shirt-01.jpg',
                        TROUSER_PATH + 'relaxed-fit-trousers-01.jpg',
                        JACKET_PATH + 'olive-front.jpg'
                    ]
                }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Lightweight indigo-dyed cotton denim treated with natural enzymes for a lived-in texture and soft hand feel. Dual snap chest pockets.',
            itemsIncluded: [
                {
                    item: 'Shirt / Denim Shirt',
                    fabric: '6.5 oz Indigo Cotton Denim',
                    measurement: 'Medium: Chest 42.5", Length 29"'
                },
                {
                    item: 'Shawl / Wrap',
                    fabric: 'Brushed Acrylic Shawl (2.5 Metres)',
                    measurement: 'Length: 90 Inches | Width: 40 Inches'
                },
                {
                    item: 'Trouser / Bottom',
                    fabric: 'Relaxed Fit Everyday Cotton Twill',
                    measurement: 'Waist: 32" | Outseam: 40.5"'
                }
            ],
            disclaimer: 'Curated as authentic surplus and export stock.',
            relatedIds: [301, 201, 105, 1]
        },

        /* ---------- BELTS COLLECTION ---------- */
        {
            id: 401,
            sku: 'SW-BLT-401',
            name: 'Handcrafted Premium Leather Belt',
            category: 'Belts',
            categorySlug: 'belts',
            price: 1890,
            oldPrice: 2290,
            tag: 'SURPLUS',
            itemType: '1 Piece',
            items: ['1 Piece'],
            colors: [
                {
                    name: 'Espresso Brown',
                    hex: '#4A3525',
                    images: [
                        BELT_PATH + 'belts.jpeg',
                        BELT_PATH + 'premium-leather-belt-01.jpg',
                        BELT_PATH + 'classic-leather-belt-01.jpg',
                        TROUSER_PATH + 'slim-fit-trousers-01.jpg'
                    ]
                },
                {
                    name: 'Black',
                    hex: '#111111',
                    images: [
                        BELT_PATH + 'classic-leather-belt-01.jpg',
                        BELT_PATH + 'belts.jpeg',
                        BELT_PATH + 'premium-leather-belt-01.jpg',
                        TROUSER_PATH + 'slim-fit-trousers-01.jpg'
                    ]
                }
            ],
            sizes: ['32', '34', '36', '38', '40'],
            description: 'Handcrafted from full-grain vegetable-tanned bovine leather with beveled hand-burnished edges and brushed antique silver buckle hardware.',
            itemsIncluded: [
                {
                    item: 'Belt',
                    fabric: '100% Full-Grain Vegetable-Tanned Leather (3.8mm Thickness)',
                    measurement: 'Width: 35mm (1.38 Inches) | Length: Sized to waist with 5 adjustment holes'
                }
            ],
            disclaimer: 'Genuine leather export surplus accessories.',
            relatedIds: [402, 201, 202, 301]
        },
        {
            id: 402,
            sku: 'SW-BLT-402',
            name: 'Classic Buckle Formal Leather Belt',
            category: 'Belts',
            categorySlug: 'belts',
            price: 1690,
            oldPrice: 1990,
            tag: 'ESSENTIAL',
            itemType: '1 Piece',
            items: ['1 Piece'],
            colors: [
                {
                    name: 'Black',
                    hex: '#1A1A1A',
                    images: [
                        BELT_PATH + 'classic-leather-belt-01.jpg',
                        BELT_PATH + 'belts.jpeg',
                        BELT_PATH + 'premium-leather-belt-01.jpg',
                        TROUSER_PATH + 'slim-fit-trousers-01.jpg'
                    ]
                }
            ],
            sizes: ['32', '34', '36', '38', '40'],
            description: 'Sleek top-grain dress belt featuring feathered edges, double keepers, and polished gunmetal buckle.',
            itemsIncluded: [
                {
                    item: 'Belt',
                    fabric: '100% Genuine Top-Grain Leather',
                    measurement: 'Width: 32mm | Hand-stitched perimeter'
                }
            ],
            disclaimer: 'Curated as authentic surplus and export stock.',
            relatedIds: [401, 201, 301, 101]
        }
    ];

    // Expose globally
    window.SHAANWEAR_PRODUCTS = PRODUCTS;

    window.getProductById = function (id) {
        const numId = parseInt(id, 10);
        return PRODUCTS.find(p => p.id === numId) || PRODUCTS[0];
    };

    window.getRelatedProducts = function (product, limit = 4) {
        if (!product) return PRODUCTS.slice(0, limit);
        let related = [];
        if (product.relatedIds && product.relatedIds.length) {
            related = product.relatedIds
                .map(id => PRODUCTS.find(p => p.id === id))
                .filter(Boolean);
        }
        if (related.length < limit) {
            const sameCategory = PRODUCTS.filter(p => p.id !== product.id && p.category === product.category && !related.includes(p));
            related = related.concat(sameCategory);
        }
        if (related.length < limit) {
            const others = PRODUCTS.filter(p => p.id !== product.id && !related.includes(p));
            related = related.concat(others);
        }
        return related.slice(0, limit);
    };

    console.log('[SHAANWEAR Catalog] Loaded', PRODUCTS.length, 'products');
})();
