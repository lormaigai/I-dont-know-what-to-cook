// Menu dishes available to the fridge matcher.
// Dishes are menu-card results only - no steps, by her request.
// needs: all must be in the fridge. needsAny: at least one. A dish with
// neither is a "menu pick" - always shown, not gated on what's stocked.

export const MEALS = [
  { id: 'breakfast', label: 'breakfast', emoji: '🍳' },
  { id: 'lunch', label: 'lunch', emoji: '🥗' },
  { id: 'dinner', label: 'dinner', emoji: '🍽️' },
]

export const MENU = [
  // ── breakfast (her menu's breakfast page) ──
  { id: 'scrambled-eggs', name: 'Scrambled Eggs', meal: 'breakfast', needs: ['egg'] },
  { id: 'evoo-avo', name: 'EVOO Avo', meal: 'breakfast', needs: ['avocado', 'bread'] },
  { id: 'birds-nest', name: "Bird's Nest", meal: 'breakfast' },
  { id: 'dumplings', name: 'Dumplings', meal: 'breakfast', needs: ['dumplings'] },
  { id: 'steamed-meat', name: 'Steamed Meat', meal: 'breakfast', desc: 'chicken, fish etc', needsAny: ['chicken', 'whitefish', 'salmon'] },
  { id: 'seasonal-fruits', name: 'Seasonal Fruits', meal: 'breakfast' },
  { id: 'yogurt-bowl', name: 'Yogurt Bowl', meal: 'breakfast', needs: ['yogurt'] },
  { id: 'overnight-oats', name: 'Overnight Oats', meal: 'breakfast', needs: ['oats'] },
  { id: 'sourdough-toast', name: 'Sourdough Toast', meal: 'breakfast', needs: ['bread'] },
  { id: 'croissant', name: 'Croissant', meal: 'breakfast', needs: ['croissant'] },
  { id: 'hot-cross-buns', name: 'Hot Cross Buns', meal: 'breakfast' },
  { id: 'toast', name: 'Toast', meal: 'breakfast', needs: ['bread'] },

  // ── lunch (appetizers, greens, sides) ──
  { id: 'yamitsuki-cabbage-salad', name: 'Yamitsuki Cabbage Salad', meal: 'lunch', desc: 'Japanese boiled cabbage tossed in sesame and garlic sauce', needs: ['cabbage', 'garlic', 'sesame'] },
  { id: 'watermelon-salad', name: 'Watermelon Salad', meal: 'lunch', desc: 'Fresh watermelons, lettuce, avocado and onions with a vinaigrette dressing', needs: ['watermelon', 'lettuce', 'avocado', 'onion'] },
  { id: 'burrata-salad', name: 'Burrata Salad', meal: 'lunch', desc: 'Arugula, cranberries, walnuts surrounding fresh burrata', needs: ['arugula', 'burrata', 'walnut'] },
  { id: 'smothered-chicken', name: 'Smothered Chicken', meal: 'lunch', desc: 'Grilled chicken breast topped with mushrooms, onions and cheese', needs: ['chicken', 'mushroom', 'onion', 'cheese'] },
  { id: 'yaw-mak-chye', name: 'Yaw Mak Chye', meal: 'lunch', desc: 'Stir fried with garlic', needs: ['yammakchye', 'garlic'] },
  { id: 'boiled-seasonal-vegetables', name: 'Boiled Seasonal Vegetables', meal: 'lunch', desc: 'Check with kitchen for available options' },
  { id: 'grilled-zucchini', name: 'Grilled Zucchini', meal: 'lunch', desc: 'Zucchini, pumpkin and carrots', needs: ['zucchini', 'carrot'] },
  { id: 'stir-fried-broccoli', name: 'Stir-Fried Broccoli', meal: 'lunch', desc: 'Stir-fried with sliced carrots', needs: ['broccoli', 'carrot'] },
  { id: 'glutinous-rice-meatballs', name: 'Glutinous Rice Meatballs', meal: 'lunch', desc: 'Juicy steamed meatballs coated in glutinous rice' },
  { id: 'tomato-egg', name: 'Tomato & Egg', meal: 'lunch', desc: 'Stir fried tomato and egg', needs: ['tomato', 'egg'] },
  { id: 'bitter-gourd-egg', name: 'Bitter Gourd & Egg', meal: 'lunch', desc: 'Stir fried bitter gourd & egg', needs: ['bittergourd', 'egg'] },
  { id: 'mushrooms', name: 'Mushrooms', meal: 'lunch', desc: 'Stir-fried mushrooms', needs: ['mushroom'] },

  // ── dinner (pork, fish, chicken mains) ──
  { id: 'abc-soup', name: 'ABC Soup', meal: 'dinner', desc: 'Boiled with carrots and radish', needs: ['carrot'] },
  { id: 'old-cucumber-soup', name: 'Old Cucumber Soup', meal: 'dinner', desc: 'Check with kitchen for available options' },
  { id: 'braised-pork-belly', name: 'Braised Pork Belly', meal: 'dinner', desc: 'Taiwanese-style braised pork with mushrooms and egg', needs: ['pork', 'mushroom', 'egg'] },
  { id: 'barbeque-pork-ribs', name: 'Barbeque Pork Ribs', meal: 'dinner', desc: 'Oven-baked pork ribs', needs: ['pork'] },
  { id: 'porridge-pork-ribs', name: 'Porridge Pork Ribs', meal: 'dinner', desc: 'Soft, off-the-bone pork ribs in porridge', needs: ['pork', 'rice'] },
  { id: 'shepherds-pie', name: "Shepherd's Pie", meal: 'dinner', desc: 'Mash potatoes and minced meat', needs: ['potato'] },
  { id: 'seasonal-fish', name: 'Seasonal Fish Selection', meal: 'dinner', desc: 'Pomfret · Sea Bass · Trout · Sole · Flounder · Yellow Jacket · Cod' },
  { id: 'ikea-salmon', name: 'IKEA Salmon', meal: 'dinner', desc: 'IKEA style broiled salmon with paprika, cheese and lemon', needs: ['salmon', 'cheese', 'lemon'] },
  { id: 'hamachi-collar', name: 'Salt-Grilled Hamachi Collar', meal: 'dinner' },
  { id: 'lemon-baked-cod', name: 'Lemon Baked Cod', meal: 'dinner', desc: 'Tender baked cod with lemon and crispy garlic', needs: ['whitefish', 'lemon', 'garlic'] },
  { id: 'steamed-chicken', name: 'Steamed Chicken', meal: 'dinner', desc: 'Soy sauce steamed chicken with sliced ginger', needs: ['chicken', 'soysauce', 'ginger'] },
  { id: 'paprika-chicken', name: 'Paprika Chicken', meal: 'dinner', desc: 'Air-fried with signature paprika seasoning', needs: ['chicken'] },
  { id: 'salt-baked-chicken', name: 'Salt-Baked Chicken', meal: 'dinner', desc: 'Traditional hakka slow baked chicken', needs: ['chicken'] },
  { id: 'pan-seared-chicken', name: 'Pan Seared Chicken Breast', meal: 'dinner', desc: 'Seared till juicy and tender', needs: ['chicken'] },
  { id: 'lormaigai', name: 'Lormaigai', meal: 'dinner', desc: 'Glutinous rice steamed chicken', needs: ['chicken', 'rice'] },
  { id: 'rosemary-lemon-chicken', name: 'Rosemary Lemon Chicken', meal: 'dinner', desc: 'Italian seasoning, slow roasted in oven', needs: ['chicken', 'rosemary', 'lemon'] },
]

export function scoreDish(dish, selectedSet) {
  const needs = dish.needs || []
  const needsAny = dish.needsAny || []
  const missing = needs.filter(id => !selectedSet.has(id))
  const anyOk = needsAny.length === 0 || needsAny.some(id => selectedSet.has(id))
  const isPick = needs.length === 0 && needsAny.length === 0
  return {
    dish,
    isPick,
    missing,
    anyOk,
    anyMissing: !anyOk,
    matched: !isPick && missing.length === 0 && anyOk,
  }
}
