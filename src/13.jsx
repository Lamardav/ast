import React, { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, DatePicker, Divider, Drawer, Form, Input, Radio, Select, Upload, Typography } from "antd";
import TextArea from "antd/es/input/TextArea";
import {
  addNotificationAwait,
  updateNotificationAwait,
  addFileForPushNotificationAwait
} from "../../../store/asyncActions/customers/notificationsAwait";
import { useActions } from "../../../common/helpers/useActions";
import { FormLinksItem } from "../../../common/components/FormLinksItem";
import moment from "moment";
import { validateDateByUtc, validationDate } from "../../../common/helpers/commonValidators/validationDate";
import { selectProps } from "../../../common/helpers/customMulti";

import styled from "styled-components";
import { validationCsvFiles } from "../../../common/helpers/commonValidators/validationCsvFiles";
import { UploadOutlined } from "@ant-design/icons";
import { UploadChangeParam } from "antd/es/upload/interface";
import { RadioChangeEvent } from "antd/es";
import { IUseGroupMunicipalitiesResponse, useGroupMunicipalities } from "../../referencesComponents/groups/hooks/useGroupMunicipalities";
import { SelectGroupMunicipalities } from "../../referencesComponents/groups/usageGroups/SelectGroupMunicipalities";
import { GroupMunicipalityForm } from "../../referencesComponents/groups/GroupMunicipalityForm";



const osOptions = [
  { label: "Android", value: "Android" },
  { label: "IOS", value: "IOS" },
  { label: "Huawei", value: "Huawei" }
];

const actionCreator = {
  addNotificationAwait,
  addFileForPushNotificationAwait,
  updateNotificationAwait
};
const getOsRules = (flag) => {
  if (flag !== "file") {
    return [{ required: true, message: "Обязательное поле." }];
  } else {
    return undefined;
  }
};

const getISOStringByMSCUtc = (date) => {
  //@ts-ignore
  const time = new Date(date);
  time.setSeconds(0);
  time.setTime(time.getTime() - 3 * 60 * 60 * 1000 - time.getTimezoneOffset() * 60 * 1000);

  return time.toISOString();
};

const getInitRadioButtonValue = (notif) => {
  if (notif && notif.tpsRegions === true) {
    return "isTpsRegions";
  } else if (notif && notif.tpsRegions === false) {
    if (notif.municipality && notif.municipality.length > 0) {
      return "isCheckedRegions";
    } else if (notif.municipality && notif.municipality.length > 0) {
      return "isCheckedRegions";
    } else if (notif.municipality && notif.municipality.length === 0) {
      return "isNoRegions";
    }
  } else if (!notif || notif === null) {
    return "isNoRegions";
  }

  return "isNoRegions";
};

