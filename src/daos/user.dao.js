import userModel from "../models/users.model.js";

class UserDAO {
  async findByEmail(email) {
    return await userModel.findOne({ email });
  }

  async findById(id) {
    return await userModel.findById(id);
  }

  async createUser(userData) {
    return await userModel.create(userData);
  }
}

export default new UserDAO();
