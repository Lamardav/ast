import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { ContactFilter } from "../../api/dto/ContactFilter.g";
import { ProfileSearchDto } from "../../api/dto/ProfileSearchDto.g";
import { ProfileType } from "../../api/dto/ProfileType.g";
import { SearchRequest } from "../../api/dto/SearchRequest.g";
import { Contact } from "../../common/components/contacts/Contact";
import { Search } from "../../common/components/ui/Search";
import { ContactActionType } from "../../common/interfaces/contactActionType";
import { ContactsSearchType } from "../../common/interfaces/contactsSearchType";
import { ContactsFilter } from "./components/ContactsFilter";
import { ContactsLayout } from "./components/ContactsLayout";
import { ContactsSearchList } from "./components/ContactsSearchList";
import { contactsActionsAsync } from "./contactsActionsAsync";
import { contactsSelectors } from "./contactsSelectors";

const initialPaged = { page: 1, pageSize: 10 };

const initialFilter = {
  filter: { pattern: "", type: null },
  paged: initialPaged,
  sortParamDto: { fieldName: "FirstName", isDesc: false },
};

export const MyContacts = () => {
  const [request, setRequest] = useState<SearchRequest<ContactFilter>>(
    initialFilter
  );

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const contacts = useSelector(contactsSelectors.myContacts);
  const isLoading = useSelector(contactsSelectors.isLoading);

  const [searchType, setSearchType] = useState<ContactsSearchType>(
    ContactsSearchType.all
  );

  const handleSearch = useCallback(
    (pattern) => {
      setRequest({
        ...request,
        filter: { ...request.filter, pattern },
        paged: initialPaged,
      });
    },
    [setRequest, request]
  );

  useEffect(() => {
    dispatch(contactsActionsAsync.myContacts(request));
  }, [dispatch, request]);

  const removeFromContacts = useCallback(
    (contact) => {
      dispatch(contactsActionsAsync.deleteContactFromSearch(contact));
    },
    [dispatch]
  );

  const loadMore = useCallback(() => {
    setRequest({
      ...request,
      paged: { ...request.paged, page: request.paged.page + 1 },
    });
  }, [setRequest, request]);

  const onSearchTypeChange = useCallback(
    (nextSearchType) => {
      setSearchType(nextSearchType);
      switch (nextSearchType) {
        case ContactsSearchType.private: {
          setRequest({
            ...request,
            paged: initialPaged,
            filter: { ...request.filter, type: ProfileType.Personal },
          });
          break;
        }
        case ContactsSearchType.corporate: {
          setRequest({
            ...request,
            paged: initialPaged,
            filter: { ...request.filter, type: ProfileType.Corporate },
          });
          break;
        }
        case ContactsSearchType.all: {
          setRequest({
            ...request,
            paged: initialPaged,
            filter: { ...request.filter, type: null },
          });
          break;
        }
        default:
          break;
      }
    },
    [request]
  );

  const renderItem = useCallback(
    (item) => {
      return (
        <Contact
          key={item.id}
          contact={item}
          onButtonClick={removeFromContacts}
          actionType={ContactActionType.addRemove}
        />
      );
    },
    [removeFromContacts]
  );

  return (
    <ContactsLayout>
      <Container>
        <Search onSearch={handleSearch} />

        <ContactsSearchList
          data={contacts.items}
          renderItem={renderItem}
          paged={request.paged}
          isLoading={isLoading}
          searchType={searchType}
          selectedSearchType={searchType}
          onLoadMore={loadMore}
          showHeader={false}
          emptyText={t("infoBlock.noContacts")}
          showAllData={true}
        />
      </Container>

      <ContactsFilter
        searchType={searchType}
        setSearchType={onSearchTypeChange}
        isMyContacts={true}
      />
    </ContactsLayout>
  );
};

const Container = styled.div`
  width: 100%;
  max-width: 644px;

  background: white;
  box-shadow: 0 2px 10px rgba(95, 127, 134, 0.1);
  border-radius: 8px;
  margin: 0 24px 24px 0;
  height: max-content;

  @media only screen and (max-width: 767px) {
    max-width: initial;
    margin: 0px;
  }
`;
