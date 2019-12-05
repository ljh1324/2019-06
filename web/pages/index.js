import React, { useEffect, useState, useContext } from 'react';
import Router from 'next/router';
import * as GS from '../components/GlobalStyle';
import Aside from '../components/Aside';
import MailArea from '../components/MailArea';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import storage from '../utils/storage';
import MessageSnackbar from '../components/Snackbar';
import { AppDisapthContext, AppStateContext } from '../contexts';
import { setView, handleSnackbarState } from '../contexts/reducer';

const Home = () => {
  const { state } = useContext(AppStateContext);
  const { dispatch } = useContext(AppDisapthContext);
  const [user, setUser] = useState(null);
  const { snackbarOpen, snackbarVariant, snackbarContent } = state;
  const snackbarState = { snackbarOpen, snackbarVariant, snackbarContent };

  useEffect(() => {
    const userData = storage.getUser();
    if (!userData) {
      Router.push('/login');
    } else {
      setUser(userData);
      dispatch(setView(<MailArea />));
    }
  }, [dispatch]);

  const messageSnackbarProps = {
    ...snackbarState,
    snackbarClose: () => dispatch(handleSnackbarState({ snackbarOpen: false })),
  };

  const indexPage = (
    <GS.FlexWrap>
      <Header brand={'Daitnu'} />
      <GS.Content>
        <MessageSnackbar {...messageSnackbarProps} />
        <Aside />
        {state.view}
      </GS.Content>
      <Footer />
    </GS.FlexWrap>
  );
  return user ? indexPage : <Loading full={true} />;
};

export default Home;
