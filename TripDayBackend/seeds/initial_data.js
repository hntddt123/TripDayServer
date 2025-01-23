exports.seed = function seed(knex) {
  // Deletes ALL existing entries
  return knex('user_accounts').del()
    .then(() => knex('user_accounts').insert([
      {
        email: 'nientaiho@tripday.com',
        provider: 'google',
        provider_user_id: 'hntddt1',
        name: 'Test User',
        username: 'nientaiho',
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
      }
    ]));
};
