import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import { Map, Placemark, YMaps } from "react-yandex-maps";
import styled from "styled-components";
import { lang } from "../../../../public/locales/lang";
import { IconCar } from "../../../assets/icon/iconCar";
import { IconTrain } from "../../../assets/icon/iconTrain";
import { IconTrainSimple } from "../../../assets/icon/iconTrainSimple";
import { IconSubway } from "../../../assets/icon/iconSubway";
import { theme } from "../../../assets/theme/theme";
import { ContainerContent } from "../../../components/containers/containerContent";
import { ITransportData } from "./interfaces/academyContacts";


export const AcademyContactsMap = (props) => {
  const initialCoords = (props.transportData?.find((data) => data.Type === "stadium")
    ? props.transportData?.find((data) => data.Type === "stadium")?.coords
    : props.transportData?.[0].coords) || { x: 55.804833, y: 37.69872 };

  const { locale = "ru" } = useRouter();
  const [active, setActive] = useState("stadium");
  const [coordinate, setCoordinate] = useState(Object.values(initialCoords).map(Number));
  const mapState = { center: coordinate, zoom: 16, behaviors: ["default", "scrollZoom"] };

  const setActiveCoordinate = (key) => {
    const coords = props.transportData?.find((elem) => elem.Type === key)?.coords;
    setActive(key);
    coords && setCoordinate(Object.values(coords).map(Number));
  };

  const buttons = useMemo(
    () =>
      props.transportData?.map(
        (data) =>
          data.Type !== "stadium" && (
            <Pointer active={active === data.Type} key={data.Type} onClick={() => setActiveCoordinate(data.Type)}>
              {getIcon(data.Type)}
              <span>{lang[locale].pageHowToGet.transportKinds[data.Type]}</span>
            </Pointer>
          )
      ),
    [active, locale]
  );

  const getPointData = (index) => {
    return {
      balloonContentBody: "placemark <strong>balloon " + index + "</strong>",
      clusterCaption: "placemark <strong>" + index + " </strong>",
    };
  };

  const getPointOptions = () => {
    return {
      preset: "islands#redIcon",
    };
  };

  return (
    <>
      <MapContainer>
        <YMaps>
          <StyledMap state={mapState} modules={["multiRouter.MultiRoute"]}>
            <Placemark properties={getPointData(coordinate)} geometry={coordinate} options={getPointOptions()} />
          </StyledMap>
        </YMaps>
      </MapContainer>
      <PointerContainer visible={props.hasPointerContainer}>{buttons}</PointerContainer>
    </>
  );
};

const getIcon = (type) => {
  switch (type) {
    case "train":
      return <IconTrain />;
    case "car":
      return <IconCar />;
    case "trainSimple":
      return <IconTrainSimple />;
    case "subway":
      return <IconSubway />;
    default:
      return null;
  }
};

const MapContainer = styled.article`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: auto;
  height: 31.25vw;

  @media screen and (max-width: ${theme.rubberSize.desktop}) {
    height: 65.19vw;
  }

  @media screen and (max-width: ${theme.rubberSize.tablet}) {
    height: 64vw;
  }
`;

const StyledMap = styled(Map)`
  height: 100%;
`;

const PointerContainer = styled(ContainerContent)<{ visible }>`
  justify-content: start;
  gap: 1.25vw;
  padding: 2.08vw 0 0;
  display: ${({ visible }) => (visible ? "flex" : "none")};
  @media screen and (max-width: ${theme.rubberSize.desktop}) {
    padding: 3.13vw 0 0;
    gap: 3.13vw;
    overflow: auto;

    ::-webkit-scrollbar {
      display: none;
    }
  }
  @media screen and (max-width: ${theme.rubberSize.tablet}) {
    padding: 6.4vw 0 0;
    gap: 6.4vw;
  }
`;
const Pointer = styled.p<{ active: boolean }>`
  background-color: ${({ active, theme }) => (active ? theme.colors.white_whiteGray : "transparent")};
  cursor: pointer;
  display: flex;
  white-space: nowrap;
  justify-content: center;
  align-items: center;
  color: ${({ active, ...props }) => (active ? theme.colors.red : props.theme.colors.white_black)};
  border: 1px solid ${({ active, theme }) => (active ? theme.colors.white_red : theme.colors.white_black)};
  margin: 0;
  font-family: "FCSM Text", sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 50px;
  font-size: 0.73vw;
  padding: 0 1.2vw;

  @media screen and (max-width: ${theme.rubberSize.desktop}) {
    font-size: 1.83vw;
    padding: 0 3vw;
  }
  @media screen and (max-width: ${theme.rubberSize.tablet}) {
    font-size: 3.73vw;
    padding: 0 6.13vw;
  }

  svg {
    path {
      stroke: ${({ active, ...props }) => (active ? theme.colors.red : props.theme.colors.white_black)};
    }
  }

  span {
    padding: 0.63vw 0 0.63vw 0.42vw;
    @media screen and (max-width: ${theme.rubberSize.desktop}) {
      padding: 1.56vw 0 1.56vw 1.04vw;
    }
    @media screen and (max-width: ${theme.rubberSize.tablet}) {
      padding: 3.2vw 0 3.2vw 2.13vw;
    }
  }
`;


// Источник оценки     || Цикломатическая    ||  Когнитивная
// Наша                        -                   25.38
// GrokAI                      8                    12
// Code Metrics                24                   -
// SonarCube                   -                   -
// Потапов                     -                   28
// https://spartak.com/academy/contacts