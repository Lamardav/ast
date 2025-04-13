import { CompanyFilter } from "api/dto/CompanyFilter.g";
import { CorporateFilter } from "api/dto/CorporateFilter.g";
import { PersonalFilter } from "api/dto/PersonalFilter.g";
import { SearchProfileRequest } from "api/dto/SearchProfileRequest.g";
import { SearchRequest } from "api/dto/SearchRequest.g";
import { VacancyClientFilter } from "api/dto/VacancyClientFilter.g";

export const newSearchPaged = { page: 1, pageSize: 10 };

export const initialTotalFilter = {
  filter: "",
  personalPaged: newSearchPaged,
  corporatePaged: newSearchPaged,
  companyPaged: newSearchPaged,
};

export const initialPersonalFilter = {
  filter: {
    name: "",
    cityId: null,
  },
  sortParamDto: { fieldName: "CreatedUtc", isDesc: true },
  paged: newSearchPaged,
};

export const initialCorporateFilter = {
  filter: {
    personName: "",
    roleName: "",
    companyId: null,
    cityId: null,
  },
  sortParamDto: { fieldName: "CreatedUtc", isDesc: true },
  paged: newSearchPaged,
};

export const initialCompaniesFilter = {
  filter: {
    name: "",
    cityId: null,
  },
  sortParamDto: { fieldName: "CreatedUtc", isDesc: true },
  paged: newSearchPaged,
};

export const initialVacanciesFilter = {
  filter: { pattern: "" },
  sortParamDto: { fieldName: "CreatedUtc", isDesc: true },
  paged: newSearchPaged,
};

export const initialSearchFilter = {
  private: initialPersonalFilter,
  corporate: initialCorporateFilter,
  companies: initialCompaniesFilter,
  vacancies: initialVacanciesFilter,
};

export const debouceTimeOut = 300;
