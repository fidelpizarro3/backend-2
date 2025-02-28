import UserDAO from "../daos/user.dao.js";

class UserRepository {
  async getUserByEmail(email) {
    return await UserDAO.findByEmail(email);
  }

  async getUserById(id) {
    return await UserDAO.findById(id);
  }

  async createUser(userData) {
    return await UserDAO.createUser(userData);
  }
}

export default new UserRepository();
