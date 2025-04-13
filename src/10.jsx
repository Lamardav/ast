import { DateHelper, DateStringFormats } from "common/helpers/dateHelper";
import { IMessengerUser } from "common/interfaces/tempMessage";
import styled from "styled-components";


export const MessageInfo = ({
  sender,
  showMessageTime,
  timestamp,
  isMine,
  showSender,
}) => {
  if (showMessageTime) {
    const prettyTimestamp = DateHelper.dateFromFormat(
      timestamp,
      DateStringFormats.time
    );

    const infoText = isMine
      ? prettyTimestamp
      : showSender
      ? (sender?.name || "") + ", " + prettyTimestamp
      : prettyTimestamp;

    return <Container>{infoText}</Container>;
  } else {
    return null;
  }
};

const Container = styled.div`
  font-size: 12px;
  line-height: 20px;
  color: #83888b;
`;
