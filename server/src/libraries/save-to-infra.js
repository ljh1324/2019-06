import Imap from 'imap';
import ErrorField from './exception/error-field';
import ErrorResponse from './exception/error-response';
import ERROR_CODE from './exception/error-code';
import U from './mail-util';

const { DEFAULT_DOMAIN_NAME, IMAP_PORT } = process.env;
const EXP_EXTRACT_RECEIVER = /<.{3,40}@.{3,40}>/;
const PREFIX = '';

const getImap = ({ email, password }) => {
  return new Imap({
    user: email,
    password,
    host: `mail.${DEFAULT_DOMAIN_NAME}`,
    port: IMAP_PORT,
    tls: true,
  });
};

const connectImap = ({ email, password }, callback) => {
  const imap = getImap({ email, password });

  imap.once('ready', () => {
    callback(imap);
  });

  imap.once('error', err => {
    throw err;
  });

  imap.connect();
};

const getRawBoxes = imap =>
  new Promise((resolve, reject) => {
    imap.getBoxes((err, box) => {
      if (err) reject(err);
      resolve(Object.keys(box));
    });
  });

export const getImapMessageIds = ({ user }) => {
  const { email, password } = user;
  const messages = {};
  connectImap({ email, password }, async imap => {
    const imapBoxes = await getRawBoxes(imap);
    const gatheringMessageIds = (boxes, i) =>
      new Promise((resolve, reject) => {
        if (boxes.length === i) {
          return resolve(messages);
        }

        imap.openBox(boxes[i], true, (openErr, box) => {
          if (openErr) reject(openErr);
          messages[boxes[i]] = [];
          if (box.messages.total === 0) {
            return resolve(gatheringMessageIds(boxes, i + 1));
          }
          const f = imap.seq.fetch('1:*', {
            bodies: 'HEADER.FIELDS (MESSAGE-ID)',
            struct: true,
          });
          f.on('message', msg => {
            msg.on('body', stream => {
              let buffer = '';
              stream.on('data', chunk => {
                buffer += chunk.toString('utf8');
              });
              stream.once('end', () => {
                const messageIdValue = buffer
                  .trim()
                  .split(':')[1]
                  .trim();
                const realId = EXP_EXTRACT_RECEIVER.exec(messageIdValue);
                if (realId) {
                  messages[boxes[i]].push(realId[0].slice(1, -1));
                } else {
                  messages[boxes[i]].push(messageIdValue);
                }
              });
            });
          });
          f.once('error', fetchErr => {
            console.log(`Fetch error: ${fetchErr}`);
            reject(fetchErr);
          });
          f.once('end', () => {
            return resolve(gatheringMessageIds(boxes, i + 1));
          });
        });
      });
    const messageIds = await gatheringMessageIds(imapBoxes, 0);
    console.log(messageIds);
    console.log(imapBoxes);
    imap.end();
  });
};

export const moveMail = ({ user, originBoxName, targetBoxName, searchArgs }) => {
  if (originBoxName === '받은메일함') {
    originBoxName = 'INBOX';
  }
  connectImap(user, imap => {
    imap.openBox(originBoxName, true, openErr => {
      if (openErr) {
        const errorField = new ErrorField('mailBox', originBoxName, '존재하지 않는 메일함입니다');
        throw new ErrorResponse(ERROR_CODE.MAILBOX_NOT_FOUND, errorField);
      }
      imap.search(U.makeSearchArgs(searchArgs), (searchErr, results) => {
        if (searchErr) {
          const errorField = new ErrorField('message-id', searchArgs, '메일 검색에 실패하였습니다');
          throw new ErrorResponse(ERROR_CODE.MAIL_NOT_FOUND, errorField);
        }
        imap.move(results, targetBoxName, moveErr => {
          if (moveErr) {
            const errorField = new ErrorField(
              'mailBox',
              targetBoxName,
              '메일 이동에 실패하였습니다',
            );
            throw new ErrorResponse(ERROR_CODE.FAIL_TO_MOVE_MAIL, errorField);
          }
          imap.end();
        });
      });
    });
  });
};

export const saveToMailbox = ({ user, msg, mailboxName }) => {
  connectImap(user, imap => {
    imap.append(msg.toString(), { mailbox: PREFIX + mailboxName }, err => {
      if (err) {
        const errorField = new ErrorField('mailBox', mailboxName, '존재하지 않는 메일함입니다');
        throw new ErrorResponse(ERROR_CODE.MAILBOX_NOT_FOUND, errorField);
      }
      imap.end();
    });
  });
};

export const addMailBox = ({ user, name }) => {
  connectImap(user, imap => {
    imap.addBox(PREFIX + name, err => {
      if (err) {
        const errorField = new ErrorField('mailBox', name, '존재하지 않는 메일함입니다');
        throw new ErrorResponse(ERROR_CODE.MAILBOX_NOT_FOUND, errorField);
      }
      imap.end();
    });
  });
};

export const renameMailBox = ({ user, oldName, newName }) => {
  connectImap(user, imap => {
    imap.renameBox(PREFIX + oldName, PREFIX + newName, err => {
      if (err) {
        const errorField = new ErrorField('mailBox', oldName, '존재하지 않는 메일함입니다');
        throw new ErrorResponse(ERROR_CODE.MAILBOX_NOT_FOUND, errorField);
      }
      imap.end();
    });
  });
};

export const deleteMailBox = ({ user, name }) => {
  connectImap(user, imap => {
    imap.delBox(PREFIX + name, err => {
      if (err) {
        const errorField = new ErrorField('mailBox', name, '존재하지 않는 메일함입니다');
        throw new ErrorResponse(ERROR_CODE.MAILBOX_NOT_FOUND, errorField);
      }
      imap.end();
    });
  });
};
