/* eslint-disable camelcase */
import React, { useContext, useCallback } from 'react';
import MailTemplate from './MailTemplate';
import S from './styled';
import Paging from './Paging';
import { AppDisapthContext, AppStateContext } from '../../contexts';
import Loading from '../Loading';
import {
  handleMailClick,
  handleMailsChange,
  initCheckerInTools,
  handleSnackbarState,
} from '../../contexts/reducer';
import useFetch from '../../utils/use-fetch';
import getQueryByOptions from '../../utils/query';
import Tools from './Tools';
import { handleErrorStatus } from '../../utils/error-handler';
import ReadMail from '../ReadMail';
import request from '../../utils/request';
import { getSnackbarState } from '../Snackbar';
import noMailImage from '../../assets/imgs/no-mail.png';

const WASTEBASKET_NAME = '휴지통';

const ACTION = {
  MARK: 'mark',
  DELETE: 'delete',
  READ: 'read',
};

const SNACKBAR_MSG = {
  MAIL_DELETE_FAIL: '업데이트를 실패하였습니다.',
  MAILS_LOAD_FAIL: '메일 리스트 로드를 실패하였습니다.',
};

const convertMailToRead = mail => {
  const { is_important, is_read, MailTemplate, no, reservation_time } = mail;
  const { from, to, subject, text, html, createdAt, no: mailTemplateNo } = MailTemplate;
  return {
    from,
    to,
    subject: subject || '제목없음',
    text,
    html,
    createdAt,
    is_important,
    is_read,
    no,
    mailTemplateNo,
    reservation_time,
  };
};

const loadNewMails = async (query, dispatch) => {
  const { isError, data } = await request.get(`/mail/?${query}`);
  if (isError) {
    dispatch(
      handleSnackbarState({
        snackbarOpen: true,
        snackbarVariant: 'error',
        snackbarContent: SNACKBAR_MSG.MAILS_LOAD_FAIL,
      }),
    );
    return;
  }
  dispatch(handleMailsChange({ ...data }));
};

const updateMail = async (no, props, dispatch) => {
  const { isError } = await request.patch(`/mail/${no}`, { props });
  if (isError) {
    dispatch(
      handleSnackbarState({
        snackbarOpen: true,
        snackbarVariant: 'error',
        snackbarContent: SNACKBAR_MSG.MAIL_UPDATE_FAIL,
      }),
    );
  }
};

const MailArea = () => {
  const { state } = useContext(AppStateContext);
  const { dispatch } = useContext(AppDisapthContext);
  const query = getQueryByOptions(state);
  const URL = `/mail?${query}`;
  const setMailList = useCallback(
    (err, data) => (
      err ? handleErrorStatus(err) : dispatch(initCheckerInTools()),
      dispatch(handleMailsChange({ ...data }))
    ),
    [dispatch],
  );

  const isLoading = useFetch(setMailList, URL);
  if (isLoading) {
    return <Loading />;
  }

  const { mails, paging, categoryNoByName } = state;
  const categories = {};
  Object.entries(categoryNoByName).map(([k, v]) => (categories[v] = k));
  console.log(mails);
  const mailList =
    mails.length > 0 ? (
      mails.map((mail, index) => (
        <MailTemplate
          key={mail.no}
          mail={mail}
          index={index}
          selected={mail.selected}
          categories={categories}
        />
      ))
    ) : (
      <S.NothingMailView>
        <img src={noMailImage} alt="no-mail" />
      </S.NothingMailView>
    );

  const handleMailListAreaClick = async ({ target }) => {
    if (typeof target.className === 'object') {
      target = target.parentNode;
    }

    const { id } = target;
    if (id === '') {
      return;
    }

    const [action, index] = id.split('-');
    const mail = mails[index];

    switch (action) {
      case ACTION.MARK: {
        await updateMail(mail.no, { is_important: !mail.is_important }, dispatch);
        loadNewMails(query, dispatch);
        break;
      }
      case ACTION.DELETE: {
        const wastebasketNo = categoryNoByName[WASTEBASKET_NAME];
        await updateMail(mail.no, { category_no: wastebasketNo }, dispatch);
        loadNewMails(query, dispatch);
        break;
      }
      case ACTION.READ: {
        const mailToRead = convertMailToRead(mail);
        dispatch(handleMailClick(mailToRead, <ReadMail />), dispatch);
        updateMail(mail.no, { is_read: true });
        break;
      }
      default:
        break;
    }
  };

  return (
    <S.MailArea>
      <S.ToolsWrapper>
        <Tools />
      </S.ToolsWrapper>
      <S.MailListArea onClick={handleMailListAreaClick}>{mailList}</S.MailListArea>
      <S.MailPagingArea>
        <Paging paging={paging} />
      </S.MailPagingArea>
    </S.MailArea>
  );
};

export default MailArea;
