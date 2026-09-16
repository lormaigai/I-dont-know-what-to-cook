// Menu dishes available to the fridge matcher.
// Dishes are menu-card results only - no steps, by her request.
// needs: all must be in the fridge. needsAny: at least one. A dish with
// neither is a "menu pick" - always shown, not gated on what's stocked.

export const MEALS = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { id: 'main', label: 'Main meal', emoji: '🍽️' },
  { id: 'snack', label: 'Snack', emoji: '🥗' },
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

  // ── snack (the source menu's appetizers, greens and sides) ──
  { id: 'yamitsuki-cabbage-salad', name: 'Yamitsuki Cabbage Salad', meal: 'snack', desc: 'Japanese boiled cabbage tossed in sesame and garlic sauce', needs: ['cabbage', 'garlic', 'sesame'] },
  { id: 'watermelon-salad', name: 'Watermelon Salad', meal: 'snack', desc: 'Fresh watermelons, lettuce, avocado and onions with a vinaigrette dressing', needs: ['watermelon', 'lettuce', 'avocado', 'onion'] },
  { id: 'burrata-salad', name: 'Burrata Salad', meal: 'snack', desc: 'Arugula, cranberries, walnuts surrounding fresh burrata', needs: ['arugula', 'burrata', 'walnut'] },
  { id: 'smothered-chicken', name: 'Smothered Chicken', meal: 'snack', desc: 'Grilled chicken breast topped with mushrooms, onions and cheese', needs: ['chicken', 'mushroom', 'onion', 'cheese'] },
  { id: 'yaw-mak-chye', name: 'Yaw Mak Chye', meal: 'snack', desc: 'Stir fried with garlic', needs: ['yammakchye', 'garlic'] },
  { id: 'boiled-seasonal-vegetables', name: 'Boiled Seasonal Vegetables', meal: 'snack', desc: 'Check with kitchen for available options' },
  { id: 'grilled-zucchini', name: 'Grilled Zucchini', meal: 'snack', desc: 'Zucchini, pumpkin and carrots', needs: ['zucchini', 'carrot'] },
  { id: 'stir-fried-broccoli', name: 'Stir-Fried Broccoli', meal: 'snack', desc: 'Stir-fried with sliced carrots', needs: ['broccoli', 'carrot'] },
  { id: 'glutinous-rice-meatballs', name: 'Glutinous Rice Meatballs', meal: 'snack', desc: 'Juicy steamed meatballs coated in glutinous rice' },
  { id: 'tomato-egg', name: 'Tomato & Egg', meal: 'snack', desc: 'Stir fried tomato and egg', needs: ['tomato', 'egg'] },
  { id: 'bitter-gourd-egg', name: 'Bitter Gourd & Egg', meal: 'snack', desc: 'Stir fried bitter gourd & egg', needs: ['bittergourd', 'egg'] },
  { id: 'mushrooms', name: 'Mushrooms', meal: 'snack', desc: 'Stir-fried mushrooms', needs: ['mushroom'] },

  // ── main meal (the source menu's soups, pork, fish and chicken mains) ──
  { id: 'abc-soup', name: 'ABC Soup', meal: 'main', desc: 'Boiled with carrots and radish', needs: ['carrot'] },
  { id: 'old-cucumber-soup', name: 'Old Cucumber Soup', meal: 'main', desc: 'Check with kitchen for available options' },
  { id: 'braised-pork-belly', name: 'Braised Pork Belly', meal: 'main', desc: 'Taiwanese-style braised pork with mushrooms and egg', needs: ['pork', 'mushroom', 'egg'] },
  { id: 'barbeque-pork-ribs', name: 'Barbeque Pork Ribs', meal: 'main', desc: 'Oven-baked pork ribs', needs: ['pork'] },
  { id: 'porridge-pork-ribs', name: 'Porridge Pork Ribs', meal: 'main', desc: 'Soft, off-the-bone pork ribs in porridge', needs: ['pork', 'rice'] },
  { id: 'shepherds-pie', name: "Shepherd's Pie", meal: 'main', desc: 'Mash potatoes and minced meat', needs: ['potato'] },
  { id: 'seasonal-fish', name: 'Seasonal Fish Selection', meal: 'main', desc: 'Pomfret · Sea Bass · Trout · Sole · Flounder · Yellow Jacket · Cod' },
  { id: 'ikea-salmon', name: 'IKEA Salmon', meal: 'main', desc: 'IKEA style broiled salmon with paprika, cheese and lemon', needs: ['salmon', 'cheese', 'lemon'] },
  { id: 'hamachi-collar', name: 'Salt-Grilled Hamachi Collar', meal: 'main' },
  { id: 'lemon-baked-cod', name: 'Lemon Baked Cod', meal: 'main', desc: 'Tender baked cod with lemon and crispy garlic', needs: ['whitefish', 'lemon', 'garlic'] },
  { id: 'steamed-chicken', name: 'Steamed Chicken', meal: 'main', desc: 'Soy sauce steamed chicken with sliced ginger', needs: ['chicken', 'soysauce', 'ginger'] },
  { id: 'paprika-chicken', name: 'Paprika Chicken', meal: 'main', desc: 'Air-fried with signature paprika seasoning', needs: ['chicken'] },
  { id: 'salt-baked-chicken', name: 'Salt-Baked Chicken', meal: 'main', desc: 'Traditional hakka slow baked chicken', needs: ['chicken'] },
  { id: 'pan-seared-chicken', name: 'Pan Seared Chicken Breast', meal: 'main', desc: 'Seared till juicy and tender', needs: ['chicken'] },
  { id: 'lormaigai', name: 'Lormaigai', meal: 'main', desc: 'Glutinous rice steamed chicken', needs: ['chicken', 'rice'] },
  { id: 'rosemary-lemon-chicken', name: 'Rosemary Lemon Chicken', meal: 'main', desc: 'Italian seasoning, slow roasted in oven', needs: ['chicken', 'rosemary', 'lemon'] },
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
