/* eslint-disable import/prefer-default-export */
import nodemailer from 'nodemailer';
import DB from '../../database/index';
import U from '../../libraries/mail-util';

const getMailsByOptions = async (userNo, options) => {
  let { category = 0, page = 1, pageNum = 100 } = options;
  category = Number(category);
  page = Number(page);
  pageNum = Number(pageNum);

  const query = {
    userNo,
    category_no: category,
    options: {
      raw: false,
    },
    paging: {
      limit: Number(pageNum),
      offset: (page - 1) * pageNum,
    },
  };
  const mails = await DB.Mail.findAllFilteredMail(query);
  return mails;
};

const saveAttachments = async (attachments, mailTemplateNo, transaction) => {
  const processedAttachments = attachments.map(attachment => {
    const { contentType, name, content } = attachment;
    return { type: contentType, name, content, mail_template_id: mailTemplateNo };
  });

  await DB.Attachment.bulkCreate(processedAttachments, { transaction });
};

const saveMail = async (mailContents, transaction) => {
  const mailTemplateResult = await DB.MailTemplate.create(mailContents, { transaction });
  const mailTemplate = mailTemplateResult.get({ plain: true });
  const user = await DB.User.findOneById(mailContents.from.split('@')[0], { transaction });
  await DB.Mail.create(
    {
      owner: user.no,
      mail_template_id: mailTemplate.no,
    },
    { transaction },
  );
  await saveAttachments(mailContents.attachments, mailTemplate.no, transaction);
};

const sendMail = async mailContents => {
  const transporter = nodemailer.createTransport(U.getTransport());
  await DB.sequelize.transaction(async transaction => await saveMail(mailContents, transaction));
  await transporter.sendMail(mailContents);

  return mailContents;
};

export default { getMailsByOptions, sendMail };
