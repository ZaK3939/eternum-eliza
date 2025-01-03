-- Drop existing tables if they exist
DROP TABLE IF EXISTS building_productions CASCADE;
DROP TABLE IF EXISTS building_costs CASCADE;
DROP TABLE IF EXISTS building_inputs CASCADE;
DROP TABLE IF EXISTS building_outputs CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS resources CASCADE;

-- Create resources table with additional metadata
CREATE TABLE resources (
id INTEGER PRIMARY KEY,
name VARCHAR(100) NOT NULL UNIQUE,
ticker VARCHAR(10) NOT NULL,
trait VARCHAR(100) NOT NULL,
description TEXT,
colour VARCHAR(7),
tier VARCHAR(20) NOT NULL,
value INTEGER,
weight_grams INTEGER,
rarity DECIMAL(10,2),
output_rate DECIMAL(10,4),
img_url TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT valid_tier CHECK (tier IN ('lords', 'military', 'transport', 'food', 'common', 'uncommon', 'rare', 'unique', 'mythic'))
);

-- Create buildings table
CREATE TABLE buildings (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL,
category VARCHAR(50) NOT NULL,
population_capacity INTEGER NOT NULL,
description TEXT,
strategic_effects TEXT,
adjacent_bonus TEXT,
production_rate INTEGER,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT valid_category CHECK (category IN ('basic_infrastructure', 'production', 'military'))
);

-- Create building costs junction table
CREATE TABLE building_costs (
id SERIAL PRIMARY KEY,
building_id INTEGER REFERENCES buildings(id),
resource_id INTEGER REFERENCES resources(id),
amount INTEGER NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
UNIQUE(building_id, resource_id)
);

-- Create building inputs table (resources needed for production)
CREATE TABLE building_inputs (
id SERIAL PRIMARY KEY,
building_id INTEGER REFERENCES buildings(id),
resource_id INTEGER REFERENCES resources(id),
amount DECIMAL(10,4) NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
UNIQUE(building_id, resource_id)
);

-- Create building outputs table
CREATE TABLE building_outputs (
id SERIAL PRIMARY KEY,
building_id INTEGER REFERENCES buildings(id),
resource_id INTEGER REFERENCES resources(id),
rate INTEGER NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
UNIQUE(building_id, resource_id)
);

-- Create building productions table (final production data)
CREATE TABLE building_productions (
id SERIAL PRIMARY KEY,
building_id INTEGER REFERENCES buildings(id),
resource_id INTEGER REFERENCES resources(id),
rate INTEGER,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
UNIQUE(building_id, resource_id)
);

-- Create indexes
CREATE INDEX idx_resources_tier ON resources(tier);
CREATE INDEX idx_resources_name ON resources(name);
CREATE INDEX idx_building_costs_building_id ON building_costs(building_id);
CREATE INDEX idx_building_costs_resource_id ON building_costs(resource_id);
CREATE INDEX idx_building_inputs_building_id ON building_inputs(building_id);
CREATE INDEX idx_building_outputs_building_id ON building_outputs(building_id);
CREATE INDEX idx_building_productions_building_id ON building_productions(building_id);

-- Create view for building details
CREATE OR REPLACE VIEW building_details AS
SELECT
b.name as building_name,
b.category,
b.population_capacity,
b.description,
b.strategic_effects,
b.production_rate,
json_agg(
json_build_object(
'resource', r.name,
'ticker', r.ticker,
'amount', bc.amount
)
) FILTER (WHERE r.name IS NOT NULL) as costs,
json_agg(
json_build_object(
'resource', rp.name,
'rate', bp.rate
)
) FILTER (WHERE rp.name IS NOT NULL) as productions,
json_agg(
json_build_object(
'resource', ri.name,
'amount', bi.amount
)
) FILTER (WHERE ri.name IS NOT NULL) as inputs
FROM buildings b
LEFT JOIN building_costs bc ON b.id = bc.building_id
LEFT JOIN resources r ON bc.resource_id = r.id
LEFT JOIN building_productions bp ON b.id = bp.building_id
LEFT JOIN resources rp ON bp.resource_id = rp.id
LEFT JOIN building_inputs bi ON b.id = bi.building_id
LEFT JOIN resources ri ON bi.resource_id = ri.id
GROUP BY
b.id,
b.name,
b.category,
b.population_capacity,
b.description,
b.strategic_effects,
b.production_rate;
