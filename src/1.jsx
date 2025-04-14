import React from "react";
import styled from "styled-components";

const Container = styled.div`
  background-color: #f0f0f0;
  padding: 20px;
`;

const Title = styled.h1`
  color: #333;
`;

const ButtonCommon = styled.button`
  background-color: #008cba;
  color: #fff;
  border: none;
  padding: 10px 20px;
  cursor: pointer;

  &:hover {
    background-color: #005f5f;
  }
`;

const MyComponent = () => {
  return (
    <Container>
      <Title>Привет, мир!</Title>
      <ButtonCommon>Нажми меня</ButtonCommon>
    </Container>
  );
};

export default MyComponent;

// Источник оценки     || Цикломатическая    ||  Когнитивная
// Наша                        -                   1.3
// GrokAI                      1                    0
// Code Metrics                5                    -
// SonarCube                   1                    0
// Потапов                     0                    1
