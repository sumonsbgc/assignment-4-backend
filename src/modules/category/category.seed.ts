import { prisma } from "@lib/prisma";
import { helper } from "@/helper";

export async function seedCategories() {
	console.log("📦 Seeding categories...");
	await prisma.category.deleteMany();

	const parentCategories = [
		{
			name: "Pain Relief",
			description:
				"Pain relievers and analgesics for headaches, muscle pain, and fever",
			image:
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			order: 1,
		},
		{
			name: "Cold & Flu",
			description: "Cold and flu medications, cough syrups, and decongestants",
			image:
				"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
			order: 2,
		},
		{
			name: "Digestive Health",
			description:
				"Digestive and stomach care products, antacids, and probiotics",
			image:
				"https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400",
			order: 3,
		},
		{
			name: "Vitamins & Supplements",
			description:
				"Nutritional supplements, multivitamins, and wellness products",
			image: "https://images.unsplash.com/photo-1550572017-4892b53c0459?w=400",
			order: 4,
		},
		{
			name: "First Aid",
			description:
				"First aid essentials, bandages, antiseptics, and wound care",
			image:
				"https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400",
			order: 5,
		},
		{
			name: "Skin Care",
			description: "Topical treatments, creams, and dermatological products",
			image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
			order: 6,
		},
		{
			name: "Eye & Ear Care",
			description: "Eye drops, ear drops, and optical care products",
			image:
				"https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400",
			order: 7,
		},
		{
			name: "Allergy Relief",
			description: "Antihistamines and allergy medications",
			image:
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
			order: 8,
		},
	];

	const createdParents = await Promise.all(
		parentCategories.map((cat) =>
			prisma.category.create({
				data: {
					name: cat.name,
					slug: helper.getSlug(cat.name),
					description: cat.description,
					image: cat.image,
					order: cat.order,
					isActive: true,
				},
			}),
		),
	);

	// Get parent IDs
	const painReliefId = createdParents.find((c) => c.name === "Pain Relief")?.id;
	const coldFluId = createdParents.find((c) => c.name === "Cold & Flu")?.id;
	const digestiveId = createdParents.find(
		(c) => c.name === "Digestive Health",
	)?.id;
	const vitaminsId = createdParents.find(
		(c) => c.name === "Vitamins & Supplements",
	)?.id;
	const skinCareId = createdParents.find((c) => c.name === "Skin Care")?.id;
	const allergyId = createdParents.find((c) => c.name === "Allergy Relief")?.id;

	// Child categories
	const childCategories = [
		// Pain Relief
		{
			name: "Headache Relief",
			description: "Medications for headaches and migraines",
			parentId: painReliefId,
			order: 1,
		},
		{
			name: "Muscle Pain",
			description: "Muscle relaxants and pain relief for muscle aches",
			parentId: painReliefId,
			order: 2,
		},
		{
			name: "Arthritis Care",
			description: "Joint pain and arthritis relief medications",
			parentId: painReliefId,
			order: 3,
		},
		// Cold & Flu
		{
			name: "Cough Syrups",
			description: "Cough suppressants and expectorants",
			parentId: coldFluId,
			order: 1,
		},
		{
			name: "Decongestants",
			description: "Nasal decongestants and sinus relief",
			parentId: coldFluId,
			order: 2,
		},
		{
			name: "Throat Lozenges",
			description: "Sore throat relief and throat lozenges",
			parentId: coldFluId,
			order: 3,
		},
		// Digestive Health
		{
			name: "Antacids",
			description: "Heartburn and acid reflux relief",
			parentId: digestiveId,
			order: 1,
		},
		{
			name: "Probiotics",
			description: "Digestive health and gut flora support",
			parentId: digestiveId,
			order: 2,
		},
		{
			name: "Anti-Diarrheal",
			description: "Diarrhea relief and stomach upset medications",
			parentId: digestiveId,
			order: 3,
		},
		// Vitamins & Supplements
		{
			name: "Multivitamins",
			description: "Complete daily multivitamin supplements",
			parentId: vitaminsId,
			order: 1,
		},
		{
			name: "Vitamin D",
			description: "Vitamin D supplements for bone health",
			parentId: vitaminsId,
			order: 2,
		},
		{
			name: "Vitamin C",
			description: "Vitamin C for immune support",
			parentId: vitaminsId,
			order: 3,
		},
		{
			name: "Calcium & Minerals",
			description: "Calcium and essential mineral supplements",
			parentId: vitaminsId,
			order: 4,
		},
		// Skin Care
		{
			name: "Acne Treatment",
			description: "Acne creams and spot treatments",
			parentId: skinCareId,
			order: 1,
		},
		{
			name: "Anti-Fungal",
			description: "Antifungal creams and treatments",
			parentId: skinCareId,
			order: 2,
		},
		{
			name: "Wound Care",
			description: "Wound healing creams and ointments",
			parentId: skinCareId,
			order: 3,
		},
		// Allergy Relief
		{
			name: "Seasonal Allergies",
			description: "Hay fever and seasonal allergy relief",
			parentId: allergyId,
			order: 1,
		},
		{
			name: "Anti-Itch",
			description: "Anti-itch creams and antihistamines",
			parentId: allergyId,
			order: 2,
		},
	];

	// Create child categories
	const createdChildren = await Promise.all(
		childCategories
			.filter((cat) => cat.parentId)
			.map((cat) =>
				prisma.category.create({
					data: {
						name: cat.name,
						slug: helper.getSlug(cat.name),
						description: cat.description,
						parentId: cat.parentId!,
						order: cat.order,
						isActive: true,
					},
				}),
			),
	);

	console.log(`   ✅ ${createdParents.length} parent categories`);
	console.log(`   ✅ ${createdChildren.length} child categories`);
}
