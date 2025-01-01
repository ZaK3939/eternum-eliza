```
-- Get all buildings with their costs and production
SELECT * FROM building_details;

-- Find buildings that produce a specific resource
SELECT building_name FROM building_details
WHERE 'Wheat' = ANY(produces);

-- Get buildings sorted by population capacity
SELECT name, population_capacity
FROM buildings
ORDER BY population_capacity DESC;
```
