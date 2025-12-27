import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

/**
 * User Model for MongoDB
 */
class User {
  constructor() {
    this.collectionName = "users";
  }

  getCollection() {
    const db = getDB();
    return db.collection(this.collectionName);
  }

  async create(userData) {
    const collection = this.getCollection();
    const newUser = {
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password,
      role: userData.role,
      organizationName: userData.organizationName || null,
      registrationNumber: userData.registrationNumber || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await collection.insertOne(newUser);
    return { _id: result.insertedId, ...newUser };
  }

  async findByEmail(email) {
    const collection = this.getCollection();
    return await collection.findOne({ email: email.toLowerCase() });
  }

  async findById(id) {
    const collection = this.getCollection();
    try {
      return await collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      return null;
    }
  }

  async updateById(id, updateData) {
    const collection = this.getCollection();
    try {
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      return false;
    }
  }

  async deleteById(id) {
    const collection = this.getCollection();
    try {
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      return false;
    }
  }

  async findAll(filter = {}, skip = 0, limit = 50) {
    const collection = this.getCollection();
    return await collection.find(filter).skip(skip).limit(limit).toArray();
  }

  async findByRole(role) {
    const collection = this.getCollection();
    return await collection.find({ role }).toArray();
  }
}

export default new User();
