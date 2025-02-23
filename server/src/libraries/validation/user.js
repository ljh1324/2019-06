import DB from '../../database';
import getErrorResponseBySequelizeValidationError from '../exception/sequelize-error-parser';

const join = async body => {
  if (body.name) {
    body.name = body.name.trim();
  }

  try {
    await DB.User.build(body).validate();
  } catch (error) {
    throw getErrorResponseBySequelizeValidationError(error);
  }

  return true;
};

export default { join };
