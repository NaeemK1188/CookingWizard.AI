-- Use SQL insert statements to add any
-- starting/dummy data to your database tables

-- EXAMPLE:

--  insert into "todos"
--    ("task", "isCompleted")
--    values
--      ('Learn to code', false),
--      ('Build projects', false),
--      ('Get a job', false);
-- using default guest username and hashed password, so when we reset the database
-- the guest user or sign in as guest will always works
insert into "Users" ("username", "hashedPassword" )
values ('guest', '$argon2id$v=19$m=65536,t=3,p=4$tMbSvw9M97Ob9oALO4Q2TQ$yfsrNVK4kNjK68ls7nr/ytbETFLNAW8/JchNvRC6CTc');



-- default recipes when we don't have the signIn/SignUp setup yet.
-- Now whenever we have userId one, the user will have two recipes as a defaulted or starting recipes
-- the default recipes wont be organized with <markdown>
-- insert into "Recipes" ("userId","responseTitle", "requestIngredient", "responseInstruction" )
-- values (1, 'Tomato-Potato Rice Delight', 'Tomatoes, rice, and potatoes ', 'Ingredients:
-- 1 cup rice
-- 2 medium potatoes, diced
-- 2 large tomatoes, chopped
-- 2 cups water
-- 1 tbsp oil (if available)
-- 1 tsp salt
-- ½ tsp black pepper (optional)
-- ½ tsp paprika or chili powder (optional)
-- Instructions:
-- Cook the rice: In a pot, bring 2 cups of water to a boil. Add the rice and a pinch of salt. Lower the heat, cover, and let it simmer until the rice is fully cooked (about 15 minutes).
-- Sauté the potatoes: In a pan, heat oil (if available) and add diced potatoes. Cook until golden and slightly crispy.
-- Add tomatoes: Toss in the chopped tomatoes, stirring occasionally. Cook until they soften and release their juices, creating a light sauce.
-- Season the dish: Add salt, black pepper, and any spices you have. Stir well and let everything cook together for 5 more minutes.
-- Combine with rice: Mix the cooked rice into the pan with potatoes and tomatoes. Stir well so the flavors blend.
-- Serve warm: Enjoy your simple yet delicious Tomato-Potato Rice Delight!' ),
-- (1, 'Veggie Delight', 'onions and tomatoes', '2 large tomatoes, chopped
-- 2 cups water
-- 1 tbsp oil (if available)
-- 1 tsp salt
-- ½ tsp black pepper (optional)
-- instructions:
-- Add tomatoes: Toss in the chopped tomatoes, stirring occasionally. Cook until they soften and release their juices, creating a light sauce.
-- Season the dish: Add salt, black pepper, and any spices you have. Stir well and let everything cook together for 5 more minutes.');
-- -- (2, 'lamb yogurt special', 'lamb and yogurt', 'stirring occasionally. Cook until they soften and release their juices, creating a light sauce.
-- -- Season the dish: Add salt, black pepper, and any spices you have. Stir well and let everything cook together for 5 more minutes.' );
