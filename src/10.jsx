import { DateHelper, DateStringFormats } from "common/helpers/dateHelper";
import { IMessengerUser } from "common/interfaces/tempMessage";
import styled from "styled-components";

export const MessageInfo = ({ sender, showMessageTime, timestamp, isMine, showSender }) => {
  if (showMessageTime) {
    const prettyTimestamp = DateHelper.dateFromFormat(timestamp, DateStringFormats.time);

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
// Источник оценки     || Цикломатическая    ||  Когнитивная
// Наша                        -                   5.98
// GrokAI                      3                    3
// Code Metrics                8                   -
// SonarCube                   7                    5
// Потапов                     -                   5
