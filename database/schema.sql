set client_min_messages to warning;

-- DANGER: this is NOT how to do it in the real world.
-- `drop schema` INSTANTLY ERASES EVERYTHING.
drop schema "public" cascade;

create schema "public";

CREATE TABLE "Users" (
  "userId" serial PRIMARY KEY,
  "username" text UNIQUE NOT NULL,
  "hashedPassword" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "Recipes" (
  "recipeId" serial PRIMARY KEY,
  "userId" int NOT NULL,
  "responseTitle" text NOT NULL,
  "requestIngredient" text NOT NULL,
  "responseInstruction" text NOT NULL,
  "imgURL" text NOT NULL
);

ALTER TABLE "Recipes" ADD FOREIGN KEY ("userId") REFERENCES "Users" ("userId");
