/* eslint-disable no-undef */
import should from 'should';
import DB from '../../src/database';

describe('MailTemplate DB test...', () => {
  before(async () => {
    await DB.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await DB.sequelize.sync({ force: true });
    await DB.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  it('create test', async () => {
    const body = {
      from: 'daitnu@daitnu.com',
      to: 'daitne@daitnu.com',
      title: 'db test',
      subject: 'subject',
      tmp: '그냥 만들어봄 ㅎ.ㅎ',
      text: '바디입니다.',
    };

    const result = await DB.MailTemplate.create({ ...body });
    const data = result.get({ plain: true });
    data.should.be.properties({
      from: 'daitnu@daitnu.com',
      to: 'daitne@daitnu.com',
      subject: 'subject',
      text: '바디입니다.',
    });
  });

  it('제목과 내용이 없어도 create 가능..!', async () => {
    const body = {
      from: 'daitnu@daitnu.com',
      to: 'daitne@daitnu.com',
      title: 'db test',
      subject: '',
      text: '',
    };

    const result = await DB.MailTemplate.create({ ...body });
    const data = result.get({ plain: true });
    data.should.be.properties({
      from: 'daitnu@daitnu.com',
      to: 'daitne@daitnu.com',
      subject: '',
      text: '',
    });
  });

  it('select test', async () => {
    const result = await DB.MailTemplate.findByPk(1, { raw: true });
    result.should.have.keys('from', 'to', 'subject', 'text');
  });
});
