-- Update the check constraint on sources.type to include new formats
ALTER TABLE sources DROP CONSTRAINT IF EXISTS sources_type_check;
ALTER TABLE sources ADD CONSTRAINT sources_type_check 
  CHECK (type IN ('pdf', 'docx', 'txt', 'csv', 'md', 'html', 'xlsx', 'web', 'youtube'));
