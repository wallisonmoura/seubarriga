const request = require("supertest");
const jwt = require("jwt-simple");
const app = require("../../src/app");

const MAIN_ROUTE = "/v1/users";
const mail = `${Date.now()}@mail.com`;
let user;

beforeAll(async () => {
  const res = await app.services.user.save({
    name: "User Account",
    mail: `${Date.now()}@mail.com`,
    passwd: "123456"
  });
  user = { ...res[0] };
  user.token = jwt.encode(user, "Segredo!");
});

test("Deve listar todos os usuários", () => {
  return request(app)
    .get(MAIN_ROUTE)
    .set("authorization", `bearer ${user.token}`)
    .then(res => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test("Deve inserir um usuário com sucesso", () => {
  return request(app)
    .post(MAIN_ROUTE)
    .send({ name: "Beto Aguiar", mail, passwd: "123456" })
    .set("authorization", `bearer ${user.token}`)
    .then(res => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Beto Aguiar");
      expect(res.body).not.toHaveProperty("passwd");
    });
});

test("Deve armazenar senha criptografada", async () => {
  const res = await request(app)
    .post(MAIN_ROUTE)
    .send({
      name: "Beto Aguiar",
      mail: `${Date.now()}@mail.com`,
      passwd: "123456"
    })
    .set("authorization", `bearer ${user.token}`);
  expect(res.status).toBe(201);

  const { id } = res.body;
  const userDB = await app.services.user.findOne({ id });
  expect(userDB.passwd).not.toBeUndefined();
  expect(userDB.passwd).not.toBe("123456");
});

//Por esse metodo nao esquecer de retornar
test("Nao deve inserir usuário sem nome", () => {
  return request(app)
    .post(MAIN_ROUTE)
    .send({ mail: "wm@mail.com", passwd: "123456" })
    .set("authorization", `bearer ${user.token}`)
    .then(res => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Nome é um atributo obrigatório!");
    });
});

//Por esse metodo o async await tem que esta presente
test("Não deve inserir usuário sem email", async () => {
  const result = await request(app)
    .post(MAIN_ROUTE)
    .send({ name: "Beto Aguiar", passwd: "123456" })
    .set("authorization", `bearer ${user.token}`);
  expect(result.status).toBe(400);
  expect(result.body.error).toBe("Email é um atributo obrigatório!");
});

//Nessa não esquecer do done e do catch em caso de erro
test("Não deve inserir usuário sem senha", done => {
  request(app)
    .post(MAIN_ROUTE)
    .send({ name: "Beto Aguiar", mail: "wm@mail.com" })
    .set("authorization", `bearer ${user.token}`)
    .then(res => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Senha é um atributo obrigatório!");
      done();
    })
    .catch(err => done.fail(err));
});

test("Não deve inserir usuário com email existente", () => {
  return request(app)
    .post(MAIN_ROUTE)
    .send({ name: "Beto Aguiar", mail, passwd: "123456" })
    .set("authorization", `bearer ${user.token}`)
    .then(res => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Já existe um usuário com esse email");
    });
});
