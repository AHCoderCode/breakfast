export const BRAND = {
  name: "morning house",
  tagline: "A better kind of morning.",
  shortName: "MH"
};

export const BUSINESS_CONFIG = {
  currency: "PKR",
  locale: "en-PK",
  collectionAddress: "Collection address to be confirmed",
  addressIsPlaceholder: true,
  pickupHoursLabel: "Demo pickup window · configure real opening hours before launch",
  pickupSlots: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  acceptingAsap: false,
  serviceFee: 0
};

export const COUPONS = {
  MORNING10: {
    rate: 0.1,
    minimum: 0,
    label: "10% off your breakfast",
    expires: "2027-01-01"
  },
  BREAKFAST15: {
    rate: 0.15,
    minimum: 1000,
    label: "15% off orders over PKR 1,000",
    expires: "2027-01-01"
  }
};

const IMG = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=82`;

export const CATEGORIES = [
  { id: "all", label: "All day breakfast", icon: "✳" },
  { id: "classics", label: "Classics", icon: "☀" },
  { id: "local", label: "Desi favourites", icon: "◈" },
  { id: "sandwiches", label: "Sandwiches & bakery", icon: "▱" },
  { id: "drinks", label: "Coffee & drinks", icon: "⌁" },
  { id: "combos", label: "Combos", icon: "✺" }
];

export const PRODUCTS = [
  {
    id: "sunny-eggs",
    name: "Sunny-side eggs",
    category: "classics",
    description: "Two golden eggs, buttery sourdough and a little chilli crunch.",
    price: 690,
    image: IMG("photo-1525351484163-7529414344d8"),
    rating: 4.9,
    reviews: 128,
    bestseller: true,
    vegetarian: true,
    available: true,
    badge: "Bestseller",
    groups: [
      { id: "size", label: "Make it yours", type: "single", required: true, options: [
        { id: "regular", label: "Regular", price: 0, selected: true },
        { id: "large", label: "Large plate", price: 220 }
      ]},
      { id: "extras", label: "Add a little extra", type: "multi", options: [
        { id: "avocado", label: "Avocado", price: 260 },
        { id: "cheese", label: "Cheddar", price: 120 },
        { id: "hashbrown", label: "Hash brown", price: 150 }
      ]},
      { id: "eggs", label: "Egg style", type: "single", required: true, options: [
        { id: "sunny", label: "Sunny-side up", price: 0, selected: true },
        { id: "scrambled", label: "Scrambled", price: 0 },
        { id: "poached", label: "Poached", price: 50 }
      ]}
    ]
  },
  {
    id: "fluffy-pancakes",
    name: "Cloud-nine pancakes",
    category: "classics",
    description: "Fluffy buttermilk stacks with maple, berries and whipped butter.",
    price: 850,
    image: IMG("photo-1528207776546-365bb710ee93"),
    rating: 4.9,
    reviews: 96,
    bestseller: true,
    vegetarian: true,
    available: true,
    badge: "Guest favourite",
    groups: [
      { id: "stack", label: "Choose your stack", type: "single", required: true, options: [
        { id: "three", label: "Three pancakes", price: 0, selected: true },
        { id: "five", label: "Five pancakes", price: 260 }
      ]},
      { id: "toppings", label: "Toppings", type: "multi", options: [
        { id: "banana", label: "Banana", price: 100 },
        { id: "berries", label: "Mixed berries", price: 180 },
        { id: "chocolate", label: "Chocolate drizzle", price: 120 }
      ]}
    ]
  },
  {
    id: "cheese-omelette",
    name: "The cheese omelette",
    category: "classics",
    description: "A soft three-egg omelette, mature cheddar, herbs and toast.",
    price: 780,
    image: IMG("photo-1551218808-94e220e084d2"),
    rating: 4.8,
    reviews: 84,
    bestseller: true,
    vegetarian: true,
    available: true,
    groups: [
      { id: "size", label: "Portion", type: "single", required: true, options: [
        { id: "three-egg", label: "Three eggs", price: 0, selected: true },
        { id: "four-egg", label: "Four eggs", price: 160 }
      ]},
      { id: "fillings", label: "Fillings", type: "multi", options: [
        { id: "mushroom", label: "Mushrooms", price: 100 },
        { id: "spinach", label: "Spinach", price: 80 },
        { id: "feta", label: "Feta", price: 140 },
        { id: "chilli", label: "Green chilli", price: 30 }
      ]}
    ]
  },
  {
    id: "french-toast",
    name: "Vanilla French toast",
    category: "classics",
    description: "Golden brioche, vanilla custard, cinnamon sugar and maple.",
    price: 820,
    image: IMG("photo-1484723091739-30a097e8f929"),
    rating: 4.8,
    reviews: 73,
    bestseller: false,
    vegetarian: true,
    available: true,
    groups: [
      { id: "extras", label: "Make it extra special", type: "multi", options: [
        { id: "cream", label: "Vanilla cream", price: 100 },
        { id: "strawberries", label: "Fresh strawberries", price: 180 },
        { id: "caramel", label: "Salted caramel", price: 120 }
      ]}
    ]
  },
  {
    id: "breakfast-waffle",
    name: "Belgian breakfast waffle",
    category: "classics",
    description: "Crisp-edged waffle with seasonal fruit and warm maple syrup.",
    price: 880,
    image: IMG("photo-1562376552-0d160a2f238d"),
    rating: 4.7,
    reviews: 58,
    bestseller: false,
    vegetarian: true,
    available: true,
    groups: [
      { id: "extras", label: "Add-ons", type: "multi", options: [
        { id: "icecream", label: "Vanilla ice cream", price: 160 },
        { id: "pecans", label: "Toasted pecans", price: 130 },
        { id: "chocolate", label: "Chocolate sauce", price: 100 }
      ]}
    ]
  },
  {
    id: "breakfast-plate",
    name: "The morning plate",
    category: "classics",
    description: "Eggs, chicken sausage, herbed potatoes, toast and roasted tomatoes.",
    price: 1290,
    image: IMG("photo-1533089860892-a7c6f0a88666"),
    rating: 4.9,
    reviews: 112,
    bestseller: true,
    vegetarian: false,
    available: true,
    badge: "Big morning energy",
    groups: [
      { id: "eggs", label: "Eggs", type: "single", required: true, options: [
        { id: "scrambled", label: "Scrambled", price: 0, selected: true },
        { id: "fried", label: "Fried", price: 0 },
        { id: "omelette", label: "Omelette", price: 80 }
      ]},
      { id: "extras", label: "Extras", type: "multi", options: [
        { id: "extra-sausage", label: "Extra chicken sausage", price: 180 },
        { id: "avocado", label: "Avocado", price: 260 }
      ]}
    ]
  },
  {
    id: "anda-paratha",
    name: "Anda paratha",
    category: "local",
    description: "Flaky layered paratha wrapped around a spiced, fluffy egg.",
    price: 420,
    image: IMG("photo-1565299624946-b28f40a0ae38"),
    rating: 4.9,
    reviews: 144,
    bestseller: true,
    vegetarian: true,
    available: true,
    badge: "Desi favourite",
    groups: [
      { id: "paratha", label: "Paratha", type: "single", required: true, options: [
        { id: "plain", label: "Classic", price: 0, selected: true },
        { id: "wholewheat", label: "Wholewheat", price: 40 }
      ]},
      { id: "spice", label: "Spice level", type: "single", required: true, options: [
        { id: "mild", label: "Mild", price: 0, selected: true },
        { id: "medium", label: "Medium", price: 0 },
        { id: "hot", label: "Extra spicy", price: 0 }
      ]},
      { id: "extras", label: "Add-ons", type: "multi", options: [
        { id: "cheese", label: "Cheese", price: 100 },
        { id: "extra-egg", label: "Extra egg", price: 90 }
      ]}
    ]
  },
  {
    id: "chicken-paratha",
    name: "Chicken paratha roll",
    category: "local",
    description: "Juicy chicken, crisp paratha, mint chutney and pickled onions.",
    price: 590,
    image: IMG("photo-1568901346375-23c9450c58cd"),
    rating: 4.8,
    reviews: 91,
    bestseller: true,
    vegetarian: false,
    available: true,
    groups: [
      { id: "spice", label: "Spice level", type: "single", required: true, options: [
        { id: "mild", label: "Mild", price: 0, selected: true },
        { id: "medium", label: "Medium", price: 0 },
        { id: "hot", label: "Extra spicy", price: 0 }
      ]},
      { id: "extras", label: "Add-ons", type: "multi", options: [
        { id: "cheese", label: "Cheese", price: 100 },
        { id: "double-chicken", label: "Double chicken", price: 210 }
      ]}
    ]
  },
  {
    id: "aloo-paratha",
    name: "Aloo paratha",
    category: "local",
    description: "Golden griddled paratha stuffed with potato, herbs and warming spices.",
    price: 360,
    image: IMG("photo-1601050690597-df0568f70950"),
    rating: 4.8,
    reviews: 87,
    bestseller: false,
    vegetarian: true,
    available: true,
    groups: [
      { id: "extras", label: "On the side", type: "multi", options: [
        { id: "yogurt", label: "Fresh yogurt", price: 80 },
        { id: "pickle", label: "Achar", price: 50 },
        { id: "butter", label: "Extra butter", price: 60 }
      ]}
    ]
  },
  {
    id: "halwa-puri",
    name: "Halwa puri brunch",
    category: "local",
    description: "A cosy desi spread with soft halwa, chana masala and two puris.",
    price: 690,
    image: IMG("photo-1547592180-85f173990554"),
    rating: 4.9,
    reviews: 103,
    bestseller: true,
    vegetarian: true,
    available: true,
    groups: [
      { id: "puri", label: "Puri count", type: "single", required: true, options: [
        { id: "two", label: "Two puris", price: 0, selected: true },
        { id: "three", label: "Three puris", price: 90 }
      ]},
      { id: "extras", label: "Extras", type: "multi", options: [
        { id: "extra-chana", label: "Extra chana", price: 110 },
        { id: "extra-halwa", label: "Extra halwa", price: 130 }
      ]}
    ]
  },
  {
    id: "chana-bowl",
    name: "Spiced chana bowl",
    category: "local",
    description: "Slow-cooked chickpeas, fresh coriander, lemon and warm naan.",
    price: 480,
    image: IMG("photo-1547592180-85f173990554"),
    rating: 4.7,
    reviews: 62,
    bestseller: false,
    vegetarian: true,
    available: true,
    groups: [
      { id: "extras", label: "Extras", type: "multi", options: [
        { id: "yogurt", label: "Yogurt", price: 80 },
        { id: "extra-naan", label: "Extra naan", price: 100 }
      ]}
    ]
  },
  {
    id: "egg-sandwich",
    name: "The proper egg sandwich",
    category: "sandwiches",
    description: "Soft scrambled eggs, cheddar, chives and toasted milk bread.",
    price: 620,
    image: IMG("photo-1528735602780-2552fd46c7af"),
    rating: 4.8,
    reviews: 88,
    bestseller: true,
    vegetarian: true,
    available: true,
    groups: [
      { id: "bread", label: "Bread", type: "single", required: true, options: [
        { id: "sourdough", label: "Sourdough", price: 0, selected: true },
        { id: "wholegrain", label: "Wholegrain", price: 0 },
        { id: "croissant", label: "Croissant", price: 120 }
      ]},
      { id: "extras", label: "Extras", type: "multi", options: [
        { id: "avocado", label: "Avocado", price: 260 },
        { id: "bacon", label: "Chicken strip", price: 170 }
      ]}
    ]
  },
  {
    id: "chicken-sandwich",
    name: "Herby chicken toastie",
    category: "sandwiches",
    description: "Grilled chicken, melted cheese, pesto and a crisp golden toastie.",
    price: 760,
    image: IMG("photo-1553909489-cd47e0ef937f"),
    rating: 4.8,
    reviews: 67,
    bestseller: false,
    vegetarian: false,
    available: true,
    groups: [
      { id: "bread", label: "Bread", type: "single", required: true, options: [
        { id: "sourdough", label: "Sourdough", price: 0, selected: true },
        { id: "wholegrain", label: "Wholegrain", price: 0 }
      ]},
      { id: "extras", label: "Extras", type: "multi", options: [
        { id: "extra-cheese", label: "Extra cheese", price: 100 },
        { id: "double-chicken", label: "Double chicken", price: 210 }
      ]}
    ]
  },
  {
    id: "butter-croissant",
    name: "Butter croissant",
    category: "sandwiches",
    description: "A delicate, flaky, all-butter pastry baked until deeply golden.",
    price: 290,
    image: IMG("photo-1555507036-ab1f4038808a"),
    rating: 4.7,
    reviews: 54,
    bestseller: false,
    vegetarian: true,
    available: true,
    groups: [
      { id: "extras", label: "Make it yours", type: "multi", options: [
        { id: "jam", label: "House jam", price: 70 },
        { id: "butter", label: "Whipped butter", price: 60 }
      ]}
    ]
  },
  {
    id: "breakfast-bagel",
    name: "Everything bagel",
    category: "sandwiches",
    description: "Toasted bagel, cream cheese, cucumber and fresh herbs.",
    price: 540,
    image: IMG("photo-1551106652-a5bcf4b29ab6"),
    rating: 4.6,
    reviews: 41,
    bestseller: false,
    vegetarian: true,
    available: true,
    groups: [
      { id: "extras", label: "Extras", type: "multi", options: [
        { id: "smoked-salmon", label: "Smoked salmon", price: 320 },
        { id: "avocado", label: "Avocado", price: 260 }
      ]}
    ]
  },
  {
    id: "house-latte",
    name: "House latte",
    category: "drinks",
    description: "A balanced double espresso with silky steamed milk.",
    price: 420,
    image: IMG("photo-1461023058943-07fcbe16d735"),
    rating: 4.9,
    reviews: 154,
    bestseller: true,
    vegetarian: true,
    available: true,
    groups: [
      { id: "size", label: "Cup size", type: "single", required: true, options: [
        { id: "regular", label: "Regular · 250 ml", price: 0, selected: true },
        { id: "large", label: "Large · 350 ml", price: 100 }
      ]},
      { id: "milk", label: "Milk", type: "single", required: true, options: [
        { id: "whole", label: "Whole milk", price: 0, selected: true },
        { id: "oat", label: "Oat milk", price: 100 },
        { id: "almond", label: "Almond milk", price: 120 }
      ]},
      { id: "extras", label: "Extras", type: "multi", options: [
        { id: "extra-shot", label: "Extra espresso shot", price: 120 },
        { id: "vanilla", label: "Vanilla syrup", price: 60 }
      ]}
    ]
  },
  {
    id: "cappuccino",
    name: "Classic cappuccino",
    category: "drinks",
    description: "Rich espresso, steamed milk and a cloud of fine foam.",
    price: 390,
    image: IMG("photo-1517701604599-bb29b565090c"),
    rating: 4.8,
    reviews: 90,
    bestseller: false,
    vegetarian: true,
    available: true,
    groups: [
      { id: "size", label: "Cup size", type: "single", required: true, options: [
        { id: "regular", label: "Regular", price: 0, selected: true },
        { id: "large", label: "Large", price: 90 }
      ]},
      { id: "extras", label: "Extras", type: "multi", options: [
        { id: "oat", label: "Oat milk", price: 100 },
        { id: "extra-shot", label: "Extra espresso shot", price: 120 }
      ]}
    ]
  },
  {
    id: "masala-chai",
    name: "Slow-brewed masala chai",
    category: "drinks",
    description: "Black tea simmered with milk, ginger, cardamom and cinnamon.",
    price: 220,
    image: IMG("photo-1571934811356-5cc061b6821f"),
    rating: 4.9,
    reviews: 137,
    bestseller: true,
    vegetarian: true,
    available: true,
    groups: [
      { id: "size", label: "Cup size", type: "single", required: true, options: [
        { id: "cup", label: "Cup", price: 0, selected: true },
        { id: "pot", label: "Small pot", price: 150 }
      ]},
      { id: "sweetness", label: "Sweetness", type: "single", required: true, options: [
        { id: "less", label: "Less sugar", price: 0 },
        { id: "normal", label: "Regular", price: 0, selected: true },
        { id: "none", label: "No sugar", price: 0 }
      ]}
    ]
  },
  {
    id: "orange-juice",
    name: "Fresh orange juice",
    category: "drinks",
    description: "Freshly squeezed orange juice, served chilled.",
    price: 340,
    image: IMG("photo-1600271886742-f049cd451bba"),
    rating: 4.8,
    reviews: 72,
    bestseller: false,
    vegetarian: true,
    available: true,
    groups: [
      { id: "size", label: "Glass size", type: "single", required: true, options: [
        { id: "regular", label: "Regular", price: 0, selected: true },
        { id: "large", label: "Large", price: 120 }
      ]}
    ]
  },
  {
    id: "classic-combo",
    name: "The classic morning combo",
    category: "combos",
    description: "Two eggs, sourdough toast, herbed potatoes and a hot drink.",
    price: 1190,
    image: IMG("photo-1498837167922-ddd27525d352"),
    rating: 4.9,
    reviews: 101,
    bestseller: true,
    vegetarian: true,
    available: true,
    badge: "Combo save",
    groups: [
      { id: "eggs", label: "Eggs", type: "single", required: true, options: [
        { id: "fried", label: "Fried", price: 0, selected: true },
        { id: "scrambled", label: "Scrambled", price: 0 },
        { id: "omelette", label: "Omelette", price: 80 }
      ]},
      { id: "drink", label: "Choose your drink", type: "single", required: true, options: [
        { id: "chai", label: "Masala chai", price: 0, selected: true },
        { id: "americano", label: "Americano", price: 60 },
        { id: "latte", label: "House latte", price: 140 }
      ]}
    ]
  },
  {
    id: "pancake-coffee",
    name: "Pancakes & coffee",
    category: "combos",
    description: "A fluffy pancake stack paired with a freshly brewed coffee.",
    price: 1090,
    image: IMG("photo-1504754524776-8f4f37790ca0"),
    rating: 4.8,
    reviews: 79,
    bestseller: false,
    vegetarian: true,
    available: true,
    groups: [
      { id: "coffee", label: "Choose your coffee", type: "single", required: true, options: [
        { id: "americano", label: "Americano", price: 0, selected: true },
        { id: "latte", label: "Latte", price: 90 },
        { id: "cappuccino", label: "Cappuccino", price: 60 }
      ]}
    ]
  },
  {
    id: "family-box",
    name: "The family breakfast box",
    category: "combos",
    description: "A generous shareable spread with eggs, pancakes, fruit and parathas.",
    price: 2890,
    image: IMG("photo-1512621776951-a57141f2eefd"),
    rating: 4.9,
    reviews: 63,
    bestseller: false,
    vegetarian: false,
    available: true,
    groups: [
      { id: "eggs", label: "Egg style", type: "single", required: true, options: [
        { id: "scrambled", label: "Scrambled", price: 0, selected: true },
        { id: "fried", label: "Fried", price: 0 }
      ]},
      { id: "extras", label: "Extras", type: "multi", options: [
        { id: "extra-paratha", label: "Two extra parathas", price: 220 },
        { id: "juice", label: "Two fresh juices", price: 520 }
      ]}
    ]
  }
];

export const BUILDER_CHOICES = {
  mains: [
    { id: "eggs", label: "Two farm eggs", price: 360 },
    { id: "pancakes", label: "Pancake stack", price: 520 },
    { id: "omelette", label: "Cheese omelette", price: 590 },
    { id: "paratha", label: "Aloo paratha", price: 290 }
  ],
  sides: [
    { id: "potatoes", label: "Herbed potatoes", price: 180 },
    { id: "fruit", label: "Seasonal fruit", price: 220 },
    { id: "toast", label: "Sourdough toast", price: 140 },
    { id: "yogurt", label: "Fresh yogurt", price: 110 }
  ],
  drinks: [
    { id: "chai", label: "Masala chai", price: 160 },
    { id: "coffee", label: "Filter coffee", price: 240 },
    { id: "juice", label: "Orange juice", price: 280 },
    { id: "water", label: "Still water", price: 80 }
  ],
  extras: [
    { id: "avocado", label: "Avocado", price: 240 },
    { id: "cheese", label: "Extra cheese", price: 90 },
    { id: "sausage", label: "Chicken sausage", price: 170 }
  ]
};
