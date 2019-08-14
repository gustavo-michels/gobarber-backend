import Router from 'express';
import User from './app/models/User';

const routes = new Router();

routes.get('/', async (req, res) => {
  const user = await User.create({
    name: 'Gustavo Henrique Michels',
    email: 'ghmichels@gmail.com',
    password_hash: 'a1s6d51a6s5d1a6s5d1',
  });

  return res.json(user);
});

export default routes;
