export const NIGERIAN_CAMPUSES = [
  // Federal Universities
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "University of Nigeria, Nsukka (UNN)",
  "Ahmadu Bello University (ABU)",
  "Obafemi Awolowo University (OAU)",
  "University of Benin (UNIBEN)",
  "University of Ilorin (UNILORIN)",
  "University of Port Harcourt (UNIPORT)",
  "Federal University of Technology, Akure (FUTA)",
  "Federal University of Technology, Minna (FUTMINNA)",
  "Federal University of Technology, Owerri (FUTO)",
  "University of Calabar (UNICAL)",
  "University of Jos (UNIJOS)",
  "University of Maiduguri (UNIMAID)",
  "Bayero University Kano (BUK)",
  "Nnamdi Azikiwe University (NAU)",
  "Federal University, Oye-Ekiti (FUOYE)",
  "Federal University, Dutse (FUD)",
  "Federal University, Lokoja (FUL)",
  "Federal University, Lafia (FULAFIA)",
  "Federal University, Wukari (FUW)",
  "Federal University, Kashere (FUK)",
  "Federal University, Dutsin-Ma (FUDMA)",
  "Federal University, Birnin Kebbi (FUBK)",
  "Federal University, Gusau (FUGUS)",
  "Federal University, Gashua (FUGASHUA)",
  
  // State Universities
  "Lagos State University (LASU)",
  "Ladoke Akintola University (LAUTECH)",
  "Rivers State University (RSU)",
  "Enugu State University (ESUT)",
  "Imo State University (IMSU)",
  "Delta State University (DELSU)",
  "Ekiti State University (EKSU)",
  "Osun State University (UNIOSUN)",
  "Ondo State University (OSU)",
  "Abia State University (ABSU)",
  "Anambra State University (ANSU)",
  "Benue State University (BSU)",
  "Cross River University of Technology (CRUTECH)",
  "Kaduna State University (KASU)",
  "Kano State University (KUST)",
  "Kwara State University (KWASU)",
  "Nasarawa State University (NSUK)",
  "Niger State University (NSTU)",
  "Ogun State University (TASUED)",
  "Plateau State University (PLASU)",
  
  // Private Universities
  "Covenant University",
  "Babcock University",
  "Pan-Atlantic University",
  "Landmark University",
  "Afe Babalola University (ABUAD)",
  "Bells University of Technology",
  "Bowen University",
  "Lead City University",
  "Redeemer's University",
  "Caleb University",
  "Crawford University",
  "Joseph Ayo Babalola University",
  "American University of Nigeria (AUN)",
  "Madonna University",
  "Igbinedion University",
  "BAZE University",
  "Nile University of Nigeria",
  "Veritas University",
  
  // Polytechnics
  "Yaba College of Technology (YABATECH)",
  "Federal Polytechnic Ilaro",
  "Federal Polytechnic Nekede",
  "Auchi Polytechnic",
  "Kaduna Polytechnic",
  "Lagos State Polytechnic (LASPOTECH)",
  "Federal Polytechnic Ado-Ekiti",
  "Federal Polytechnic Bida",
  "Rufus Giwa Polytechnic",
  "Institute of Management and Technology (IMT) Enugu",
  
  // Colleges of Education
  "Federal College of Education, Akoka",
  "Federal College of Education, Zaria",
  "Adeniran Ogunsanya College of Education",
  
  // Other
  "Other Campus"
];

export const CATEGORIES = [
  { value: "food_drinks", label: "Food & Drinks", icon: "🍔" },
  { value: "services", label: "Services (Typing, Tutorials, etc.)", icon: "💼" },
  { value: "electronics", label: "Electronics & Gadgets", icon: "📱" },
  { value: "books", label: "Books & Study Materials", icon: "📚" },
  { value: "fashion", label: "Fashion & Clothing", icon: "👗" },
  { value: "accommodation", label: "Accommodation", icon: "🏠" },
  { value: "transportation", label: "Transportation", icon: "🚗" },
  { value: "other", label: "Other", icon: "📦" }
];

export const SUBSCRIPTION_PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    listings: 1,
    features: ["1 Active Listing", "WhatsApp Contact", "Basic Support"]
  },
  {
    id: "basic",
    name: "Basic",
    price: 1999,
    listings: 3,
    features: ["Up to 3 Listings", "WhatsApp Contact", "Priority Support", "Featured Badge"]
  },
  {
    id: "premium",
    name: "Premium",
    price: 5000,
    listings: -1, // unlimited
    period: "monthly",
    features: ["Unlimited Listings", "WhatsApp Contact", "24/7 Premium Support", "Featured Badge", "Top Search Results", "Analytics Dashboard"]
  }
];