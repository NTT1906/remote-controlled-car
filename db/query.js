const { text } = require("body-parser");
const db = require("./database");
const { PreparedStatement } = require('pg-promise');

async function getUserByUsername(username) {
  const prepareGetUser = new PreparedStatement({
    name: 'prepare-get-user',
    text: 'SELECT * FROM users WHERE username = $1',
    values: [username]
  });

  var user = await db.oneOrNone(prepareGetUser);
  if (!user) return undefined; 
  return user;
}

async function getUserByEmail(email) {
  const prepareGetUserByEmail = new PreparedStatement({
    name: 'prepare-get-user-by-email',
    text: 'SELECT * FROM users WHERE email = $1',
    values: [email]
  });

  var user = await db.oneOrNone(prepareGetUserByEmail);
  if (!user) return undefined; 
  return user;
}

async function addUser(email, username, password) {
  const prepareAddUser = new PreparedStatement({
    name: 'prepare-add-user',
    text: 'INSERT INTO users(username, password, email) VALUES($1, $2, $3)',
    values: [username, password, email]
  });

  try {
    await db.none(prepareAddUser);
  } catch (error) {
    return `Cannot register: ${error}`;
  }

  return "Successfully creates a new account!!!";
}

async function getUserImages(userId) {
  if (typeof(userId) !== 'string') {
    return 'Invalid user id data type';
  }
  const prepareGetUserImages = new PreparedStatement({
    name: 'prepare-get-user-images',
    text: `SELECT IMGS.*
           FROM img_storage IMGS JOIN users U
           ON IMGS.user_id = U.id AND U.id = $1;`,
    values: [userId]
  });

  try {
    const images = await db.manyOrNone(prepareGetUserImages);
    return images;
  } catch (error) {
    return `Error geting users image: ${error}`;
  }
}

async function addUserImage(userId, url, name) {
  if (typeof(userId) !== 'string' || typeof(url) !== 'string' 
                                  || typeof(name) !== 'string') {
    return 'Invalid data type';
  }
  const prepareAddUserImage = new PreparedStatement({
    name: 'prepare-add-user-image',
    text: `INSERT INTO img_storage(name,url,user_id) 
           VALUES($1, $2, $3);`,
    values: [name, url, userId]
  });

  try {
    console.log(`Adding image URL ${url} with name ${name} and userId=${userId}`);
    await db.none(prepareAddUserImage);
  } catch (error) {
    return `Error adding user's image: ${error}`;
  }

  return `Successfully add new image for user id ${userId}`;
}

module.exports = {
  getUserByUsername,
  getUserByEmail,
  addUser,
  getUserImages,
  addUserImage
};