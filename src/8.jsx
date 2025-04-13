import { CompanyFilter } from "api/dto/CompanyFilter.g";
import { CorporateFilter } from "api/dto/CorporateFilter.g";
import { PersonalFilter } from "api/dto/PersonalFilter.g";
import { SearchProfileRequest } from "api/dto/SearchProfileRequest.g";
import { SearchRequest } from "api/dto/SearchRequest.g";
import { VacancyClientFilter } from "api/dto/VacancyClientFilter.g";
import { ContactsSearchType } from "common/interfaces/contactsSearchType";
import { vacancyActionsAsync } from "modules/vacancy/vacancyActionsAsync";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { CompanySearch } from "./components/CompanySearch";
import { EmployerSearch } from "./components/EmployerSearch";
import { UserSearch } from "./components/UserSearch";
import { VacancySearch } from "./components/VacancySearch";
import {
  initialSearchFilter,
  initialTotalFilter,
  newSearchPaged,
} from "./consts";
import { contactsActionsAsync } from "./contactsActionsAsync";
import { scrollableTargetId } from "./components/ContactsLayout";


export const useSearchContactFilter = () => {
  const dispatch = useDispatch();

  const [searchType, setSearchType] = useState<ContactsSearchType>(
    ContactsSearchType.all
  );

  const [totalFilter, setTotalFilter] = useState<SearchProfileRequest>(
    initialTotalFilter
  );

  const [filters, setFilters] = useState<SearchFilter>(initialSearchFilter);

  const handleSearch = useCallback((filter) => {
    setTotalFilter({ ...initialTotalFilter, filter });

    setFilters((prevFilter) => ({
      ...prevFilter,
      private: {
        ...prevFilter.private,
        paged: newSearchPaged,
        filter: { ...prevFilter.private.filter, name: filter },
      },
      corporate: {
        ...prevFilter.corporate,
        paged: newSearchPaged,
        filter: { ...prevFilter.corporate.filter, personName: filter },
      },
      companies: {
        ...prevFilter.companies,
        paged: newSearchPaged,
        filter: { ...prevFilter.companies.filter, name: filter },
      },
      vacancies: {
        ...prevFilter.vacancies,
        paged: newSearchPaged,
        filter: { pattern: filter },
      },
    }));
  }, []);

  const handleSearchTypeSet = useCallback(
    (type) => {
      document
        .getElementById(scrollableTargetId)
        ?.scrollTo({ top: 0, behavior: "smooth" });
      setFilters({
        ...initialSearchFilter,
        private: {
          ...initialSearchFilter.private,
          filter: {
            ...initialSearchFilter.private.filter,
            name: totalFilter.filter,
          },
        },
        corporate: {
          ...initialSearchFilter.corporate,
          filter: {
            ...initialSearchFilter.corporate.filter,
            personName: totalFilter.filter,
          },
        },
        companies: {
          ...initialSearchFilter.companies,
          filter: {
            ...initialSearchFilter.companies.filter,
            name: totalFilter.filter,
          },
        },
        vacancies: {
          ...initialSearchFilter.vacancies,
          filter: { pattern: totalFilter.filter },
        },
      });

      setSearchType(type);
    },
    [totalFilter]
  );

  const setFilter = useCallback(
    (filter, type) => {
      if (type === ContactsSearchType.all) {
        return;
      }
      setFilters((prevFilter) => ({
        ...prevFilter,
        [type]: {
          ...prevFilter[type],
          filter: { ...prevFilter[type].filter, ...filter },
        },
      }));
    },
    []
  );

  useEffect(() => {
    if (searchType === ContactsSearchType.all) {
      dispatch(contactsActionsAsync.searchTotal(totalFilter, { abort: true }));
      dispatch(
        vacancyActionsAsync.publicSearch(filters.vacancies, { abort: true })
      );
    }
  }, [dispatch, searchType, totalFilter, filters.vacancies]);

  const filterProps = {
    searchType,
    filters,
    setFilters,
    onHeaderClick: handleSearchTypeSet,
  };

  return {
    handleSearch,
    searchType,
    setSearchType: handleSearchTypeSet,
    setFilter,
    items: {
      [ContactsSearchType.private]: {
        Component: UserSearch,
        props: filterProps,
      },
      [ContactsSearchType.corporate]: {
        Component: EmployerSearch,
        props: filterProps,
      },
      [ContactsSearchType.companies]: {
        Component: CompanySearch,
        props: filterProps,
      },
      [ContactsSearchType.vacancies]: {
        Component: VacancySearch,
        props: filterProps,
      },
    },
  };
};
