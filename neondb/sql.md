```
-- Create building types enum
CREATE TYPE building_category AS ENUM ('basic_infrastructure', 'production', 'military');

-- Create buildings table
CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category building_category NOT NULL,
    population_capacity INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create resources table
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

-- Create building productions table
CREATE TABLE building_productions (
    id SERIAL PRIMARY KEY,
    building_id INTEGER REFERENCES buildings(id),
    resource_id INTEGER REFERENCES resources(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(building_id, resource_id)
);

-- Insert resources
INSERT INTO resources (name) VALUES
    ('Wheat'),
    ('Stone'),
    ('Wood'),
    ('Coal'),
    ('Fish'),
    ('Sapphire'),
    ('Obsidian'),
    ('Ruby'),
    ('Deep Crystal'),
    ('Silver'),
    ('Gold'),
    ('Ironwood'),
    ('Hartwood'),
    ('Donkeys');

-- Insert buildings
INSERT INTO buildings (name, category, population_capacity, description) VALUES
    ('Worker Hut', 'basic_infrastructure', 5, 'Basic population housing'),
    ('Storehouse', 'basic_infrastructure', 2, 'Increases resource storage capacity'),
    ('Farm', 'production', 1, 'Produces Wheat'),
    ('Fishing Village', 'production', 1, 'Produces Fish'),
    ('Market', 'production', 3, 'Produces Donkeys and essential for trading'),
    ('Resource Facility', 'production', 2, 'Produces specified resource'),
    ('Barracks', 'military', 2, 'Produces Knights and increases max army count'),
    ('Stables', 'military', 3, 'Produces Paladins and increases max army count'),
    ('Archery Range', 'military', 2, 'Produces Crossbowmen and provides ranged combat');

-- Insert building costs
INSERT INTO building_costs (building_id, resource_id, amount) VALUES
    -- Worker Hut costs
    (1, (SELECT id FROM resources WHERE name = 'Wheat'), 300000),
    (1, (SELECT id FROM resources WHERE name = 'Stone'), 75000),
    (1, (SELECT id FROM resources WHERE name = 'Wood'), 75000),
    (1, (SELECT id FROM resources WHERE name = 'Coal'), 75000),

    -- Storehouse costs
    (2, (SELECT id FROM resources WHERE name = 'Fish'), 1000000),
    (2, (SELECT id FROM resources WHERE name = 'Coal'), 75000),
    (2, (SELECT id FROM resources WHERE name = 'Stone'), 75000),
    (2, (SELECT id FROM resources WHERE name = 'Sapphire'), 10000),

    -- Farm costs
    (3, (SELECT id FROM resources WHERE name = 'Fish'), 450000),

    -- Fishing Village costs
    (4, (SELECT id FROM resources WHERE name = 'Wheat'), 450000),

    -- Market costs
    (5, (SELECT id FROM resources WHERE name = 'Fish'), 750000),
    (5, (SELECT id FROM resources WHERE name = 'Stone'), 125000),
    (5, (SELECT id FROM resources WHERE name = 'Obsidian'), 50000),
    (5, (SELECT id FROM resources WHERE name = 'Ruby'), 25000),
    (5, (SELECT id FROM resources WHERE name = 'Deep Crystal'), 5000);

-- Insert building productions
INSERT INTO building_productions (building_id, resource_id) VALUES
    (3, (SELECT id FROM resources WHERE name = 'Wheat')),
    (4, (SELECT id FROM resources WHERE name = 'Fish')),
    (5, (SELECT id FROM resources WHERE name = 'Donkeys'));

-- Create useful views
CREATE VIEW building_details AS
SELECT
    b.name as building_name,
    b.category,
    b.population_capacity,
    b.description,
    json_agg(
        json_build_object(
            'resource', r.name,
            'amount', bc.amount
        )
    ) as costs,
    array_agg(DISTINCT rp.name) as produces
FROM buildings b
LEFT JOIN building_costs bc ON b.id = bc.building_id
LEFT JOIN resources r ON bc.resource_id = r.id
LEFT JOIN building_productions bp ON b.id = bp.building_id
LEFT JOIN resources rp ON bp.resource_id = rp.id
GROUP BY b.id, b.name, b.category, b.population_capacity, b.description;

-- Create indexes for better query performance
CREATE INDEX idx_building_costs_building_id ON building_costs(building_id);
CREATE INDEX idx_building_costs_resource_id ON building_costs(resource_id);
CREATE INDEX idx_building_productions_building_id ON building_productions(building_id);
CREATE INDEX idx_building_productions_resource_id ON building_productions(resource_id);
```
