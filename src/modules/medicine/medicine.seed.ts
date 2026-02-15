import { prisma } from "@lib/prisma";
import { helper } from "@/helper";

// Medicine template type — no sellerId or categoryId yet
interface MedicineTemplate {
	name: string;
	genericName: string;
	manufacturer: string;
	price: number;
	discountPrice?: number;
	discountPercentage?: number;
	stockQuantity: number;
	lowStockThreshold: number;
	unit: string;
	dosageForm: string;
	strength?: string;
	packSize: string;
	description: string;
	imageUrl: string;
	images: string[];
	ingredients: string;
	sideEffects: string;
	warnings: string;
	storage: string;
	requiresPrescription: boolean;
	isFeatured: boolean;
	isActive: boolean;
}

// Medicine templates keyed by category name
const medicinesByCategory: Record<string, MedicineTemplate[]> = {
	"Pain Relief": [
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
			isFeatured: false,
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
			isFeatured: false,
			isActive: true,
		},
		{
			name: "Naproxen Sodium 220mg",
			genericName: "Naproxen Sodium",
			manufacturer: "Incepta Pharmaceuticals",
			price: 4.0,
			discountPrice: 3.5,
			discountPercentage: 12,
			stockQuantity: 260,
			lowStockThreshold: 35,
			unit: "strip",
			dosageForm: "tablet",
			strength: "220mg",
			packSize: "10 tablets per strip",
			description:
				"Long-lasting NSAID for pain relief that works up to 12 hours. Effective for back pain, toothache, and minor arthritis pain.",
			imageUrl:
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			images: [
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			],
			ingredients: "Naproxen Sodium 220mg per tablet",
			sideEffects: "Stomach pain, heartburn, nausea, headache, drowsiness",
			warnings:
				"Take with food or milk. Do not lie down for 10 minutes after taking. Avoid if allergic to aspirin or NSAIDs.",
			storage: "Store at room temperature (20-25°C) in a dry place",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	"Cold & Flu": [
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
			isFeatured: false,
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
			isFeatured: false,
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
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Expectorant Syrup 100ml",
			genericName: "Guaifenesin",
			manufacturer: "Square Pharmaceuticals",
			price: 3.8,
			stockQuantity: 220,
			lowStockThreshold: 30,
			unit: "bottle",
			dosageForm: "syrup",
			strength: "100mg/5ml",
			packSize: "100ml bottle",
			description:
				"Loosens and thins mucus in the airways to make coughs more productive. Helps clear chest congestion effectively.",
			imageUrl:
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			images: [
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			],
			ingredients: "Guaifenesin 100mg per 5ml",
			sideEffects: "Nausea, vomiting, stomach upset, headache",
			warnings:
				"Drink plenty of fluids while taking this medicine. Not for children under 2 years. Consult doctor if cough lasts more than 7 days.",
			storage: "Store below 25°C. Do not freeze. Shake well before use.",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	"Digestive Health": [
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
			isFeatured: false,
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
			isFeatured: false,
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
			isFeatured: false,
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
			isFeatured: false,
			isActive: true,
		},
	],

	"Vitamins & Supplements": [
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
			isFeatured: false,
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
			isFeatured: false,
			isActive: true,
		},
	],

	"First Aid": [
		{
			name: "Antiseptic Solution 100ml",
			genericName: "Povidone-Iodine",
			manufacturer: "Square Pharmaceuticals",
			price: 3.0,
			discountPrice: 2.5,
			discountPercentage: 17,
			stockQuantity: 400,
			lowStockThreshold: 50,
			unit: "bottle",
			dosageForm: "solution",
			strength: "10%",
			packSize: "100ml bottle",
			description:
				"Broad-spectrum antiseptic solution for wound cleansing and infection prevention. Kills bacteria, viruses, and fungi on contact.",
			imageUrl:
				"https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400",
			images: [
				"https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400",
			],
			ingredients: "Povidone-Iodine 10% w/v",
			sideEffects: "Skin irritation, staining of skin and clothing",
			warnings:
				"For external use only. Avoid contact with eyes. Do not use on deep puncture wounds or serious burns. Discontinue if irritation occurs.",
			storage: "Store below 25°C, away from light. Keep bottle tightly closed.",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Adhesive Bandages Assorted",
			genericName: "Sterile Adhesive Bandages",
			manufacturer: "Healthcare Pharmaceuticals",
			price: 2.5,
			stockQuantity: 600,
			lowStockThreshold: 80,
			unit: "box",
			dosageForm: "bandage",
			packSize: "100 assorted bandages",
			description:
				"Assorted sterile adhesive bandages in multiple sizes for minor cuts, scrapes, and blisters. Flexible fabric material with strong adhesive.",
			imageUrl:
				"https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400",
			images: [
				"https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400",
			],
			ingredients:
				"Sterile non-stick pad, flexible fabric, hypoallergenic adhesive",
			sideEffects:
				"Skin irritation or adhesive allergy in sensitive individuals",
			warnings:
				"For single use only. Replace bandage if it gets wet or dirty. Seek medical attention for deep or infected wounds.",
			storage: "Store in a dry place at room temperature",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
		{
			name: "Burn Relief Cream 25g",
			genericName: "Silver Sulfadiazine",
			manufacturer: "Aristopharma Ltd",
			price: 6.5,
			discountPrice: 5.5,
			discountPercentage: 15,
			stockQuantity: 200,
			lowStockThreshold: 30,
			unit: "tube",
			dosageForm: "cream",
			strength: "1%",
			packSize: "25g tube",
			description:
				"Antimicrobial cream for minor burns, scalds, and sunburns. Prevents infection and promotes healing of first and second-degree burns.",
			imageUrl:
				"https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400",
			images: [
				"https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400",
			],
			ingredients: "Silver Sulfadiazine 1% w/w in a water-miscible cream base",
			sideEffects:
				"Skin discoloration, itching, burning sensation at application site",
			warnings:
				"For external use only. Do not use on deep or severe burns. Consult doctor for burns larger than palm size. Not for children under 2 months.",
			storage: "Store below 25°C. Keep tube tightly closed after use.",
			requiresPrescription: true,
			isFeatured: false,
			isActive: true,
		},
		{
			name: "Hydrogen Peroxide 3%",
			genericName: "Hydrogen Peroxide",
			manufacturer: "ACI Limited",
			price: 1.5,
			stockQuantity: 500,
			lowStockThreshold: 60,
			unit: "bottle",
			dosageForm: "solution",
			strength: "3%",
			packSize: "200ml bottle",
			description:
				"First aid antiseptic for cleaning minor wounds, cuts, and abrasions. Helps prevent infection with gentle effervescent cleansing action.",
			imageUrl:
				"https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400",
			images: [
				"https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400",
			],
			ingredients: "Hydrogen Peroxide 3% w/v, Purified Water",
			sideEffects:
				"Mild stinging, skin whitening at application site (temporary)",
			warnings:
				"For external use only. Do not use in eyes or deep wounds. Do not swallow. Keep out of reach of children.",
			storage: "Store in a cool, dark place. Keep bottle tightly sealed.",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
		{
			name: "Elastic Crepe Bandage 4 inch",
			genericName: "Elastic Compression Bandage",
			manufacturer: "Jayson Pharmaceuticals",
			price: 3.2,
			stockQuantity: 350,
			lowStockThreshold: 45,
			unit: "pack",
			dosageForm: "bandage",
			strength: "4 inch width",
			packSize: "1 roll (4.5m stretched)",
			description:
				"Reusable elastic crepe bandage for sprains, strains, and joint support. Provides firm yet comfortable compression with excellent stretch.",
			imageUrl:
				"https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400",
			images: [
				"https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400",
			],
			ingredients: "Cotton, elastic yarn, polyamide blend",
			sideEffects:
				"None when used correctly. May restrict circulation if wrapped too tightly.",
			warnings:
				"Do not apply too tightly. Check circulation regularly. Loosen if numbness, tingling, or discoloration occurs. Wash before first use.",
			storage: "Store in a clean, dry place. Roll back after washing.",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
	],

	"Skin Care": [
		{
			name: "Benzoyl Peroxide Gel 5%",
			genericName: "Benzoyl Peroxide",
			manufacturer: "Square Pharmaceuticals",
			price: 5.5,
			discountPrice: 4.8,
			discountPercentage: 13,
			stockQuantity: 280,
			lowStockThreshold: 35,
			unit: "tube",
			dosageForm: "gel",
			strength: "5%",
			packSize: "30g tube",
			description:
				"Effective acne treatment gel that kills acne-causing bacteria and unclogs pores. Reduces breakouts and prevents new blemishes from forming.",
			imageUrl:
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			images: [
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			],
			ingredients: "Benzoyl Peroxide 5% w/w in aqueous gel base",
			sideEffects: "Skin dryness, peeling, redness, mild burning sensation",
			warnings:
				"For external use only. Start with once daily application. Avoid sun exposure; use sunscreen. May bleach fabrics and hair.",
			storage: "Store below 25°C away from heat and direct sunlight",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Clotrimazole Cream 1%",
			genericName: "Clotrimazole",
			manufacturer: "Beximco Pharmaceuticals",
			price: 4.0,
			stockQuantity: 320,
			lowStockThreshold: 40,
			unit: "tube",
			dosageForm: "cream",
			strength: "1%",
			packSize: "20g tube",
			description:
				"Antifungal cream for athlete's foot, jock itch, ringworm, and yeast infections. Provides effective relief from itching, burning, and cracking.",
			imageUrl:
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			images: [
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			],
			ingredients: "Clotrimazole 1% w/w",
			sideEffects: "Mild skin irritation, burning, stinging (uncommon)",
			warnings:
				"For external use only. Complete the full course of treatment even if symptoms improve. Do not use in eyes or mouth.",
			storage: "Store below 30°C. Do not freeze.",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
		{
			name: "Hydrocortisone Cream 1%",
			genericName: "Hydrocortisone",
			manufacturer: "Incepta Pharmaceuticals",
			price: 3.8,
			discountPrice: 3.2,
			discountPercentage: 16,
			stockQuantity: 300,
			lowStockThreshold: 40,
			unit: "tube",
			dosageForm: "cream",
			strength: "1%",
			packSize: "15g tube",
			description:
				"Mild corticosteroid cream for eczema, dermatitis, insect bites, and minor skin irritations. Relieves itching, redness, and swelling quickly.",
			imageUrl:
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			images: [
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			],
			ingredients: "Hydrocortisone 1% w/w in cream base",
			sideEffects: "Skin thinning, stretch marks (with prolonged use), burning",
			warnings:
				"Do not use on face for more than 5 days. Avoid use on broken or infected skin. Not for children under 10 without medical advice.",
			storage: "Store below 25°C. Keep tube tightly closed.",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Calamine Lotion 100ml",
			genericName: "Calamine + Zinc Oxide",
			manufacturer: "Opsonin Pharma",
			price: 2.5,
			stockQuantity: 380,
			lowStockThreshold: 50,
			unit: "bottle",
			dosageForm: "lotion",
			strength: "8% calamine",
			packSize: "100ml bottle",
			description:
				"Soothing lotion for itchy skin, sunburn, insect bites, and mild skin irritations. Provides a cooling effect and helps dry oozing or weeping skin.",
			imageUrl:
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			images: [
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			],
			ingredients: "Calamine 8%, Zinc Oxide 8%, Glycerin, Purified Water",
			sideEffects: "Mild skin dryness (rare)",
			warnings:
				"For external use only. Shake well before use. Do not apply to open wounds or broken skin. Discontinue if rash develops.",
			storage: "Store at room temperature. Shake before each use.",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
		{
			name: "Antifungal Powder 75g",
			genericName: "Miconazole Nitrate",
			manufacturer: "Renata Limited",
			price: 3.5,
			stockQuantity: 250,
			lowStockThreshold: 35,
			unit: "bottle",
			dosageForm: "powder",
			strength: "2%",
			packSize: "75g bottle",
			description:
				"Medicated antifungal powder for prevention and treatment of fungal skin infections. Keeps skin dry and prevents moisture buildup in skin folds.",
			imageUrl:
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			images: [
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			],
			ingredients: "Miconazole Nitrate 2% w/w, Talc, Zinc Stearate",
			sideEffects: "Mild skin irritation (rare)",
			warnings:
				"For external use only. Avoid inhalation. Do not use near eyes or mucous membranes. Keep away from open flames.",
			storage: "Store in a cool, dry place away from heat sources",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	"Eye & Ear Care": [
		{
			name: "Lubricant Eye Drops 10ml",
			genericName: "Carboxymethylcellulose Sodium",
			manufacturer: "Incepta Pharmaceuticals",
			price: 5.0,
			discountPrice: 4.2,
			discountPercentage: 16,
			stockQuantity: 300,
			lowStockThreshold: 40,
			unit: "bottle",
			dosageForm: "drops",
			strength: "0.5%",
			packSize: "10ml bottle",
			description:
				"Soothing lubricant eye drops for dry, irritated, and tired eyes. Provides long-lasting moisture and comfort for contact lens wearers and screen users.",
			imageUrl:
				"https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400",
			images: [
				"https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400",
			],
			ingredients:
				"Carboxymethylcellulose Sodium 0.5%, Glycerin, Purified Water",
			sideEffects: "Temporary blurred vision, mild stinging (rare)",
			warnings:
				"Do not touch dropper tip to any surface. Remove contact lenses before use. Discard 30 days after opening. Do not use if solution changes color.",
			storage: "Store below 25°C. Do not freeze. Keep bottle tightly closed.",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Antibiotic Eye Drops",
			genericName: "Chloramphenicol",
			manufacturer: "Square Pharmaceuticals",
			price: 3.5,
			stockQuantity: 250,
			lowStockThreshold: 35,
			unit: "bottle",
			dosageForm: "drops",
			strength: "0.5%",
			packSize: "10ml bottle",
			description:
				"Broad-spectrum antibiotic eye drops for bacterial conjunctivitis (pink eye) and minor eye infections. Fast-acting formula provides relief within 24-48 hours.",
			imageUrl:
				"https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400",
			images: [
				"https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400",
			],
			ingredients: "Chloramphenicol 0.5% w/v, Boric Acid, Purified Water",
			sideEffects: "Temporary stinging, eye redness, blurred vision",
			warnings:
				"Complete the full 5-day course. Do not share with others. Do not wear contact lenses during treatment. Seek medical advice if no improvement after 48 hours.",
			storage: "Store at 2-8°C (refrigerator). Discard 28 days after opening.",
			requiresPrescription: true,
			isFeatured: false,
			isActive: true,
		},
		{
			name: "Ear Wax Removal Drops",
			genericName: "Carbamide Peroxide",
			manufacturer: "Healthcare Pharmaceuticals",
			price: 4.5,
			discountPrice: 3.8,
			discountPercentage: 16,
			stockQuantity: 200,
			lowStockThreshold: 30,
			unit: "bottle",
			dosageForm: "drops",
			strength: "6.5%",
			packSize: "15ml bottle",
			description:
				"Gentle ear drops for safe removal of excess ear wax. Effervescent formula softens and loosens hardened wax for easy removal.",
			imageUrl:
				"https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400",
			images: [
				"https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400",
			],
			ingredients: "Carbamide Peroxide 6.5% in anhydrous glycerin",
			sideEffects: "Temporary fizzing sensation, mild ear fullness",
			warnings:
				"Do not use if you have ear pain, drainage, dizziness, or a perforated eardrum. Do not use for more than 4 consecutive days. Not for children under 12.",
			storage: "Store at room temperature. Keep bottle tightly closed.",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
		{
			name: "Allergy Eye Drops",
			genericName: "Ketotifen Fumarate",
			manufacturer: "Opsonin Pharma",
			price: 6.0,
			stockQuantity: 180,
			lowStockThreshold: 25,
			unit: "bottle",
			dosageForm: "drops",
			strength: "0.025%",
			packSize: "5ml bottle",
			description:
				"Antihistamine eye drops for itchy, watery eyes caused by allergies. Provides up to 12 hours of relief from eye allergy symptoms.",
			imageUrl:
				"https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400",
			images: [
				"https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400",
			],
			ingredients:
				"Ketotifen Fumarate 0.025% (equivalent to Ketotifen 0.035mg/ml)",
			sideEffects: "Eye burning/stinging, headache, runny nose",
			warnings:
				"Wait 10 minutes before inserting contact lenses. Do not use to treat eye redness from irritation. Discard 28 days after opening.",
			storage: "Store at 4-25°C. Protect from light.",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Antibiotic Ear Drops",
			genericName: "Ciprofloxacin",
			manufacturer: "Beximco Pharmaceuticals",
			price: 5.5,
			stockQuantity: 160,
			lowStockThreshold: 25,
			unit: "bottle",
			dosageForm: "drops",
			strength: "0.3%",
			packSize: "10ml bottle",
			description:
				"Fluoroquinolone antibiotic ear drops for acute otitis externa (swimmer's ear) and middle ear infections. Effective against common ear infection bacteria.",
			imageUrl:
				"https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400",
			images: [
				"https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400",
			],
			ingredients: "Ciprofloxacin Hydrochloride 0.3% w/v",
			sideEffects: "Ear discomfort, itching, mild pain, dizziness (rare)",
			warnings:
				"Complete full course of treatment (7 days). Warm drops to body temperature before use. Do not use if eardrum is perforated unless directed by doctor.",
			storage: "Store below 25°C. Protect from light. Do not freeze.",
			requiresPrescription: true,
			isFeatured: false,
			isActive: true,
		},
	],

	"Allergy Relief": [
		{
			name: "Cetirizine 10mg Tablets",
			genericName: "Cetirizine Hydrochloride",
			manufacturer: "Square Pharmaceuticals",
			price: 3.0,
			discountPrice: 2.5,
			discountPercentage: 17,
			stockQuantity: 400,
			lowStockThreshold: 50,
			unit: "strip",
			dosageForm: "tablet",
			strength: "10mg",
			packSize: "10 tablets per strip",
			description:
				"Non-drowsy antihistamine for 24-hour relief from hay fever, allergic rhinitis, hives, and itchy skin. Fast-acting formula works within 1 hour.",
			imageUrl:
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			images: [
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			],
			ingredients: "Cetirizine Hydrochloride 10mg per tablet",
			sideEffects: "Mild drowsiness, dry mouth, headache, fatigue",
			warnings:
				"May cause drowsiness in some people. Avoid alcohol. Do not exceed one tablet per day. Not for children under 6.",
			storage: "Store below 30°C in a dry place",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Loratadine 10mg Tablets",
			genericName: "Loratadine",
			manufacturer: "Incepta Pharmaceuticals",
			price: 3.5,
			stockQuantity: 350,
			lowStockThreshold: 45,
			unit: "strip",
			dosageForm: "tablet",
			strength: "10mg",
			packSize: "10 tablets per strip",
			description:
				"Non-drowsy antihistamine for seasonal and perennial allergic rhinitis. Relieves sneezing, runny nose, itchy and watery eyes for a full 24 hours.",
			imageUrl:
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			images: [
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			],
			ingredients: "Loratadine 10mg per tablet",
			sideEffects: "Headache, fatigue, dry mouth, nervousness",
			warnings:
				"Take once daily on an empty stomach. Consult doctor if pregnant or breastfeeding. Not for children under 2.",
			storage: "Store at room temperature (15-30°C), away from moisture",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
		{
			name: "Fexofenadine 180mg Tablets",
			genericName: "Fexofenadine Hydrochloride",
			manufacturer: "Aristopharma Ltd",
			price: 5.0,
			discountPrice: 4.5,
			discountPercentage: 10,
			stockQuantity: 250,
			lowStockThreshold: 35,
			unit: "strip",
			dosageForm: "tablet",
			strength: "180mg",
			packSize: "10 tablets per strip",
			description:
				"Truly non-drowsy antihistamine for severe allergy symptoms. Provides 24-hour relief from chronic urticaria and seasonal allergies without affecting alertness.",
			imageUrl:
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			images: [
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			],
			ingredients: "Fexofenadine Hydrochloride 180mg per tablet",
			sideEffects: "Headache, nausea, dizziness, back pain (uncommon)",
			warnings:
				"Do not take with fruit juices (grapefruit, orange, apple) as they reduce absorption. Take with water only. Not for children under 12.",
			storage: "Store below 25°C in a dry place protected from light",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Fluticasone Nasal Spray",
			genericName: "Fluticasone Propionate",
			manufacturer: "Renata Limited",
			price: 8.0,
			discountPrice: 7.0,
			discountPercentage: 12,
			stockQuantity: 180,
			lowStockThreshold: 25,
			unit: "bottle",
			dosageForm: "spray",
			strength: "50mcg/spray",
			packSize: "120 sprays per bottle",
			description:
				"Corticosteroid nasal spray for allergic rhinitis. Reduces nasal congestion, sneezing, runny nose, and itchy nose. Full effect in 3-4 days of regular use.",
			imageUrl:
				"https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400",
			images: [
				"https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400",
			],
			ingredients: "Fluticasone Propionate 50mcg per actuation",
			sideEffects: "Nosebleeds, nasal dryness, headache, sore throat",
			warnings:
				"Prime before first use. Do not share with others. Consult doctor if symptoms do not improve after 7 days. Not for children under 4.",
			storage: "Store upright below 30°C. Do not freeze or refrigerate.",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
		{
			name: "Calamine Anti-Itch Cream 50g",
			genericName: "Calamine + Diphenhydramine",
			manufacturer: "Navana Pharmaceuticals",
			price: 3.5,
			stockQuantity: 290,
			lowStockThreshold: 40,
			unit: "tube",
			dosageForm: "cream",
			strength: "8% + 1%",
			packSize: "50g tube",
			description:
				"Fast-acting anti-itch cream combining calamine and antihistamine. Ideal for insect bites, poison ivy, eczema, and allergic skin reactions.",
			imageUrl:
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			images: [
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			],
			ingredients: "Calamine 8%, Diphenhydramine Hydrochloride 1%, Zinc Oxide",
			sideEffects: "Mild skin dryness, drowsiness if applied to large areas",
			warnings:
				"For external use only. Do not apply to blistered, raw, or oozing skin. Do not use on children under 2. Avoid large body areas.",
			storage: "Store below 30°C. Keep tube tightly closed.",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	// Child Categories - Pain Relief
	"Headache Relief": [
		{
			name: "Migraine Relief Extra Strength",
			genericName: "Acetaminophen + Aspirin + Caffeine",
			manufacturer: "Square Pharmaceuticals",
			price: 6.5,
			discountPrice: 5.5,
			discountPercentage: 15,
			stockQuantity: 200,
			lowStockThreshold: 30,
			unit: "strip",
			dosageForm: "tablet",
			strength: "250mg+250mg+65mg",
			packSize: "10 tablets per strip",
			description:
				"Triple-action formula specifically designed for migraine and tension headaches. Fast-acting relief within 20 minutes.",
			imageUrl:
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			images: [
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			],
			ingredients: "Acetaminophen 250mg, Aspirin 250mg, Caffeine 65mg",
			sideEffects: "Nervousness, stomach upset, difficulty sleeping",
			warnings:
				"Contains caffeine. Do not take more than 2 tablets in 24 hours. Not for children under 12.",
			storage: "Store below 30°C in a dry place",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Tension Headache Relief Gel Caps",
			genericName: "Ibuprofen Liquid Filled",
			manufacturer: "Beximco Pharmaceuticals",
			price: 4.5,
			stockQuantity: 280,
			lowStockThreshold: 35,
			unit: "strip",
			dosageForm: "capsule",
			strength: "200mg",
			packSize: "10 capsules per strip",
			description:
				"Liquid-filled ibuprofen capsules for faster absorption and quick tension headache relief.",
			imageUrl:
				"https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400",
			images: [
				"https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400",
			],
			ingredients: "Ibuprofen 200mg (liquid filled)",
			sideEffects: "Stomach upset, nausea, dizziness",
			warnings:
				"Take with food. Avoid if you have stomach ulcers or kidney problems.",
			storage: "Store at room temperature away from moisture",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	"Muscle Pain": [
		{
			name: "Deep Heat Muscle Rub 50g",
			genericName: "Methyl Salicylate + Menthol",
			manufacturer: "ACI Limited",
			price: 5.0,
			discountPrice: 4.2,
			discountPercentage: 16,
			stockQuantity: 320,
			lowStockThreshold: 40,
			unit: "tube",
			dosageForm: "ointment",
			strength: "15% + 10%",
			packSize: "50g tube",
			description:
				"Deep penetrating heat therapy for sore muscles, back pain, and sports injuries. Provides warming relief for up to 8 hours.",
			imageUrl:
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			images: [
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			],
			ingredients: "Methyl Salicylate 15%, Menthol 10%",
			sideEffects: "Skin irritation, redness at application site",
			warnings:
				"For external use only. Do not apply to broken skin. Wash hands after application.",
			storage: "Store below 30°C away from heat sources",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Muscle Relaxant Tablets",
			genericName: "Cyclobenzaprine",
			manufacturer: "Incepta Pharmaceuticals",
			price: 8.0,
			stockQuantity: 150,
			lowStockThreshold: 25,
			unit: "strip",
			dosageForm: "tablet",
			strength: "10mg",
			packSize: "10 tablets per strip",
			description:
				"Prescription muscle relaxant for acute muscle spasms and pain associated with musculoskeletal conditions.",
			imageUrl:
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			images: [
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			],
			ingredients: "Cyclobenzaprine Hydrochloride 10mg",
			sideEffects: "Drowsiness, dry mouth, dizziness, fatigue",
			warnings:
				"May cause drowsiness. Do not drive or operate machinery. Avoid alcohol.",
			storage: "Store below 25°C in original packaging",
			requiresPrescription: true,
			isFeatured: false,
			isActive: true,
		},
	],

	"Arthritis Care": [
		{
			name: "Glucosamine Joint Support 1500mg",
			genericName: "Glucosamine Sulfate",
			manufacturer: "Healthcare Pharmaceuticals",
			price: 12.0,
			discountPrice: 10.0,
			discountPercentage: 17,
			stockQuantity: 180,
			lowStockThreshold: 25,
			unit: "bottle",
			dosageForm: "tablet",
			strength: "1500mg",
			packSize: "60 tablets per bottle",
			description:
				"Joint health supplement to support cartilage repair and reduce joint stiffness. Ideal for osteoarthritis management.",
			imageUrl:
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			images: [
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			],
			ingredients: "Glucosamine Sulfate 1500mg",
			sideEffects: "Mild stomach upset, nausea, headache",
			warnings:
				"Not suitable for shellfish allergy sufferers. Consult doctor if diabetic.",
			storage: "Store in a cool, dry place below 25°C",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Arthritis Pain Relief Cream 75g",
			genericName: "Diclofenac Diethylamine",
			manufacturer: "Opsonin Pharma",
			price: 7.5,
			stockQuantity: 220,
			lowStockThreshold: 30,
			unit: "tube",
			dosageForm: "gel",
			strength: "1.16%",
			packSize: "75g tube",
			description:
				"Topical NSAID gel for targeted relief of arthritis pain and joint inflammation without systemic side effects.",
			imageUrl:
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			images: [
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			],
			ingredients: "Diclofenac Diethylamine 1.16% w/w",
			sideEffects: "Local skin reactions, itching, redness",
			warnings:
				"For external use only. Avoid sun exposure on treated area. Not for use on broken skin.",
			storage: "Store below 30°C. Keep tube tightly closed.",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	// Child Categories - Cold & Flu
	"Cough Syrups": [
		{
			name: "Dry Cough Suppressant Syrup 100ml",
			genericName: "Dextromethorphan HBr",
			manufacturer: "Acme Laboratories",
			price: 4.5,
			discountPrice: 3.8,
			discountPercentage: 16,
			stockQuantity: 350,
			lowStockThreshold: 50,
			unit: "bottle",
			dosageForm: "syrup",
			strength: "15mg/5ml",
			packSize: "100ml bottle",
			description:
				"Non-drowsy cough suppressant for persistent dry cough. Provides up to 8 hours of relief.",
			imageUrl:
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			images: [
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			],
			ingredients: "Dextromethorphan Hydrobromide 15mg per 5ml",
			sideEffects: "Drowsiness, dizziness, nausea",
			warnings: "Do not use for chronic cough. Not for children under 6 years.",
			storage: "Store below 25°C. Shake well before use.",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Productive Cough Syrup 150ml",
			genericName: "Ambroxol + Guaifenesin",
			manufacturer: "Square Pharmaceuticals",
			price: 5.5,
			stockQuantity: 280,
			lowStockThreshold: 40,
			unit: "bottle",
			dosageForm: "syrup",
			strength: "30mg+100mg/5ml",
			packSize: "150ml bottle",
			description:
				"Dual-action formula to loosen mucus and promote productive cough for faster chest congestion relief.",
			imageUrl:
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			images: [
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			],
			ingredients: "Ambroxol HCl 30mg, Guaifenesin 100mg per 5ml",
			sideEffects: "Nausea, stomach upset, allergic reactions (rare)",
			warnings: "Drink plenty of fluids. Not for dry cough.",
			storage: "Store below 30°C away from direct sunlight",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	Decongestants: [
		{
			name: "Sinus Relief Nasal Spray 15ml",
			genericName: "Xylometazoline HCl",
			manufacturer: "Renata Limited",
			price: 3.5,
			discountPrice: 3.0,
			discountPercentage: 14,
			stockQuantity: 400,
			lowStockThreshold: 50,
			unit: "bottle",
			dosageForm: "spray",
			strength: "0.1%",
			packSize: "15ml bottle",
			description:
				"Fast-acting nasal decongestant for blocked nose due to cold, sinusitis, or allergies. Relief within 5 minutes.",
			imageUrl:
				"https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400",
			images: [
				"https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400",
			],
			ingredients: "Xylometazoline Hydrochloride 0.1%",
			sideEffects: "Burning sensation, sneezing, dryness",
			warnings:
				"Do not use for more than 7 consecutive days. Not for children under 12.",
			storage: "Store below 25°C. Do not freeze.",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Oral Decongestant Tablets",
			genericName: "Pseudoephedrine HCl",
			manufacturer: "Beximco Pharmaceuticals",
			price: 4.0,
			stockQuantity: 300,
			lowStockThreshold: 40,
			unit: "strip",
			dosageForm: "tablet",
			strength: "60mg",
			packSize: "10 tablets per strip",
			description:
				"Oral decongestant for nasal and sinus congestion. Provides 4-6 hours of relief.",
			imageUrl:
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			images: [
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			],
			ingredients: "Pseudoephedrine Hydrochloride 60mg",
			sideEffects: "Insomnia, nervousness, increased heart rate",
			warnings:
				"Not for those with high blood pressure or heart conditions. Avoid taking before bedtime.",
			storage: "Store below 30°C in a dry place",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	"Throat Lozenges": [
		{
			name: "Sore Throat Lozenges Extra Strong",
			genericName: "Benzocaine + Menthol",
			manufacturer: "ACI Limited",
			price: 2.5,
			discountPrice: 2.0,
			discountPercentage: 20,
			stockQuantity: 500,
			lowStockThreshold: 60,
			unit: "pack",
			dosageForm: "lozenge",
			strength: "10mg+5mg",
			packSize: "20 lozenges per pack",
			description:
				"Extra strength throat lozenges with numbing action for severe sore throat pain and irritation.",
			imageUrl:
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			images: [
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			],
			ingredients: "Benzocaine 10mg, Menthol 5mg",
			sideEffects: "Numbness in mouth, mild allergic reactions",
			warnings: "Do not exceed 8 lozenges per day. Not for children under 6.",
			storage: "Store in a cool, dry place below 25°C",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Herbal Throat Soothers",
			genericName: "Honey + Ginger + Tulsi Extract",
			manufacturer: "Hamdard Laboratories",
			price: 3.0,
			stockQuantity: 380,
			lowStockThreshold: 45,
			unit: "pack",
			dosageForm: "lozenge",
			strength: "Natural",
			packSize: "24 lozenges per pack",
			description:
				"Natural herbal lozenges with honey, ginger, and tulsi for soothing throat comfort and immunity support.",
			imageUrl:
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			images: [
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			],
			ingredients: "Honey, Ginger Extract, Tulsi Extract, Menthol",
			sideEffects: "None known",
			warnings: "Not suitable for diabetics due to honey content.",
			storage: "Store in a cool, dry place",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	// Child Categories - Digestive Health
	Antacids: [
		{
			name: "Fast Relief Antacid Chewables",
			genericName: "Calcium Carbonate + Magnesium Hydroxide",
			manufacturer: "Square Pharmaceuticals",
			price: 3.0,
			discountPrice: 2.5,
			discountPercentage: 17,
			stockQuantity: 420,
			lowStockThreshold: 50,
			unit: "bottle",
			dosageForm: "chewable",
			strength: "500mg+200mg",
			packSize: "50 tablets per bottle",
			description:
				"Fast-acting chewable antacid for immediate relief from heartburn, acid indigestion, and sour stomach.",
			imageUrl:
				"https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400",
			images: [
				"https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400",
			],
			ingredients: "Calcium Carbonate 500mg, Magnesium Hydroxide 200mg",
			sideEffects: "Constipation, gas, belching",
			warnings:
				"Do not take more than 10 tablets in 24 hours. Not for prolonged use.",
			storage: "Store below 30°C in original container",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Acid Reducer 20mg",
			genericName: "Omeprazole",
			manufacturer: "Incepta Pharmaceuticals",
			price: 6.0,
			stockQuantity: 250,
			lowStockThreshold: 35,
			unit: "strip",
			dosageForm: "capsule",
			strength: "20mg",
			packSize: "14 capsules per strip",
			description:
				"Proton pump inhibitor for frequent heartburn. Take once daily for 14-day treatment course.",
			imageUrl:
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			images: [
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			],
			ingredients: "Omeprazole 20mg",
			sideEffects: "Headache, stomach pain, nausea, diarrhea",
			warnings:
				"Do not use for more than 14 days without doctor consultation. Swallow whole, do not crush.",
			storage: "Store in original packaging below 25°C",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	Probiotics: [
		{
			name: "Daily Probiotic 20 Billion CFU",
			genericName: "Lactobacillus + Bifidobacterium Blend",
			manufacturer: "Healthcare Pharmaceuticals",
			price: 15.0,
			discountPrice: 12.5,
			discountPercentage: 17,
			stockQuantity: 150,
			lowStockThreshold: 20,
			unit: "bottle",
			dosageForm: "capsule",
			strength: "20 Billion CFU",
			packSize: "30 capsules per bottle",
			description:
				"High-potency daily probiotic with 10 strains for optimal digestive health and immune support.",
			imageUrl:
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			images: [
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			],
			ingredients:
				"Lactobacillus acidophilus, L. rhamnosus, Bifidobacterium lactis, and 7 other strains",
			sideEffects: "Mild bloating initially, gas",
			warnings:
				"Store refrigerated for best potency. Consult doctor if immunocompromised.",
			storage: "Refrigerate after opening. Store below 8°C.",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Probiotic Sachets for Kids",
			genericName: "Saccharomyces boulardii",
			manufacturer: "Acme Laboratories",
			price: 8.0,
			stockQuantity: 200,
			lowStockThreshold: 30,
			unit: "box",
			dosageForm: "powder",
			strength: "5 Billion CFU",
			packSize: "10 sachets per box",
			description:
				"Child-friendly probiotic powder that can be mixed with food or drinks. Supports healthy gut flora.",
			imageUrl:
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			images: [
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			],
			ingredients: "Saccharomyces boulardii 5 Billion CFU per sachet",
			sideEffects: "Mild stomach discomfort initially",
			warnings:
				"Safe for children over 1 year. Mix with room temperature liquids only.",
			storage: "Store in a cool, dry place below 25°C",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	"Anti-Diarrheal": [
		{
			name: "Rapid Diarrhea Relief Tablets",
			genericName: "Loperamide HCl",
			manufacturer: "Beximco Pharmaceuticals",
			price: 3.5,
			discountPrice: 3.0,
			discountPercentage: 14,
			stockQuantity: 350,
			lowStockThreshold: 45,
			unit: "strip",
			dosageForm: "tablet",
			strength: "2mg",
			packSize: "10 tablets per strip",
			description:
				"Fast-acting anti-diarrheal medication that slows intestinal movement for quick relief from acute diarrhea.",
			imageUrl:
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			images: [
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			],
			ingredients: "Loperamide Hydrochloride 2mg",
			sideEffects: "Constipation, dizziness, drowsiness",
			warnings:
				"Do not use for more than 2 days. Not for bloody diarrhea or fever. Not for children under 12.",
			storage: "Store below 30°C in a dry place",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "ORS Rehydration Sachets",
			genericName: "Oral Rehydration Salts",
			manufacturer: "SMC Enterprise",
			price: 1.5,
			stockQuantity: 600,
			lowStockThreshold: 80,
			unit: "box",
			dosageForm: "powder",
			strength: "WHO Formula",
			packSize: "20 sachets per box",
			description:
				"Essential oral rehydration solution to replace fluids and electrolytes lost during diarrhea or vomiting.",
			imageUrl:
				"https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400",
			images: [
				"https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400",
			],
			ingredients:
				"Sodium Chloride, Potassium Chloride, Sodium Citrate, Glucose",
			sideEffects: "None when used as directed",
			warnings:
				"Dissolve in specified amount of clean water. Use within 24 hours of preparation.",
			storage: "Store in a cool, dry place",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	// Child Categories - Vitamins & Supplements
	Multivitamins: [
		{
			name: "Complete Daily Multivitamin Adults",
			genericName: "Multivitamin Complex",
			manufacturer: "Healthcare Pharmaceuticals",
			price: 10.0,
			discountPrice: 8.5,
			discountPercentage: 15,
			stockQuantity: 200,
			lowStockThreshold: 25,
			unit: "bottle",
			dosageForm: "tablet",
			strength: "23 Vitamins & Minerals",
			packSize: "60 tablets per bottle",
			description:
				"Comprehensive daily multivitamin with essential vitamins and minerals for overall health and vitality.",
			imageUrl:
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			images: [
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			],
			ingredients:
				"Vitamins A, C, D, E, K, B-complex, Iron, Zinc, Calcium, Magnesium and more",
			sideEffects: "Nausea if taken on empty stomach, constipation",
			warnings:
				"Take with food. Keep out of reach of children due to iron content.",
			storage: "Store in a cool, dry place below 25°C",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Women's Multivitamin 50+",
			genericName: "Women's Multivitamin Formula",
			manufacturer: "Renata Limited",
			price: 14.0,
			stockQuantity: 150,
			lowStockThreshold: 20,
			unit: "bottle",
			dosageForm: "tablet",
			strength: "Specialized Formula",
			packSize: "90 tablets per bottle",
			description:
				"Specially formulated multivitamin for women over 50 with extra calcium, vitamin D, and B12.",
			imageUrl:
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			images: [
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			],
			ingredients:
				"Calcium 500mg, Vitamin D3 1000IU, B12 100mcg, Iron-free formula",
			sideEffects: "Mild stomach upset, nausea",
			warnings: "Consult doctor if on blood thinners or other medications.",
			storage: "Store below 30°C away from moisture",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	"Vitamin D": [
		{
			name: "Vitamin D3 5000 IU High Potency",
			genericName: "Cholecalciferol",
			manufacturer: "Square Pharmaceuticals",
			price: 8.0,
			discountPrice: 6.8,
			discountPercentage: 15,
			stockQuantity: 220,
			lowStockThreshold: 30,
			unit: "bottle",
			dosageForm: "softgel",
			strength: "5000 IU",
			packSize: "120 softgels per bottle",
			description:
				"High-potency vitamin D3 for bone health, immune support, and mood regulation. Easy-to-absorb softgel form.",
			imageUrl:
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			images: [
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			],
			ingredients: "Vitamin D3 (Cholecalciferol) 5000 IU",
			sideEffects: "Hypercalcemia at very high doses",
			warnings:
				"Do not exceed recommended dose. Have vitamin D levels checked periodically.",
			storage: "Store in a cool, dry place away from light",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Vitamin D3 Drops for Infants",
			genericName: "Cholecalciferol Oral Drops",
			manufacturer: "Acme Laboratories",
			price: 5.5,
			stockQuantity: 180,
			lowStockThreshold: 25,
			unit: "bottle",
			dosageForm: "drops",
			strength: "400 IU/drop",
			packSize: "30ml bottle (600 drops)",
			description:
				"Vitamin D drops specially formulated for infants and toddlers. Essential for healthy bone development.",
			imageUrl:
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			images: [
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			],
			ingredients: "Vitamin D3 400 IU per drop",
			sideEffects: "None at recommended doses",
			warnings:
				"Use only as directed. One drop daily for infants. Consult pediatrician.",
			storage: "Store below 25°C. Keep dropper clean.",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	"Vitamin C": [
		{
			name: "Vitamin C 1000mg Effervescent",
			genericName: "Ascorbic Acid Effervescent",
			manufacturer: "Incepta Pharmaceuticals",
			price: 6.0,
			discountPrice: 5.0,
			discountPercentage: 17,
			stockQuantity: 300,
			lowStockThreshold: 40,
			unit: "tube",
			dosageForm: "effervescent",
			strength: "1000mg",
			packSize: "20 tablets per tube",
			description:
				"Refreshing effervescent vitamin C tablets with orange flavor. Quick absorption for immune support.",
			imageUrl:
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			images: [
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			],
			ingredients: "Ascorbic Acid 1000mg, Orange flavor",
			sideEffects: "Stomach upset at high doses, diarrhea",
			warnings:
				"Do not exceed 2000mg daily. May increase kidney stone risk in susceptible individuals.",
			storage: "Store below 25°C. Keep tube tightly closed.",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Vitamin C Chewables 500mg",
			genericName: "Ascorbic Acid Chewable",
			manufacturer: "ACI Limited",
			price: 4.0,
			stockQuantity: 350,
			lowStockThreshold: 45,
			unit: "bottle",
			dosageForm: "chewable",
			strength: "500mg",
			packSize: "60 tablets per bottle",
			description:
				"Delicious cherry-flavored chewable vitamin C tablets suitable for adults and children over 4.",
			imageUrl:
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			images: [
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			],
			ingredients: "Ascorbic Acid 500mg, Cherry flavor, Sucrose",
			sideEffects: "Mild stomach discomfort if taken on empty stomach",
			warnings:
				"Contains sugar. Not suitable for diabetics. Chew thoroughly before swallowing.",
			storage: "Store in a cool, dry place below 30°C",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	"Calcium & Minerals": [
		{
			name: "Calcium + Vitamin D3 600mg/400IU",
			genericName: "Calcium Carbonate + Cholecalciferol",
			manufacturer: "Square Pharmaceuticals",
			price: 7.0,
			discountPrice: 6.0,
			discountPercentage: 14,
			stockQuantity: 250,
			lowStockThreshold: 35,
			unit: "bottle",
			dosageForm: "tablet",
			strength: "600mg + 400IU",
			packSize: "60 tablets per bottle",
			description:
				"Calcium supplement with vitamin D3 for optimal absorption. Essential for bone health and osteoporosis prevention.",
			imageUrl:
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			images: [
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			],
			ingredients: "Calcium Carbonate 600mg (elemental), Vitamin D3 400IU",
			sideEffects: "Constipation, gas, bloating",
			warnings:
				"Take with food for best absorption. Do not exceed 2500mg calcium daily.",
			storage: "Store below 30°C in a dry place",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Magnesium Citrate 400mg",
			genericName: "Magnesium Citrate",
			manufacturer: "Beximco Pharmaceuticals",
			price: 9.0,
			stockQuantity: 180,
			lowStockThreshold: 25,
			unit: "bottle",
			dosageForm: "capsule",
			strength: "400mg",
			packSize: "90 capsules per bottle",
			description:
				"Highly absorbable magnesium citrate for muscle relaxation, nerve function, and energy production.",
			imageUrl:
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			images: [
				"https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			],
			ingredients: "Magnesium Citrate 400mg (elemental magnesium)",
			sideEffects: "Loose stools at high doses, stomach upset",
			warnings:
				"May interact with certain antibiotics and medications. Take 2 hours apart.",
			storage: "Store in a cool, dry place away from moisture",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	// Child Categories - Skin Care
	"Acne Treatment": [
		{
			name: "Benzoyl Peroxide Gel 5%",
			genericName: "Benzoyl Peroxide",
			manufacturer: "Opsonin Pharma",
			price: 5.5,
			discountPrice: 4.5,
			discountPercentage: 18,
			stockQuantity: 280,
			lowStockThreshold: 35,
			unit: "tube",
			dosageForm: "gel",
			strength: "5%",
			packSize: "30g tube",
			description:
				"Effective acne treatment gel that kills acne-causing bacteria and unclogs pores. Suitable for mild to moderate acne.",
			imageUrl:
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			images: [
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			],
			ingredients: "Benzoyl Peroxide 5% w/w",
			sideEffects: "Dryness, peeling, redness, burning sensation initially",
			warnings:
				"May bleach fabrics. Start with once daily use. Use sunscreen during day.",
			storage: "Store below 25°C away from heat and light",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Salicylic Acid Face Wash 2%",
			genericName: "Salicylic Acid Cleanser",
			manufacturer: "Renata Limited",
			price: 6.0,
			stockQuantity: 240,
			lowStockThreshold: 30,
			unit: "bottle",
			dosageForm: "liquid",
			strength: "2%",
			packSize: "150ml bottle",
			description:
				"Daily acne-fighting face wash with salicylic acid to deep clean pores and prevent breakouts.",
			imageUrl:
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			images: [
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			],
			ingredients: "Salicylic Acid 2%, Gentle surfactants",
			sideEffects: "Mild dryness, tingling sensation",
			warnings:
				"Avoid contact with eyes. Use moisturizer after. Not for sensitive skin.",
			storage: "Store at room temperature",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	"Anti-Fungal": [
		{
			name: "Clotrimazole Cream 1%",
			genericName: "Clotrimazole",
			manufacturer: "ACI Limited",
			price: 3.5,
			discountPrice: 3.0,
			discountPercentage: 14,
			stockQuantity: 350,
			lowStockThreshold: 45,
			unit: "tube",
			dosageForm: "cream",
			strength: "1%",
			packSize: "20g tube",
			description:
				"Broad-spectrum antifungal cream for athlete's foot, ringworm, jock itch, and yeast infections.",
			imageUrl:
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			images: [
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			],
			ingredients: "Clotrimazole 1% w/w",
			sideEffects: "Mild burning, stinging, redness at application site",
			warnings:
				"Complete full treatment course even if symptoms improve. For external use only.",
			storage: "Store below 30°C. Do not freeze.",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Miconazole Powder 2%",
			genericName: "Miconazole Nitrate",
			manufacturer: "Incepta Pharmaceuticals",
			price: 4.0,
			stockQuantity: 280,
			lowStockThreshold: 35,
			unit: "bottle",
			dosageForm: "powder",
			strength: "2%",
			packSize: "50g bottle",
			description:
				"Antifungal powder ideal for moist areas prone to fungal infections. Absorbs moisture and treats infection.",
			imageUrl:
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			images: [
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			],
			ingredients: "Miconazole Nitrate 2%, Talc base",
			sideEffects: "Skin irritation, rash (rare)",
			warnings:
				"Do not inhale. Apply to clean, dry skin. Avoid contact with eyes.",
			storage: "Store in a cool, dry place",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	"Wound Care": [
		{
			name: "Povidone Iodine Solution 10%",
			genericName: "Povidone Iodine",
			manufacturer: "Square Pharmaceuticals",
			price: 3.0,
			discountPrice: 2.5,
			discountPercentage: 17,
			stockQuantity: 400,
			lowStockThreshold: 50,
			unit: "bottle",
			dosageForm: "solution",
			strength: "10%",
			packSize: "100ml bottle",
			description:
				"Broad-spectrum antiseptic solution for wound cleaning, minor cuts, and scrapes. Kills bacteria, viruses, and fungi.",
			imageUrl:
				"https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400",
			images: [
				"https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400",
			],
			ingredients: "Povidone Iodine 10% w/v (1% available iodine)",
			sideEffects:
				"Skin staining, irritation, allergic reactions in iodine-sensitive individuals",
			warnings:
				"Not for deep wounds. Avoid in thyroid disorders. May stain skin and fabrics.",
			storage: "Store below 25°C protected from light",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Antibiotic Wound Ointment",
			genericName: "Neomycin + Bacitracin",
			manufacturer: "Acme Laboratories",
			price: 4.5,
			stockQuantity: 320,
			lowStockThreshold: 40,
			unit: "tube",
			dosageForm: "ointment",
			strength: "3.5mg/g + 400IU/g",
			packSize: "15g tube",
			description:
				"Triple antibiotic ointment for preventing infection in minor cuts, scrapes, and burns.",
			imageUrl:
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			images: [
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			],
			ingredients: "Neomycin Sulfate 3.5mg/g, Bacitracin Zinc 400IU/g",
			sideEffects: "Allergic reactions, skin rash, itching",
			warnings:
				"Not for large or deep wounds. Stop use if rash develops. For external use only.",
			storage: "Store below 30°C",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	// Child Categories - Allergy Relief
	"Seasonal Allergies": [
		{
			name: "Cetirizine 10mg Once Daily",
			genericName: "Cetirizine Dihydrochloride",
			manufacturer: "Beximco Pharmaceuticals",
			price: 3.0,
			discountPrice: 2.5,
			discountPercentage: 17,
			stockQuantity: 450,
			lowStockThreshold: 55,
			unit: "strip",
			dosageForm: "tablet",
			strength: "10mg",
			packSize: "10 tablets per strip",
			description:
				"Non-drowsy antihistamine for seasonal allergies, hay fever symptoms, sneezing, and itchy watery eyes.",
			imageUrl:
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			images: [
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			],
			ingredients: "Cetirizine Dihydrochloride 10mg",
			sideEffects: "Drowsiness (less common), dry mouth, fatigue",
			warnings:
				"May cause drowsiness in some. Avoid alcohol. Not for children under 6.",
			storage: "Store below 30°C in a dry place",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Allergy Eye Drops 10ml",
			genericName: "Ketotifen Fumarate",
			manufacturer: "Opsonin Pharma",
			price: 5.0,
			stockQuantity: 250,
			lowStockThreshold: 35,
			unit: "bottle",
			dosageForm: "drops",
			strength: "0.025%",
			packSize: "10ml bottle",
			description:
				"Antihistamine eye drops for allergic conjunctivitis, itchy and red eyes due to pollen, dust, and pet dander.",
			imageUrl:
				"https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400",
			images: [
				"https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400",
			],
			ingredients: "Ketotifen Fumarate 0.025%",
			sideEffects: "Temporary stinging, dry eyes, blurred vision",
			warnings:
				"Remove contact lenses before use. Wait 15 minutes before reinserting.",
			storage: "Store below 25°C. Discard 4 weeks after opening.",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],

	"Anti-Itch": [
		{
			name: "Hydrocortisone Cream 1% 30g",
			genericName: "Hydrocortisone Acetate",
			manufacturer: "ACI Limited",
			price: 4.0,
			discountPrice: 3.5,
			discountPercentage: 12,
			stockQuantity: 380,
			lowStockThreshold: 45,
			unit: "tube",
			dosageForm: "cream",
			strength: "1%",
			packSize: "30g tube",
			description:
				"Mild steroid cream for eczema, insect bites, rashes, and itchy skin conditions. Fast itch relief.",
			imageUrl:
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			images: [
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			],
			ingredients: "Hydrocortisone Acetate 1% w/w",
			sideEffects: "Skin thinning with prolonged use, burning sensation",
			warnings:
				"Do not use on face for more than 5 days. Not for infected skin. Avoid prolonged use.",
			storage: "Store below 25°C",
			requiresPrescription: false,
			isFeatured: true,
			isActive: true,
		},
		{
			name: "Antihistamine Anti-Itch Lotion 100ml",
			genericName: "Diphenhydramine + Calamine",
			manufacturer: "Hamdard Laboratories",
			price: 4.5,
			stockQuantity: 300,
			lowStockThreshold: 40,
			unit: "bottle",
			dosageForm: "lotion",
			strength: "1% + 8%",
			packSize: "100ml bottle",
			description:
				"Soothing anti-itch lotion combining antihistamine with calamine for sunburn, rashes, and allergic skin reactions.",
			imageUrl:
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			images: [
				"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			],
			ingredients: "Diphenhydramine HCl 1%, Calamine 8%",
			sideEffects: "Drowsiness if applied to large areas, skin dryness",
			warnings: "For external use only. Do not use on blistered or raw skin.",
			storage: "Store below 30°C. Shake well before use.",
			requiresPrescription: false,
			isFeatured: false,
			isActive: true,
		},
	],
};

export async function seedMedicines() {
	console.log("💊 Seeding medicines...");

	// Dynamically fetch ALL categories (parent and child)
	const categories = await prisma.category.findMany({
		where: { isActive: true },
		orderBy: { order: "asc" },
	});

	if (categories.length === 0) {
		console.log("   ⚠️  No categories found. Skipping medicine seeding.");
		return;
	}

	// Dynamically fetch ALL sellers
	const sellers = await prisma.user.findMany({
		where: { role: "SELLER" },
	});

	if (sellers.length === 0) {
		console.log("   ⚠️  No sellers found. Skipping medicine seeding.");
		return;
	}

	console.log(
		`   📂 Found ${categories.length} categories: ${categories.map((c) => c.name).join(", ")}`,
	);
	console.log(
		`   🏪 Found ${sellers.length} sellers: ${sellers.map((s) => s.name).join(", ")}`,
	);

	let sellerIndex = 0;
	let totalCreated = 0;

	for (const category of categories) {
		const templates = medicinesByCategory[category.name];

		if (!templates || templates.length === 0) {
			console.log(
				`   ⏭️  No medicine templates for category "${category.name}", skipping.`,
			);
			continue;
		}

		const created = await Promise.all(
			templates.map((template) => {
				// Round-robin seller assignment across all sellers
				const seller = sellers[sellerIndex % sellers.length]!;
				sellerIndex++;

				const slug = helper.getSlug(template.name);
				const data = {
					...template,
					slug,
					sku: `MED-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
					categoryId: category.id,
					sellerId: seller.id,
				};

				return prisma.medicine.upsert({
					where: { slug },
					update: data,
					create: data,
				});
			}),
		);

		console.log(
			`   ✅ ${created.length} medicines created for "${category.name}"`,
		);
		totalCreated += created.length;
	}

	console.log(
		`   🎉 Total: ${totalCreated} medicines created across ${categories.length} categories and ${sellers.length} sellers`,
	);
}
