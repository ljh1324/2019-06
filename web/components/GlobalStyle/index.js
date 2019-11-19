import styled from 'styled-components';

const FlexWrap = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const FlexCenterWrap = styled(FlexWrap)`
  justify-content: center;
  align-items: center;
  background-color: #f5f6fa;
`;

const FlexRowCenterWrap = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SmallBoard = styled.div`
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #a4b0be;
  border-radius: 15px;
  width: 800px;
`;

const FlexItem = styled(FlexWrap)`
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const HorizontalLine = styled.hr`
  margin-top: 35px;
  width: 300px;
  color: #bdc3c7;
`;

const Header = styled.div`
  flex: 0 0 50px;
  display: flex;
  border-bottom: 2px solid #eceff1;
  flex-direction: row;
  overflow: hidden;
  padding: 5px 10px;
`;

const Content = styled.div`
  flex: 1 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
`;

const Aside = styled.aside`
  display: flex;
  flex-direction: column;
  padding-right: 1rem;
`;

const Section = styled.section`
  flex: 1 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Footer = styled.footer`
  flex: 0 0 30px;
  border-top: 2px solid #e9ecef;
  text-align: center;
`;

export {
  FlexWrap,
  FlexCenterWrap,
  FlexRowCenterWrap,
  FlexItem,
  Header,
  Content,
  Aside,
  Section,
  Footer,
  HorizontalLine,
  SmallBoard,
};
