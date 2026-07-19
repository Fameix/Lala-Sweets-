# Menu Extraction Review

## Source Inputs

- Master prompt text file attached by the user
- Public business listing on `sivagangaiseemai.com`
- No local menu image files were present in the workspace at the time of review

## Verified Public Listing Facts

The listing mentions:

- Master Bakery
- Master Grand
- Master Classic
- Aranmanai Vasal
- Near Sivagangai bus stand
- Gandhi Road
- Phone numbers: `+91 97509 62227`, `+91 97509 62223`
- Birthday cakes
- Ice creams
- Pizza
- Burgers
- Puffs
- Sweets

All listing-derived facts must remain `verification_status = "needs-review"` until the business owner confirms them.

## Confirmed Menu-Board Items

Milk Shake:

- Vanilla
- Strawberry
- Pista
- Chocolate
- Mango
- Cold Coffee
- Butter Scotch
- Black Currant
- Rose Milk
- Sugar Cane
- Sharjah Milk Shake

Ice Cream:

- Vanilla
- Strawberry
- Chocolate
- Pista
- Butter Scotch
- Black Currant
- Falooda
- Fruit Salad with Ice Cream

Snacks & Fries:

- Masala Fries
- Golden French Fries
- Smilies
- Chicken Nuggets

Hotties / Hot Beverages:

- Coffee
- Tea & Milk
- Green Tea
- Black Tea
- Lemon Tea

Soup:

- Veg. Soup
- Mushroom Soup
- Gobi 65

## Ambiguities Requiring Review

- `Sugar Cane`
  - Could be sugarcane juice, sugarcane milkshake, or another beverage
- `Tea & Milk`
  - Could be a combined item or two separate items
- `Gobi 65`
  - Listed under Soup, but likely belongs in Quick Bites
- Fries and potato products
  - Vegetarian status not assumed
- Chicken Nuggets
  - May be non-vegetarian
- All prices
  - Not visible, must be entered by admin
- Serving sizes and variants
  - Not visible, must be reviewed before ordering can be enabled

## Review Output Rules

- Do not invent prices
- Do not invent sizes
- Do not invent ingredients
- Do not mark any item as orderable until review is complete
- Use `needs-review` for ambiguous items
