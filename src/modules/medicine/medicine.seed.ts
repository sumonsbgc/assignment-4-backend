import { prisma } from "@lib/prisma";
import { helper } from "@/helper";

export async function seedMedicines() {
	console.log("💊 Seeding medicines...");

	const painRelief = await prisma.category.findFirst({
		where: { slug: "pain-relief" },
	});
	const coldFlu = await prisma.category.findFirst({
		where: { slug: "cold-flu" },
	});
	const vitamins = await prisma.category.findFirst({
		where: { slug: "vitamins-supplements" },
	});
	const digestive = await prisma.category.findFirst({
		where: { slug: "digestive-health" },
	});

	// Get or create a demo seller user
	let seller = await prisma.user.findFirst({
		where: { role: "SELLER" },
	});

	if (!seller) {
		seller = await prisma.user.create({
			data: {
				id: "demo-seller-001",
				name: "PharmaCare Store",
				email: "seller@pharmacare.com",
				role: "SELLER",
				status: "ACTIVE",
			},
		});
	}

	// Sample medicines
	const medicines = [
		// Pain Relief Medicines
		{
			name: "Paracetamol 500mg",
			genericName: "Paracetamol",
			manufacturer: "Square Pharmaceuticals",
			price: 2.5,
			discountPrice: 2.0,
			discountPercentage: 20,
			stockQuantity: 500,
			lowStockThreshold: 50,
			unit: "strip",
			dosageForm: "tablet",
			strength: "500mg",
			packSize: "10 tablets per strip",
			description:
				"Effective pain reliever and fever reducer for headaches, body aches, and cold symptoms. Fast-acting formula that provides relief within 30 minutes.",
			imageUrl:
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			images: [
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			],
			ingredients: "Paracetamol 500mg per tablet",
			sideEffects:
				"Nausea, skin rash (rare), allergic reactions in sensitive individuals",
			warnings:
				"Do not exceed recommended dose. Consult doctor if pregnant or breastfeeding. Not suitable for children under 6 years.",
			storage: "Store below 30°C in a dry place, away from direct sunlight",
			requiresPrescription: false,
			categoryId: painRelief?.id || "",
			sellerId: seller.id,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Ibuprofen 400mg",
			genericName: "Ibuprofen",
			manufacturer: "Beximco Pharmaceuticals",
			price: 3.5,
			discountPrice: 3.0,
			discountPercentage: 14,
			stockQuantity: 300,
			lowStockThreshold: 40,
			unit: "strip",
			dosageForm: "tablet",
			strength: "400mg",
			packSize: "10 tablets per strip",
			description:
				"Non-steroidal anti-inflammatory drug (NSAID) for muscle pain, arthritis, dental pain, and menstrual cramps. Reduces inflammation and swelling.",
			imageUrl:
				"https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400",
			images: [
				"https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400",
			],
			ingredients: "Ibuprofen 400mg per tablet",
			sideEffects: "Stomach upset, heartburn, dizziness, mild headache, nausea",
			warnings:
				"Take with food or milk. Avoid if you have stomach ulcers, kidney disease, or heart conditions. Do not use with alcohol.",
			storage:
				"Store at room temperature (15-25°C) in original packaging, keep dry",
			requiresPrescription: false,
			categoryId: painRelief?.id || "",
			sellerId: seller.id,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Aspirin 100mg (Low Dose)",
			genericName: "Acetylsalicylic Acid",
			manufacturer: "Aristopharma Ltd",
			price: 1.8,
			stockQuantity: 400,
			lowStockThreshold: 60,
			unit: "strip",
			dosageForm: "tablet",
			strength: "100mg",
			packSize: "10 tablets per strip",
			description:
				"Low-dose aspirin for cardiovascular protection and mild pain relief. Used for heart attack and stroke prevention.",
			imageUrl:
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			images: [
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			],
			ingredients: "Acetylsalicylic Acid (Aspirin) 100mg",
			sideEffects: "Stomach irritation, heartburn, easy bruising",
			warnings:
				"Consult doctor before use. Not for children under 16. Take with food.",
			storage: "Store in a cool, dry place below 25°C",
			requiresPrescription: true,
			categoryId: painRelief?.id || "",
			sellerId: seller.id,
			isActive: true,
		},
		{
			name: "Diclofenac Gel 1%",
			genericName: "Diclofenac Sodium",
			manufacturer: "Navana Pharmaceuticals",
			price: 8.5,
			discountPrice: 7.5,
			discountPercentage: 12,
			stockQuantity: 180,
			lowStockThreshold: 30,
			unit: "tube",
			dosageForm: "gel",
			strength: "1%",
			packSize: "50g tube",
			description:
				"Topical anti-inflammatory gel for joint and muscle pain. Provides targeted relief without oral medication.",
			imageUrl:
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			images: [
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			],
			ingredients: "Diclofenac Sodium 1% w/w",
			sideEffects: "Skin irritation, redness at application site (rare)",
			warnings:
				"For external use only. Avoid contact with eyes and mucous membranes. Do not apply on broken skin.",
			storage: "Store below 30°C, keep tube tightly closed",
			requiresPrescription: false,
			categoryId: painRelief?.id || "",
			sellerId: seller.id,
			isActive: true,
		},

		// Cold & Flu Medicines
		{
			name: "Cold & Flu Relief Tablets",
			genericName: "Paracetamol + Phenylephrine + Chlorpheniramine",
			manufacturer: "Incepta Pharmaceuticals",
			price: 5.0,
			discountPrice: 4.5,
			discountPercentage: 10,
			stockQuantity: 250,
			lowStockThreshold: 40,
			unit: "strip",
			dosageForm: "tablet",
			strength: "500mg+5mg+2mg",
			packSize: "10 tablets per strip",
			description:
				"Complete cold and flu relief formula. Reduces fever, relieves nasal congestion, and manages allergy symptoms.",
			imageUrl:
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			images: [
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			],
			ingredients: "Paracetamol 500mg, Phenylephrine 5mg, Chlorpheniramine 2mg",
			sideEffects: "Drowsiness, dry mouth, dizziness, nausea",
			warnings:
				"May cause drowsiness. Do not drive or operate machinery. Avoid alcohol. Not for children under 12.",
			storage: "Store in a cool, dry place below 25°C",
			requiresPrescription: false,
			categoryId: coldFlu?.id || "",
			sellerId: seller.id,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Cough Syrup DM",
			genericName: "Dextromethorphan HBr",
			manufacturer: "ACI Limited",
			price: 4.8,
			stockQuantity: 200,
			lowStockThreshold: 35,
			unit: "bottle",
			dosageForm: "syrup",
			strength: "15mg/5ml",
			packSize: "100ml bottle",
			description:
				"Non-drowsy cough suppressant for dry, irritating coughs. Cherry-flavored for pleasant taste.",
			imageUrl:
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			images: [
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			],
			ingredients: "Dextromethorphan Hydrobromide 15mg per 5ml",
			sideEffects: "Mild drowsiness, dizziness, stomach upset",
			warnings:
				"Do not exceed recommended dose. Not for persistent cough. Consult doctor if cough persists more than 7 days.",
			storage: "Store at room temperature, shake well before use",
			requiresPrescription: false,
			categoryId: coldFlu?.id || "",
			sellerId: seller.id,
			isActive: true,
		},
		{
			name: "Nasal Decongestant Spray",
			genericName: "Oxymetazoline HCl",
			manufacturer: "Healthcare Pharmaceuticals",
			price: 4.0,
			stockQuantity: 150,
			lowStockThreshold: 25,
			unit: "bottle",
			dosageForm: "spray",
			strength: "0.05%",
			packSize: "15ml spray bottle",
			description:
				"Fast-acting nasal spray for instant relief from nasal congestion and sinus pressure. Works in minutes.",
			imageUrl:
				"https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400",
			images: [
				"https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400",
			],
			ingredients: "Oxymetazoline Hydrochloride 0.05%",
			sideEffects:
				"Temporary burning, stinging, sneezing, increased nasal discharge",
			warnings:
				"Do not use for more than 3 consecutive days. May cause rebound congestion. Not for children under 6.",
			storage: "Store upright at room temperature, keep bottle tightly closed",
			requiresPrescription: false,
			categoryId: coldFlu?.id || "",
			sellerId: seller.id,
			isActive: true,
		},
		{
			name: "Lozenges Honey Lemon",
			genericName: "Menthol + Eucalyptus",
			manufacturer: "Renata Limited",
			price: 2.2,
			stockQuantity: 350,
			lowStockThreshold: 50,
			unit: "pack",
			dosageForm: "lozenge",
			strength: "5mg menthol",
			packSize: "12 lozenges per pack",
			description:
				"Soothing throat lozenges with honey and lemon flavor. Provides temporary relief from sore throat and cough.",
			imageUrl:
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			images: [
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			],
			ingredients: "Menthol 5mg, Eucalyptus Oil, Honey, Natural Flavors",
			sideEffects: "None significant when used as directed",
			warnings: "Not for children under 5. Do not exceed 8 lozenges per day.",
			storage: "Store in original packaging in a cool, dry place",
			requiresPrescription: false,
			categoryId: coldFlu?.id || "",
			sellerId: seller.id,
			isFeatured: true,
			isActive: true,
		},

		// Vitamins & Supplements
		{
			name: "Daily Multivitamin Complex",
			genericName: "Multivitamin & Multimineral",
			manufacturer: "Opsonin Pharma",
			price: 12.0,
			discountPrice: 10.0,
			discountPercentage: 17,
			stockQuantity: 400,
			lowStockThreshold: 60,
			unit: "bottle",
			dosageForm: "tablet",
			packSize: "60 tablets",
			description:
				"Comprehensive daily multivitamin with 25+ essential vitamins and minerals. Supports overall health, energy, and immune function.",
			imageUrl:
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			images: [
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
				"https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400",
			],
			ingredients:
				"Vitamin A, B-Complex, C, D3, E, K, Calcium, Iron, Zinc, Magnesium, Selenium, and other essential minerals",
			sideEffects: "Mild stomach upset, nausea (take with food to minimize)",
			warnings:
				"Take with food for better absorption. Consult doctor if pregnant or on medication.",
			storage: "Store in cool, dry place away from direct sunlight",
			requiresPrescription: false,
			categoryId: vitamins?.id || "",
			sellerId: seller.id,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Vitamin D3 2000 IU",
			genericName: "Cholecalciferol",
			manufacturer: "Square Pharmaceuticals",
			price: 7.5,
			discountPrice: 6.5,
			discountPercentage: 13,
			stockQuantity: 350,
			lowStockThreshold: 50,
			unit: "bottle",
			dosageForm: "softgel",
			strength: "2000 IU",
			packSize: "60 softgels",
			description:
				"High-potency Vitamin D3 for strong bones, teeth, and immune system. Essential for calcium absorption.",
			imageUrl:
				"https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400",
			images: [
				"https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400",
			],
			ingredients: "Cholecalciferol (Vitamin D3) 2000 IU, Soybean Oil",
			sideEffects: "Rare at recommended dosage",
			warnings:
				"Consult doctor if taking other vitamin D supplements or medications. Regular blood tests recommended for long-term use.",
			storage: "Store in a cool, dry place away from direct sunlight",
			requiresPrescription: false,
			categoryId: vitamins?.id || "",
			sellerId: seller.id,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Vitamin C 1000mg Time Release",
			genericName: "Ascorbic Acid",
			manufacturer: "Renata Limited",
			price: 6.0,
			stockQuantity: 450,
			lowStockThreshold: 70,
			unit: "bottle",
			dosageForm: "tablet",
			strength: "1000mg",
			packSize: "30 tablets",
			description:
				"Time-release formula for sustained Vitamin C delivery throughout the day. Powerful antioxidant and immune booster.",
			imageUrl:
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			images: [
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			],
			ingredients: "Ascorbic Acid 1000mg (time-release formulation)",
			sideEffects:
				"Stomach upset, diarrhea at high doses, kidney stones (rare)",
			warnings:
				"Do not exceed recommended dose. Consult doctor if you have kidney problems.",
			storage: "Keep bottle tightly closed in a cool, dry place",
			requiresPrescription: false,
			categoryId: vitamins?.id || "",
			sellerId: seller.id,
			isActive: true,
		},
		{
			name: "Omega-3 Fish Oil 1000mg",
			genericName: "Omega-3 Fatty Acids",
			manufacturer: "Beximco Pharmaceuticals",
			price: 15.0,
			discountPrice: 13.0,
			discountPercentage: 13,
			stockQuantity: 200,
			lowStockThreshold: 30,
			unit: "bottle",
			dosageForm: "softgel",
			strength: "1000mg",
			packSize: "90 softgels",
			description:
				"Premium quality fish oil rich in EPA and DHA. Supports heart, brain, and joint health. Molecularly distilled for purity.",
			imageUrl:
				"https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400",
			images: [
				"https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400",
			],
			ingredients: "Fish Oil 1000mg (EPA 180mg, DHA 120mg)",
			sideEffects: "Fishy aftertaste, mild stomach upset, burping",
			warnings:
				"Take with meals to reduce fishy aftertaste. Consult doctor if on blood thinners.",
			storage: "Store in refrigerator for maximum freshness",
			requiresPrescription: false,
			categoryId: vitamins?.id || "",
			sellerId: seller.id,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Calcium + Vitamin D3",
			genericName: "Calcium Carbonate + Cholecalciferol",
			manufacturer: "Aristopharma Ltd",
			price: 9.0,
			stockQuantity: 280,
			lowStockThreshold: 40,
			unit: "bottle",
			dosageForm: "tablet",
			strength: "600mg + 400 IU",
			packSize: "60 tablets",
			description:
				"Bone health formula combining calcium and vitamin D3 for optimal absorption. Supports strong bones and teeth.",
			imageUrl:
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			images: [
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			],
			ingredients: "Calcium Carbonate 600mg, Vitamin D3 400 IU",
			sideEffects: "Constipation, gas, bloating (mild)",
			warnings:
				"Take with food. Do not exceed recommended dose. Maintain adequate fluid intake.",
			storage: "Store in a cool, dry place",
			requiresPrescription: false,
			categoryId: vitamins?.id || "",
			sellerId: seller.id,
			isActive: true,
		},

		// Digestive Health
		{
			name: "Antacid Plus Suspension",
			genericName: "Aluminum Hydroxide + Magnesium Hydroxide",
			manufacturer: "Healthcare Pharmaceuticals",
			price: 3.5,
			stockQuantity: 250,
			lowStockThreshold: 40,
			unit: "bottle",
			dosageForm: "suspension",
			strength: "200ml",
			packSize: "200ml bottle",
			description:
				"Fast-acting antacid for heartburn, acid indigestion, and upset stomach. Mint-flavored for better taste.",
			imageUrl:
				"https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400",
			images: [
				"https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400",
			],
			ingredients:
				"Aluminum Hydroxide 225mg/5ml, Magnesium Hydroxide 200mg/5ml",
			sideEffects: "Constipation, diarrhea, chalky taste",
			warnings:
				"Do not use if you have kidney disease. Consult doctor if symptoms persist more than 2 weeks.",
			storage:
				"Shake well before use. Store at room temperature. Do not refrigerate.",
			requiresPrescription: false,
			categoryId: digestive?.id || "",
			sellerId: seller.id,
			isActive: true,
		},
		{
			name: "Probiotic Multi-Strain 10B CFU",
			genericName: "Lactobacillus + Bifidobacterium",
			manufacturer: "Jayson Pharmaceuticals",
			price: 14.0,
			discountPrice: 12.0,
			discountPercentage: 14,
			stockQuantity: 180,
			lowStockThreshold: 30,
			unit: "bottle",
			dosageForm: "capsule",
			packSize: "30 capsules",
			description:
				"Advanced probiotic formula with 10 billion CFU and 8 beneficial strains. Supports digestive health, immune function, and gut flora balance.",
			imageUrl:
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			images: [
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			],
			ingredients:
				"Lactobacillus acidophilus, L. rhamnosus, L. plantarum, Bifidobacterium lactis, B. longum (10 billion CFU)",
			sideEffects: "Gas, bloating (usually temporary during first few days)",
			warnings:
				"Keep refrigerated for best results. Take on empty stomach or as directed.",
			storage: "Refrigerate after opening to maintain potency",
			requiresPrescription: false,
			categoryId: digestive?.id || "",
			sellerId: seller.id,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Laxative Tablets Gentle",
			genericName: "Bisacodyl",
			manufacturer: "Opsonin Pharma",
			price: 2.8,
			stockQuantity: 300,
			lowStockThreshold: 45,
			unit: "strip",
			dosageForm: "tablet",
			strength: "5mg",
			packSize: "10 tablets per strip",
			description:
				"Gentle overnight relief from occasional constipation. Works in 6-12 hours for predictable relief.",
			imageUrl:
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			images: [
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			],
			ingredients: "Bisacodyl 5mg",
			sideEffects: "Abdominal cramping, diarrhea, nausea",
			warnings:
				"For occasional use only. Do not use for more than 7 days. Increase fiber and water intake. Not for children under 6.",
			storage: "Store at room temperature in original packaging",
			requiresPrescription: false,
			categoryId: digestive?.id || "",
			sellerId: seller.id,
			isActive: true,
		},
		{
			name: "Anti-Diarrheal Capsules",
			genericName: "Loperamide HCl",
			manufacturer: "Square Pharmaceuticals",
			price: 4.2,
			stockQuantity: 220,
			lowStockThreshold: 35,
			unit: "strip",
			dosageForm: "capsule",
			strength: "2mg",
			packSize: "6 capsules per strip",
			description:
				"Fast relief from acute diarrhea and traveler's diarrhea. Reduces frequency of bowel movements.",
			imageUrl:
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			images: [
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			],
			ingredients: "Loperamide Hydrochloride 2mg",
			sideEffects: "Dizziness, drowsiness, constipation, dry mouth",
			warnings:
				"Do not use if you have bloody diarrhea or high fever. Not for children under 6. Consult doctor if symptoms persist.",
			storage: "Store in a cool, dry place below 25°C",
			requiresPrescription: false,
			categoryId: digestive?.id || "",
			sellerId: seller.id,
			isActive: true,
		},
		{
			name: "Digestive Enzyme Complex",
			genericName: "Pancreatin + Pepsin",
			manufacturer: "Navana Pharmaceuticals",
			price: 8.5,
			stockQuantity: 160,
			lowStockThreshold: 25,
			unit: "bottle",
			dosageForm: "capsule",
			packSize: "30 capsules",
			description:
				"Comprehensive digestive enzyme formula to support protein, carbohydrate, and fat digestion. Helps reduce bloating and gas.",
			imageUrl:
				"https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400",
			images: [
				"https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400",
			],
			ingredients: "Pancreatin 200mg, Pepsin 50mg, Amylase, Lipase, Protease",
			sideEffects: "Nausea, stomach upset (rare)",
			warnings:
				"Take with meals. Consult doctor if you have pancreatitis or pancreatic insufficiency.",
			storage: "Store in a cool, dry place away from moisture",
			requiresPrescription: false,
			categoryId: digestive?.id || "",
			sellerId: seller.id,
			isActive: true,
		},
	];

	// Create medicines
	const created = await Promise.all(
		medicines
			.filter((med) => med.categoryId)
			.map((med) =>
				prisma.medicine.create({
					data: {
						...med,
						slug: helper.getSlug(med.name),
						sku: `MED-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
					},
				}),
			),
	);

	console.log(`   ✅ ${created.length} medicines created`);
}
