ALTER TABLE meetings ADD COLUMN title VARCHAR(200);
ALTER TABLE meetings ADD COLUMN description TEXT NULL;
UPDATE meetings SET title = 'Termin ohne Titel' WHERE title IS NULL;
ALTER TABLE meetings ALTER COLUMN title SET NOT NULL;
