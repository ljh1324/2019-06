import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/IndexLayout';
import MailArea from '../components/MailArea';
import WriteMailToMe from '../components/WriteMailToMe';
import WriteMail from '../components/WriteMail';
import ReadMail from '../components/ReadMail';

const VIEW_COMPONENT = {
  'WRITE-TO-ME': <WriteMailToMe />,
  WRITE: <WriteMail />,
  READ: <ReadMail />,
  SEARCH: <MailArea />,
  LIST: <MailArea />,
};
const IndexPage = () => {
  const router = useRouter();
  const { query } = router;
  let { view } = query;

  if (view) {
    view = view.toUpperCase();
  }
  const renderView = VIEW_COMPONENT[view] || <MailArea />;

  return <Layout>{renderView}</Layout>;
};

export default IndexPage;
