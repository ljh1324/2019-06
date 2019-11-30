import React, { useState } from 'react';
import moment from 'moment';
import { Modal, Backdrop, Fade, FormControl, Select, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { useStateForWM, useDispatchForWM } from '../ContextProvider';
import { RESERVATION_MODAL_OFF, UPDATE_DATE } from '../ContextProvider/reducer/action-type';
import createArray from '../../../utils/create-array';
import { formatDateForReservationTimePicker } from '../../../utils/format';
import validator from '../../../utils/validator';
import { ERROR_CANNOT_RESERVATION } from '../../../utils/error-message';
import S from './styled';

const useStyles = makeStyles(theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '100%',
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  formControl: {
    display: 'flex',
    flexDirection: 'row',
  },
  selectBox: {
    flexGrow: 1,
    margin: '5px',
  },
}));

const hours = createArray(24).map((_, index) => <MenuItem value={index}>{index}시</MenuItem>);
const minutes = createArray(4).map((_, index) => (
  <MenuItem value={index * 15}>{index * 15}분</MenuItem>
));

const ReservationTimePicker = () => {
  const classes = useStyles();
  const rootRef = React.useRef(null);
  const [date, setDate] = useState(moment());
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [error, setError] = useState('');

  const { reservationModalOn } = useStateForWM();
  const dispatch = useDispatchForWM();

  const handleSubmit = e => {
    e.preventDefault();

    const reservationDate = moment(date);
    reservationDate.set({
      hour,
      minute,
    });

    if (!validator.canReservation(reservationDate)) {
      setError(ERROR_CANNOT_RESERVATION);
      return;
    }

    dispatch({
      type: UPDATE_DATE,
      payload: { date: reservationDate },
    });
  };

  const handleClose = e => {
    e.preventDefault();
    dispatch({ type: RESERVATION_MODAL_OFF });
  };

  return (
    <div className={classes.root} ref={rootRef}>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={reservationModalOn}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}>
        <Fade in={reservationModalOn}>
          <div className={classes.paper}>
            <S.InputForm autoComplete="off">
              <S.Title>날짜 및 시간 선택</S.Title>
              <S.RowContainer>
                <MuiPickersUtilsProvider utils={MomentUtils} locale="ko">
                  <DatePicker
                    autoOk
                    orientation="portrait"
                    variant="static"
                    openTo="date"
                    disablePast={true}
                    value={date}
                    onChange={setDate}
                  />
                </MuiPickersUtilsProvider>
                <S.ColumnContainer>
                  <S.Text>{formatDateForReservationTimePicker(date)}</S.Text>
                  <FormControl className={classes.formControl}>
                    <Select
                      value={hour}
                      onChange={({ target: { value } }) => setHour(value)}
                      displayEmpty
                      className={classes.selectBox}>
                      {hours}
                    </Select>
                    <Select
                      value={minute}
                      onChange={({ target: { value } }) => setMinute(value)}
                      displayEmpty
                      className={classes.selectBox}>
                      {minutes}
                    </Select>
                  </FormControl>
                  <S.ErrorText>{error}</S.ErrorText>
                </S.ColumnContainer>
              </S.RowContainer>
              <S.ButtonContainer>
                <S.WhiteButton className="submit-btn max-width" onClick={handleClose}>
                  취소
                </S.WhiteButton>
                <S.Button className="submit-btn max-width" onClick={handleSubmit}>
                  확인
                </S.Button>
              </S.ButtonContainer>
            </S.InputForm>
          </div>
        </Fade>
      </Modal>
    </div>
  );
};

export default ReservationTimePicker;
