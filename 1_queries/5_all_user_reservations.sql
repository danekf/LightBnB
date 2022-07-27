SELECT reservations.id, properties.title as title, properties.cost_per_night as cost_per_night, start_date, avg(rating) as average_rating
FROM reservations
JOIN properties ON properties.id = property_id
JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE reservations.guest_id = 1
GROUP BY properties.id, reservations.id
ORDER BY start_date
LIMIT 10;
