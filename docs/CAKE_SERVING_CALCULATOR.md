# Cake Serving Calculator

The calculator uses configured serving rules from `features/serving-calculator/rules.ts`. The migration `0002_ai_customer_experience.sql` creates the `cake_serving_rules` table for Supabase-backed admin editing.

The calculation validates guest counts, applies portion rules, dessert reduction, buffer percentage, rounding increment, and min/max weights. It does not let AI invent serving counts.

