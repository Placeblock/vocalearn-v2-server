let mongodb = require('mongodb');


class Database {
  static connect() {
    const client = new mongodb.MongoClient('mongodb://localhost:27017');
    client.connect();
    this.db = client.db("vocalearn");
  }
}
Database.connect();

module.exports = Database;