import React, { FC, useMemo } from "react";
import { useRouteMatch } from "react-router-dom";
import { HeadLayout, ProfileMenuContainer } from "../../common/components/layout/HeadLayout";
import { HorizontalMenu } from "../../common/components/layout/HorizontalMenu";
import { ProfileContentContainer } from "../../common/components/styled/ContentContainer";
import { companyMenuItems } from "../../common/consts/companyMenuItems";
import { AboutCompany } from "./components/aboutCompany/AboutCompany";
import { CompanyInfo } from "./components/infoBlock/CompanyInfo";
import { SelectMenu } from "common/components/layout/SelectMenu";
export const Company = () => {
  const {
    params: { id },
  } = useRouteMatch();
  const menuItems = useMemo(() => companyMenuItems(id), [id]);
  return (
    <>
      <CompanyInfo />
      <ProfileContentContainer>
        <SelectMenu items={menuItems} />
        <HeadLayout OwnContainer={ProfileMenuContainer} hideForTablet>
          <HorizontalMenu items={menuItems} hideForTablet />
        </HeadLayout>
        <AboutCompany />
      </ProfileContentContainer>
    </>
  );
};

// Источник оценки     || Цикломатическая    ||  Когнитивная
// Наша                        -                    1.45
// GrokAI                      1                     6
// Code Metrics                9                     -
// SonarCube                   2                     0
// Потапов                     2                     4
// Шпаков                      -                     3
