-- Base Eliza tables
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY,
  type VARCHAR(255) NOT NULL,
  content JSONB NOT NULL,
  embedding VECTOR(1536),
  "userId" UUID,
  "roomId" UUID REFERENCES rooms(id),
  "agentId" UUID,
  "unique" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cache (
  "key" TEXT NOT NULL,
  "agentId" UUID NOT NULL,
  value TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("key", "agentId")
);

-- Eternum specific tables
CREATE TABLE buildings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  population_capacity INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_category CHECK (category IN ('basic_infrastructure', 'production', 'military'))
);

CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE building_costs (
  id SERIAL PRIMARY KEY,
  building_id INTEGER REFERENCES buildings(id),
  resource_id INTEGER REFERENCES resources(id),
  amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(building_id, resource_id)
);

CREATE TABLE building_productions (
  id SERIAL PRIMARY KEY,
  building_id INTEGER REFERENCES buildings(id),
  resource_id INTEGER REFERENCES resources(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(building_id, resource_id)
);

-- Building details view
CREATE VIEW building_details AS
SELECT
  b.name as building_name,
  b.category,
  b.population_capacity,
  b.description,
  COALESCE(
    json_agg(
      CASE
        WHEN r.name IS NOT NULL THEN 
          json_build_object(
            'resource', r.name,
            'amount', bc.amount
          )
        ELSE NULL
      END
    ) FILTER (WHERE r.name IS NOT NULL),
    '[]'::json
  ) as costs,
  COALESCE(
    array_agg(DISTINCT rp.name) FILTER (WHERE rp.name IS NOT NULL),
    ARRAY[]::varchar[]
  ) as produces
FROM buildings b
LEFT JOIN building_costs bc ON b.id = bc.building_id
LEFT JOIN resources r ON bc.resource_id = r.id
LEFT JOIN building_productions bp ON b.id = bp.building_id
LEFT JOIN resources rp ON bp.resource_id = rp.id
GROUP BY b.id, b.name, b.category, b.population_capacity, b.description;

-- Indexes
CREATE INDEX idx_building_costs_building_id ON building_costs(building_id);
CREATE INDEX idx_building_costs_resource_id ON building_costs(resource_id);
CREATE INDEX idx_building_productions_building_id ON building_productions(building_id);
CREATE INDEX idx_building_productions_resource_id ON building_productions(resource_id);

-- Initial resource data
INSERT INTO resources (name) VALUES
  ('Wheat'), ('Stone'), ('Wood'), ('Coal'), ('Fish'),
  ('Sapphire'), ('Obsidian'), ('Ruby'), ('Deep Crystal'),
  ('Silver'), ('Gold'), ('Ironwood'), ('Hartwood'), ('Donkeys');

-- Initial building data
INSERT INTO buildings (name, category, population_capacity, description) VALUES
  ('Worker Hut', 'basic_infrastructure', 5, 'Basic population housing'),
  ('Storehouse', 'basic_infrastructure', 2, 'Increases resource storage capacity'),
  ('Farm', 'production', 1, 'Produces Wheat'),
  ('Fishing Village', 'production', 1, 'Produces Fish'),
  ('Market', 'production', 3, 'Produces Donkeys and essential for trading');

-- Initial building costs
INSERT INTO building_costs (building_id, resource_id, amount) VALUES
  (1, (SELECT id FROM resources WHERE name = 'Wheat'), 300000),
  (1, (SELECT id FROM resources WHERE name = 'Stone'), 75000),
  (2, (SELECT id FROM resources WHERE name = 'Fish'), 1000000),
  (3, (SELECT id FROM resources WHERE name = 'Fish'), 450000),
  (4, (SELECT id FROM resources WHERE name = 'Wheat'), 450000);

-- Initial productions
INSERT INTO building_productions (building_id, resource_id) VALUES
  (3, (SELECT id FROM resources WHERE name = 'Wheat')),
  (4, (SELECT id FROM resources WHERE name = 'Fish')),
  (5, (SELECT id FROM resources WHERE name = 'Donkeys'));