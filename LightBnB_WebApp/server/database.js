const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  let user;
  return pool
    .query(
      `SELECT name, email, password, id 
      FROM users
      WHERE email = $1` ,
      [email])
    .then((result) => {
        if (result){
          user = result.rows[0];
          console.log(result.rows[0]);
        }
        else{
          user = null;
        }
        return Promise.resolve(user);
    })
    .catch((err) => {
      console.log(err.message);
    });
}

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {

  return pool
    .query(
      `SELECT name, email, password, id 
      FROM users
      WHERE id = $1` ,
      [id])
    .then((result) => {
        if (result){
          user = result.rows[0];
          console.log(result.rows[0]);
        }
        else{
          user = null;
        }
        return Promise.resolve(user);
    })
    .catch((err) => {
      console.log(err.message);
    });
};



  //   return Promise.resolve(users[id]);
// }
  exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
   return pool
  .query(`
    INSERT INTO users (
      name, email, password) 
      VALUES (
      $1, $2, $3)
      RETURNING *`, [user.name, user.email, user.password])
  .then((result) => {
      if (result){
        console.log(result.rows);
        return Promise.resolve(result);
      }
  })
  .catch((err) => {
    console.log(err.message);
  });

  // const userId = Object.keys(users).length + 1;
  // user.id = userId;
  // users[userId] = user;
  // console.log(user);
  // return Promise.resolve(user);
}

exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {

  return pool
  .query(`
    SELECT properties.*
    FROM reservations
    JOIN properties ON properties.id = property_id
    JOIN property_reviews ON properties.id = property_reviews.property_id
    WHERE reservations.guest_id = $1
    GROUP BY properties.id, reservations.id
    ORDER BY start_date
    LIMIT 10;` ,
    [guest_id])
  .then((result) => {
      if (result){
        console.log(result.rows)
        user = result.rows;
      }
      else{
        user = null;
      }
      return Promise.resolve(user);
  })
  .catch((err) => {
    console.log(err.message);
  });
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
 const getAllProperties = (options, limit = 10) => {


  const queryParams = []
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id 
  `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if(options.owner_id){
    queryParams.push(`${options.owner_id}`);
    if (queryString.includes("WHERE")){
      queryString += `AND owner_id = $${queryParams.length} `
    }
    else {
      queryString += `WHERE owner_id = $${queryParams.length} `
    }
  }


  if(options.minimum_price_per_night){
    queryParams.push(`${options.minimum_price_per_night}`);
    if (queryString.includes("WHERE")){
    queryString += `AND cost_per_night > $${queryParams.length} `
    }
    else{
      queryString += `WHERE cost_per_night > $${queryParams.length} `
    }
  }

  if(options.maximum_price_per_night){
    queryParams.push(`${options.maximum_price_per_night}`);
    if (queryString.includes("WHERE")){
    queryString += `AND cost_per_night < $${queryParams.length} `
    }
    else {
      queryString += `WHERE cost_per_night < $${queryParams.length} `
    }
  }


  queryString += `
  GROUP BY properties.id
  `

  if(options.minimum_rating){
    queryParams.push(`${options.minimum_rating}`);
    queryString += `HAVING avg(property_reviews.rating) >= $${queryParams.length} `
  }

  queryParams.push(limit);
  queryString +=`
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  console.log(queryString);
  console.log(`Params : ${queryParams}`);

  return pool.query(queryString, queryParams)
    .then((result) => {
      // console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  return pool
  .query(`
    INSERT INTO properties (
      title, description, number_of_bedrooms, number_of_bathrooms, parking_spaces, cost_per_night, thumbnail_photo_url, cover_photo_url, street, country, city, province, post_code)      
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`, [`%${property.title}%`, `%${property.description}%`, property.number_of_bedrooms, property.number_of_bathrooms, property.parking_spaces, property.cost_per_night, `%${property.thumbnail_photo_url}%`, `%${property.cover_photo_url}%`, `%${property.street}%`, `%${property.country}%`, `%${property.city}%`, `%${property.province}%`, `%${property.post_code}%`])
  .then((result) => {
      if (result){
        console.log(result.rows);
        return Promise.resolve(result);
      }
  })

}
exports.addProperty = addProperty;
