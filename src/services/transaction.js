const validationError = require("../errors/validationError");

module.exports = app => {
  const find = (userId, filter = {}) => {
    return app
      .db("transactions")
      .join("accounts", "accounts.id", "acc_id")
      .where(filter)
      .andWhere("accounts.user_id", "=", userId)
      .select();
  };

  const findOne = filter => {
    return app
      .db("transactions")
      .where(filter)
      .first();
  };

  const save = transaction => {
    if (!transaction.description)
      throw new validationError("Descrição é um atributo obrigatório");
    if (!transaction.ammount)
      throw new validationError("Valor é um atributo obrigatório");
    if (!transaction.date)
      throw new validationError("Data é um atributo obrigatório");
    if (!transaction.acc_id)
      throw new validationError("Conta é um atributo obrigatório");
    if (!transaction.type)
      throw new validationError("Tipo é um atributo obrigatório");
    if (!(transaction.type === "I" || transaction.type === "O"))
      throw new validationError("Tipo inválido");

    const newTransaction = { ...transaction };
    if (
      (transaction.type === "I" && transaction.ammount < 0) ||
      (transaction.type === "O" && transaction.ammount > 0)
    ) {
      newTransaction.ammount *= -1;
    }

    return app.db("transactions").insert(newTransaction, "*");
  };

  const update = (id, transaction) => {
    return app
      .db("transactions")
      .where({ id })
      .update(transaction, "*");
  };

  const remove = id => {
    return app
      .db("transactions")
      .where({ id })
      .del();
  };

  return { find, findOne, save, update, remove };
};
