/*
  # Seed Mutations Table
  
  1. Purpose
    - Populate the mutations table with initial data
    - Enable voting functionality
  
  2. Data
    - Adds all transmission, symptom, and ability mutations
    - Sets initial vote counts to 0
*/

-- Transmission Mutations
INSERT INTO mutations (id, name, type, description, current_votes)
VALUES
  ('air1', 'Air Transmission I', 'transmission', 'Disease can travel through air particles', 0),
  ('air2', 'Air Transmission II', 'transmission', 'Enhanced airborne capabilities', 0),
  ('water1', 'Water Transmission', 'transmission', 'Spreads through water systems', 0),
  ('insect1', 'Insect Transmission', 'transmission', 'Insects can carry the disease', 0),
  ('animal1', 'Animal Transmission', 'transmission', 'Animals can spread the disease', 0),
  ('blood1', 'Blood Transmission', 'transmission', 'Spreads through blood contact', 0),
  ('extreme1', 'Extreme Bioaerosol', 'transmission', 'Advanced airborne mutation', 0),
  ('urban1', 'Urban Spread', 'transmission', 'Thrives in city environments', 0),
  ('rural1', 'Rural Spread', 'transmission', 'Spreads in rural areas', 0),
  ('extreme2', 'Extreme Resilience', 'transmission', 'Survives in any environment', 0),
  ('fomite1', 'Fomite Transmission', 'transmission', 'Spreads through contaminated surfaces', 0),
  ('aerosol1', 'Aerosol Transmission', 'transmission', 'Enhanced droplet transmission', 0),
  ('zoonotic1', 'Zoonotic Transmission', 'transmission', 'Cross-species transmission', 0)
ON CONFLICT (id) DO NOTHING;

-- Symptom Mutations
INSERT INTO mutations (id, name, type, description, current_votes)
VALUES
  ('cough1', 'Coughing', 'symptom', 'Causes infected to cough frequently', 0),
  ('sneeze1', 'Sneezing', 'symptom', 'Causes frequent sneezing', 0),
  ('nausea1', 'Nausea', 'symptom', 'Causes stomach discomfort', 0),
  ('rash1', 'Rash', 'symptom', 'Causes skin irritation', 0),
  ('insomnia1', 'Insomnia', 'symptom', 'Prevents restful sleep', 0),
  ('paranoia1', 'Paranoia', 'symptom', 'Causes mental instability', 0),
  ('hemorrhage1', 'Hemorrhaging', 'symptom', 'Causes internal bleeding', 0),
  ('coma1', 'Coma', 'symptom', 'Causes loss of consciousness', 0),
  ('necrosis1', 'Necrosis', 'symptom', 'Causes tissue death', 0),
  ('total1', 'Total Organ Failure', 'symptom', 'Complete system shutdown', 0),
  ('fever1', 'High Fever', 'symptom', 'Causes dangerous fever spikes', 0),
  ('seizure1', 'Seizures', 'symptom', 'Causes neurological symptoms', 0),
  ('cytokine1', 'Cytokine Storm', 'symptom', 'Triggers severe immune response', 0)
ON CONFLICT (id) DO NOTHING;

-- Ability Mutations
INSERT INTO mutations (id, name, type, description, current_votes)
VALUES
  ('resist1', 'Drug Resistance I', 'ability', 'Basic resistance to medical treatments', 0),
  ('resist2', 'Drug Resistance II', 'ability', 'Enhanced resistance to treatments', 0),
  ('cold1', 'Cold Resistance', 'ability', 'Survives in cold climates', 0),
  ('heat1', 'Heat Resistance', 'ability', 'Survives in hot climates', 0),
  ('genetic1', 'Genetic Hardening', 'ability', 'Improved genetic stability', 0),
  ('shield1', 'Viral Shield', 'ability', 'Protects against immune system', 0),
  ('extreme1', 'Extreme Bioaerosol', 'ability', 'Advanced environmental survival', 0),
  ('adapt1', 'Rapid Adaptation', 'ability', 'Quick environmental adaptation', 0),
  ('evolve1', 'Genetic Evolution', 'ability', 'Enhanced genetic capabilities', 0),
  ('ultimate1', 'Ultimate Evolution', 'ability', 'Peak viral evolution', 0),
  ('stealth1', 'Stealth Proteins', 'ability', 'Masks virus from immune detection', 0),
  ('mutate1', 'Rapid Mutation', 'ability', 'Increases mutation frequency', 0),
  ('dormancy1', 'Viral Dormancy', 'ability', 'Virus can remain dormant', 0)
ON CONFLICT (id) DO NOTHING;