// eslint-disable-next-line complexity
export const NotificationForm = ({ notification, onClose, allMunicipalities }) => {
  const [value, setValue] = useState([]);
  const [considerMunicipalityTimezone, setConsiderMunicipalityTimezone] = useState<boolean>(
    notification?.considerMunicipalityTimezone === true ? true : false
  );
  const [linkItemValue, setLinkValue] = useState<{ typeLink: string, linkValue: string } | {}>({});
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [activeMunicipalitesRadio, setActiveMunicipalitesRadio] = useState("isNoRegions");
  const [form] = Form.useForm();
  const [uploadedFiles, setUploadedFiles] = useState();
  const [isPushFromFileOrParametres, setIsPushFromFileOrParametres] = useState<"file" | "parametres" | null>(null);
  const {
    formUpdateGroupMunicipalitiesDrawer,
    groupMunicipalitiesForUpdate,
    groupMunicipalitiesOptions,
    handleSelectGroupMunicipalities,
    setFormUpdateGroupMunicipalitiesDrawer,
    setGroupMunicipalitiesForUpdate
  } = useGroupMunicipalities();

  useEffect(() => {
    if (notification) {
      setActiveMunicipalitesRadio(getInitRadioButtonValue(notification));
      setConsiderMunicipalityTimezone(notification?.considerMunicipalityTimezone);
    }
  }, [notification]);

  useEffect(() => {
    setActiveMunicipalitesRadio(getInitRadioButtonValue(notification));
    if (notification && notification.id) {
      form.setFieldsValue(notification);
    }
    if (notification && notification.municipality && notification.municipality.length > 0) {
      form.setFieldValue(
        "municipality",
        notification.municipality.map((mun) => mun.municipalityId)
      );
    }
  }, [notification]);

  useEffect(() => {
    if (notification?.type === "Push") {
      setIsPushFromFileOrParametres("parametres");
    } else {
      setIsPushFromFileOrParametres(null);
    }
  }, [notification?.type]);

  useEffect(() => {
    if (notification?.typeLink && notification?.linkValue) {
      setLinkValue({ typeLink: notification.typeLink, linkValue: encodeURI(notification.linkValue) });
    }
    form.resetFields();
  }, [notification]);

  const {
    addNotificationAwait: addNewNotificationAwait,
    updateNotificationAwait: updateCurrentNotificationAwait,
    addFileForPushNotificationAwait: addPushFromFileNotificationAwait
  } = useActions(actionCreator);

  const closeDrawer = () => {
    setLinkValue({});
    form.resetFields();
    setValue([]);
    onClose();
    setIsChanged(false);
    setActiveMunicipalitesRadio(undefined);
  };

  const submitForm = () => {
    if (activeMunicipalitesRadio === "isTpsRegions") {
      form.setFieldValue("tpsRegions", true);
    } else {
      form.setFieldValue("tpsRegions", false);
    }

    const getMunicipalityIds = (values) => {
      return activeMunicipalitesRadio === "isTpsRegions"
        ? []
        : activeMunicipalitesRadio === "isNoRegions"
        ? []
        : activeMunicipalitesRadio === "isCheckedRegions"
        ? values.municipality
          ? values.municipality
          : notification.municipality?.map((mun) => mun?.municipalityId)
        : notification.municipality?.map((mun) => mun?.municipalityId);
    };

    const getMunicipalityGroupIds = (values) => {
      return activeMunicipalitesRadio === "isTpsRegions"
        ? []
        : activeMunicipalitesRadio === "isNoRegions"
        ? []
        : activeMunicipalitesRadio === "isCheckedRegions"
        ? values.municipalityGroups
        : values.municipalityGroups;
    };

    form.validateFields().then((values) => {
      const { linkValue1, linkValue2, ...data } = values;
      if (notification && notification.hasOwnProperty("id")) {
        const municipalites = getMunicipalityIds(values);
        const municipalityGroups = getMunicipalityGroupIds(values);

        updateCurrentNotificationAwait({
          dataNotification: {
            ...notification,
            groupId: undefined,
            createdUtc: undefined,
            deletedUtc: undefined,
            groupInfoView: undefined,
            isGroupView: undefined,
            municipalityTotalCount: undefined,
            tpsRegions: activeMunicipalitesRadio ? (activeMunicipalitesRadio === "isTpsRegions" ? true : false) : !!notification.tpsRegions,
            ...data,
            ...linkItemValue,
            considerMunicipalityTimezone: activeMunicipalitesRadio === "isNoRegions" ? false : considerMunicipalityTimezone,
            municipality: municipalites,
            municipalityGroups,
            sendTimeUtc: values.sendTimeUtc && getISOStringByMSCUtc(values.sendTimeUtc)
          },
          sendTimeUtc: values.sendTimeUtc && getISOStringByMSCUtc(values.sendTimeUtc)
        });
      } else if ("file" in values) {
        const formData = new FormData();
        formData.append("file", values.file);
        addPushFromFileNotificationAwait({ file: formData });
      } else {
        addNewNotificationAwait({
          ...data,
          type: notification?.type,
          tpsRegions: activeMunicipalitesRadio === "isTpsRegions",
          municipality: activeMunicipalitesRadio === "isCheckedRegions" ? values.municipality : [],
          municipalityGroups: activeMunicipalitesRadio === "isCheckedRegions" ? values.municipalityGroups : [],
          ...linkItemValue,
          considerMunicipalityTimezone: (activeMunicipalitesRadio !== "isNoRegions" ? considerMunicipalityTimezone : false) || false,
          sendTimeUtc: values.sendTimeUtc && getISOStringByMSCUtc(values.sendTimeUtc)
        });
      }
      closeDrawer();
    });
  };

  const changeLinkValue = (typeLink, linkValue) => {
    if (!linkValue) {
      setLinkValue({ typeLink: "None", linkValue: undefined });
    } else {
      setLinkValue({ typeLink, linkValue: encodeURI(linkValue) });
    }
  };

  const onRadioChange = (e) => {
    if (e.target.value !== "isCheckedRegions") {
      form.setFieldValue("municipality", []);
      form.setFieldValue("municipalityGroups", []);
      form.validateFields(["municipality", "municipalityGroups"]);
    }
    if (e.target.value === "isTpsRegions") {
      form.setFieldValue("tpsRegions", !(activeMunicipalitesRadio === "isTpsRegions"));
    }
    setActiveMunicipalitesRadio(e.target.value);
  };

  // useEffect(() => {
  //   notification?.municipality && setActiveMunicipalitesRadio(undefined);
  //   form.resetFields();
  // }, [!!notification, notification]);

  const options = useMemo(
    () => [
      ...allMunicipalities.map((municipality) => {
        return { label: municipality.name, value: municipality.id };
      })
    ],
    [allMunicipalities]
  );
  const municipalitiesIds = notification?.municipality?.map((municipalities) => municipalities.municipalityId);
  const municipalityGroupIds = notification?.municipalityGroups?.length
    ? notification?.municipalityGroups
    : notification?.originMunicipalityGroupIds;

  useEffect(() => {
    if (isPushFromFileOrParametres === "file") {
      if (form.getFieldValue("file") === undefined && uploadedFiles?.file) {
        form.setFieldValue("file", uploadedFiles.file.originFileObj);
      }
    }
  }, [isPushFromFileOrParametres]);

  return (
    <StyledDrawer
      title={`${notification?.hasOwnProperty("id") ? "Редактирование" : "Создание"} ${notification?.type ?? "none"} - уведомления`}
      closable={false}
      destroyOnClose={true}
      onClose={() => !isChanged && closeDrawer()}
      visible={!!notification}
      width={"50%"}
      footer={
        <div
          style={{
            textAlign: "right"
          }}
        >
          <Button onClick={closeDrawer} style={{ marginRight: 8 }}>
            Отмена
          </Button>
          <Button onClick={submitForm} type="primary" htmlType={"submit"}>
            Сохранить
          </Button>
        </div>
      }
    >
      {notification?.type === "Push" && !notification?.id && (
        <>
          <div
            style={{
              textAlign: "left",
              marginBottom: "8px",
              width: "100%"
            }}
          >
            <Button
              onClick={() => setIsPushFromFileOrParametres("parametres")}
              type={isPushFromFileOrParametres === "parametres" ? "primary" : "default"}
              style={{
                width: "50%"
              }}
            >
              По параметрам
            </Button>
            <Button
              onClick={() => setIsPushFromFileOrParametres("file")}
              type={isPushFromFileOrParametres === "file" ? "primary" : "default"}
              style={{
                width: "50%"
              }}
            >
              Из файла
            </Button>
          </div>
        </>
      )}
      <Form form={form} layout="vertical" onChange={() => (isChanged ? null : setIsChanged(true))}>
        {notification?.type !== "SMS" && isPushFromFileOrParametres !== "file" && (
          <Form.Item
            rules={[
              {
                required: true,
                message: "Обязательное поле."
              },
              {
                max: 50,
                message: "Превышено максимальное количество символов."
              }
            ]}
            label={"Заголовок"}
            required={false}
            name={"heading"}
            initialValue={notification?.heading}
            style={{ marginBottom: 20 }}
          >
            <Input size={"middle"} showCount maxLength={50} />
          </Form.Item>
        )}
        {isPushFromFileOrParametres !== "file" && (
          <Form.Item
            label={"Текст"}
            required={false}
            name={"message"}
            rules={[
              {
                required: true,
                message: "Обязательное поле."
              },
              {
                max: 150,
                message: "Превышено максимальное количество символов."
              }
            ]}
            initialValue={notification?.message ?? ""}
          >
            <TextArea autoSize={{ minRows: 4, maxRows: 8 }} showCount maxLength={150} />
          </Form.Item>
        )}

        {notification?.type === "Push" && isPushFromFileOrParametres !== "file" && (
          <FormLinksItem
            isUpdatedLink={"id" in notification}
            linkType={notification?.typeLink}
            linkValue={notification?.linkValue}
            changeLinkValue={changeLinkValue}
            form={form}
          />
        )}
        {isPushFromFileOrParametres !== "file" && (
          <>
            <Radio.Group value={activeMunicipalitesRadio} onChange={onRadioChange}>
              <Radio onChange={onRadioChange} value={"isNoRegions"}>
                Пользователям без региона
              </Radio>
              <Radio onChange={onRadioChange} value={"isTpsRegions"}>
                В регионы с ТПС
              </Radio>
              <Radio onChange={onRadioChange} value={"isCheckedRegions"}>
                Выберите регион / область / группу
              </Radio>
            </Radio.Group>
            <Form.Item
              key={"municipality"}
              initialValue={municipalitiesIds}
              required={false}
              name={"municipality"}
              rules={[
                {
                  validator: async (_, municipalitiesValue) => {
                    const isEmptyMunicipalitiesValue = !municipalitiesValue?.length;
                    const isEmptyMunicipalityGroupsValue = !form.getFieldValue("municipalityGroups")?.length;
                    const isSelectRegions = activeMunicipalitesRadio === "isCheckedRegions";

                    if (isEmptyMunicipalitiesValue && isEmptyMunicipalityGroupsValue && isSelectRegions) {
                      return Promise.reject("Выберите регион.");
                    } else {
                      return Promise.resolve();
                    }
                  }
                }
              ]}
            >
              <StyledSelect
                style={{
                  marginTop: "12px"
                }}
                {...selectProps("municipality", options, value, setValue, form, "Выберите регион", undefined, true)}
                getPopupContainer={(trigger) => trigger.parentElement}
                disabled={activeMunicipalitesRadio !== "isCheckedRegions"}
                showSearch={true}
                filterOption={(input, option) => option?.label.toLowerCase().includes(input.toLowerCase())}
              />
            </Form.Item>
            <Form.Item
              key={"municipalityGroups"}
              required={false}
              name={"municipalityGroups"}
              initialValue={municipalityGroupIds}
              rules={[
                {
                  validator: async (_, municipalityGroupsValue) => {
                    const isEmptyMunicipalityGroupsValue = !municipalityGroupsValue?.length;
                    const isEmptyMunicipalitiesValue = !form.getFieldValue("municipality")?.length;
                    const isSelectRegions = activeMunicipalitesRadio === "isCheckedRegions";

                    if (isEmptyMunicipalityGroupsValue && isEmptyMunicipalitiesValue && isSelectRegions) {
                      return Promise.reject("Выберите область / группу.");
                    } else {
                      return Promise.resolve();
                    }
                  }
                }
              ]}
              style={{ width: "100%", marginBottom: 0 }}
            >
              <SelectGroupMunicipalities
                disabled={activeMunicipalitesRadio !== "isCheckedRegions"}
                options={groupMunicipalitiesOptions}
                handleSelectGroupMunicipalities={handleSelectGroupMunicipalities}
                placeholder="Выберите область / группу"
                fieldName="municipalityGroups"
                form={form}
              />
            </Form.Item>
          </>
        )}
        {notification?.type === "Push" && isPushFromFileOrParametres === "file" && (
          <>
            <Form.Item
              name="file"
              key={"fileUpload"}
              required={false}
              rules={[
                {
                  validator: validationCsvFiles
                }
              ]}
              label="Файл"
            >
              <Upload
                accept=".csv"
                fileList={uploadedFiles ? uploadedFiles.fileList : undefined}
                maxCount={1}
                customRequest={() => false}
                key={"fileUpload"}
                onChange={(e) => {
                  setUploadedFiles(e);
                  e.file.status = e.file.status === "uploading" ? "done" : e.file.status;
                  e.file && form.setFieldValue("file", e.file.originFileObj);
                }}
                showUploadList={{
                  showDownloadIcon: false
                }}
              >
                <Button icon={<UploadOutlined />}>Загрузить файл</Button>
              </Upload>
            </Form.Item>
            <Typography.Text type="secondary">Файл должен быть в кодировке UTF-8</Typography.Text>
          </>
        )}
        <Divider style={{ margin: "12px 0px" }} />
        {notification?.type === "Push" && isPushFromFileOrParametres === "parametres" && (
          <>
            <Form.Item
              label={"OS:"}
              required={false}
              name={"os"}
              rules={getOsRules(isPushFromFileOrParametres)}
              initialValue={notification?.os ? notification?.os : ""}
            >
              <Checkbox.Group style={{ display: "flex" }} options={osOptions} />
            </Form.Item>
            <Divider />
          </>
        )}
        {isPushFromFileOrParametres !== "file" && (
          <>
            <Form.Item
              key={"considerMunicipalityTimezone"}
              name={"considerMunicipalityTimezone"}
              style={{
                marginTop: "-10px",
                marginBottom: "2px"
              }}
            >
              <Checkbox
                disabled={activeMunicipalitesRadio !== "isNoRegions" ? false : true}
                checked={considerMunicipalityTimezone}
                onChange={() => setConsiderMunicipalityTimezone(!considerMunicipalityTimezone)}
              >
                Учитывать часовой пояс
              </Checkbox>
            </Form.Item>
            <Form.Item
              label={"Дата и время отправки:"}
              required={true}
              requiredMark
              name={"sendTimeUtc"}
              initialValue={notification?.sendTimeUtc ? moment(notification?.sendTimeUtc) : undefined}
              rules={[
                {
                  validator: async (_, time) => {
                    if (considerMunicipalityTimezone) {
                      return validateDateByUtc(_, time, {
                        tpsRegions: activeMunicipalitesRadio === "isTpsRegions",
                        municipalites: form.getFieldValue("municipality")
                      });
                    } else {
                      return validationDate(_, time);
                    }
                  }
                }
              ]}
            >
              <DatePicker placeholder={"Выберите дату и время"} style={{ width: "100%" }} format="DD-MM-YYYY HH:mm" showTime />
            </Form.Item>
          </>
        )}
      </Form>
      <GroupMunicipalityForm
        closeDrawer={() => setFormUpdateGroupMunicipalitiesDrawer(false)}
        visible={formUpdateGroupMunicipalitiesDrawer}
        groupMunicipalityForUpdate={groupMunicipalitiesForUpdate}
        setGroupMunicipalityForUpdate={setGroupMunicipalitiesForUpdate}
        typeGroup={groupMunicipalitiesForUpdate?.type}
      />
    </StyledDrawer>
  );
};

const StyledSelect = styled(Select)`
  .ant-select-selection-overflow {
    max-width: 100%;
    max-height: 200px;
    overflow-y: auto;
  }
`;

const StyledDrawer = styled(Drawer)`
  @media screen and (max-width: 768px) {
    .ant-drawer-content-wrapper {
      width: 100% !important;
    }
  }
`;

// Источник оценки     || Цикломатическая    ||  Когнитивная
// Наша                        -                   222,01
// GrokAI (ChstGPT)           32(70-90)            48(35-45)
// Code Metrics               154                  -
// SonarCube                   119                 104
// Потапов                     -                    95
// Шпаков                      -                   150
//https://admin-stage-new.gorpay.online/customers/notifications test@gmail.com 005