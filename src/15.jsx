import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCheckIsStatickConfiguration } from "./hooks/useCheckIsStatickConfiguration";

import { RoutesPaths } from "../../../common/constants";
import { PageUI } from "../../../common/ui";
import { calcBreadCrumbs, checkConfigurationType, getTitleByType, getFormSteps, isRenderSteps } from "./helpers";
import { Divider, Flex, Steps } from "antd";
import { ConfigForms } from "./components";
import {
  useCreateConfigMutation,
  useGetConfigurationQuery,
  useUpdateConfigurationMutation,
} from "../../../api/configurationsApi";
import { DTO } from "../../../common/types";
import { ConfigFormsDTO } from "./types";
import { EConfigurationTypes } from "../../../common/enums";
import { useSteps } from "../../../common/hooks";
import styles from "./styles.module.css";

export const AddConfiguration = () => {
  const [type, setType] = useState("wrongType");
  const navigate = useNavigate();
  const {
    i18n: { language },
  } = useTranslation();
  const params = useParams();

  const { data } = useGetConfigurationQuery(params.id, {
    skip: !params.id,
  });

  const [updateConfigTrigger, updateResult] = useUpdateConfigurationMutation();

  const { isLoading: isUpdateLoading } = updateResult;

  const handleConfigurationUpdate = (data) =>
    updateConfigTrigger(data).unwrap();

  const { currentStep, steps, handleNext, handlePrev, changeStepsStatusHandler, stepStatus } = useSteps(
    getFormSteps(language)
  );

  const statickconfigSettings = useCheckIsStatickConfiguration({ type: params.type });

  useEffect(() => {
    const type = checkConfigurationType(params.type);
    setType(type);

    if (type === "wrongType") {
      navigate(RoutesPaths.Configs.addCofiguration, { replace: true });
    }
  }, [params.type, navigate]);

  const [createTriger, result] = useCreateConfigMutation();

  const { isLoading } = result;

  const createHandler = (data) => createTriger(data).unwrap();

  const isRenderStep = isRenderSteps(type);

  const title = getTitleByType(type, !!params.id, language);
  const breadcrumbs = calcBreadCrumbs(type, !!params.id, language);

  const formProps= {
    onStepStatusChange: changeStepsStatusHandler,
    data: data?.result,
    currentStep: currentStep,
    onNext: handleNext,
    onPrev: handlePrev,
    trigger: createHandler,
    isLoading: isLoading || isUpdateLoading,
    updateTriger: handleConfigurationUpdate,
    isDisabled: statickconfigSettings.isStatickDisabled,
  };

  return (
    <PageUI.Wrapper>
      <PageUI.Header
        breadCrumbs={breadcrumbs}
        titleWithBackLink={{
          title: title,
          to: params.id ? RoutesPaths.Configs.default : RoutesPaths.Configs.addCofiguration,
        }}
      />
      <PageUI.ContentWithFilters
        content={
          <Flex vertical align="center" gap={60}>
            {isRenderStep && (
              <Steps
                style={{
                  width: "60%",
                }}
                status={stepStatus}
                current={currentStep}
                items={steps}
              />
            )}
            <Flex justify="center" align="center" className={styles.formWrapper} vertical>
              {type === EConfigurationTypes.wifi && <ConfigForms.Wifi {...formProps} />}

              {type === EConfigurationTypes.allowCamera && <ConfigForms.Camera {...formProps} />}
              {type === EConfigurationTypes.allowScreenShot && <ConfigForms.ScreenShot {...formProps} />}
              {type === EConfigurationTypes.allowOpenFromUnmanagedToManaged && (
                <ConfigForms.FromUnmanagedToManaged {...formProps} />
              )}
              {type === EConfigurationTypes.appConfig && (
                <ConfigForms.AppConfig
                  onStepStatusChange={changeStepsStatusHandler}
                  data={data?.result}
                  currentStep={currentStep}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  trigger={createHandler}
                  isLoading={isLoading || isUpdateLoading}
                  updateTriger={(data) => handleConfigurationUpdate(data)}
                  isDisabled={statickconfigSettings.isStatickDisabled}
                />
              )}
              {type === EConfigurationTypes.allowOpenFromManagedToUnmanaged && (
                <ConfigForms.FromManagetToUnmenaget {...formProps} />
              )}
              {type === EConfigurationTypes.requireManagedPasteboard && (
                <ConfigForms.ManagedPasteboard {...formProps} />
              )}
              {type === EConfigurationTypes.security && <ConfigForms.Securuty {...formProps} />}
              {type === EConfigurationTypes.vpn && <ConfigForms.Vpn {...formProps} />}
              {type === EConfigurationTypes.mail && <ConfigForms.Email {...formProps} />}
            </Flex>
            <Divider></Divider>
          </Flex>
        }
      ></PageUI.ContentWithFilters>
    </PageUI.Wrapper>
  );
};

export const EmailForm = ({
    onNext,
    onPrev,
    currentStep,
    trigger,
    onStepStatusChange,
    isLoading,
    updateTriger,
    data,
  }) => {
    const {
      control,
      handleSubmit,
      watch,
      formState,
      trigger: validationTrigger,
      setValue,
    } = useForm<ConfigFormsDTO.Email.Fields>({
      mode: "all",
      resolver: yupResolver(emailFieldsSchema),
    });
  
    const { errors } = formState;
  
    useEffect(() => {
      if (Object.keys(errors).length > 0) {
        onStepStatusChange?.("error");
      } else {
        onStepStatusChange?.("process");
      }
    }, [Object.keys(errors)]);
  
    usePresetFormValue(setValue, data);
  
    const handleNextClick = async () => {
      const res = await validationTrigger("Name");
      if (res) {
        onNext?.();
      }
    };
  
    const handlePrevClick = () => {
      onPrev?.();
    };
  
    const { errorMessageHandler, contextHolder } = useMessage();
  
    const submittHandler = async (dataByUser) => {
      try {
        const { Name, Description, ...rest } = dataByUser;
        const payload = extractDictFromPlistStringEmail(rest);
  
        const body = {
          configurationType: EConfigurationTypes.mail,
          platforms: EPlatform.IOS,
          name: Name,
          description: Description,
          iosArguments: payload,
        };
  
        if (data) {
          const updateData = {
            ...data,
            ...body,
          };
  
          await updateTriger?.(updateData);
          onNext?.();
        } else {
          await trigger?.(body);
          onNext?.();
        }
      } catch (error) {
        errorMessageHandler(error);
      }
    };
  
    const renderSteps = (currentStep = 0) => {
      if (currentStep === 0) {
        return <AddConfigFormsComponents.Common nameField="Name" descriptionField="Description" control={control} />;
      }
      if (currentStep === 1) {
        return <EmailConfig watch={watch} control={control} errors={errors} />;
      }
      if (currentStep === 2) {
        return <AddConfigFormsComponents.Success isUpdate={!!data} />;
      }
    };
  
    return (
      <form className={styles.form}>
        {contextHolder}
        <Flex className={styles.inputsWrapper} vertical gap={16}>
          {renderSteps(currentStep)}
          <FormButtons
            onNext={handleNextClick}
            onSubmit={handleSubmit(submittHandler)}
            currentStep={currentStep}
            onPrev={handlePrevClick}
            isLoading={isLoading}
          />
        </Flex>
      </form>
    );
  };

  
  const outGoingKeys = [
    EmailConfigFieldsKeys.OutgoingMailServerAuthentication,
    EmailConfigFieldsKeys.OutgoingMailServerHostName,
    EmailConfigFieldsKeys.OutgoingMailServerHostName,
    EmailConfigFieldsKeys.OutgoingMailServerUsername,
  ];
  const incomingKeys = [
    EmailConfigFieldsKeys.IncomingMailServerUsername,
    EmailConfigFieldsKeys.IncomingMailServerHostName,
    EmailConfigFieldsKeys.IncomingMailServerUsername,
  ];
  export const EmailConfigTabs = () => {
    const { control, watch, errors } = useEmailConfigFormContext();
  
    const outgoingPassSameAsIncomming = watch?.("OutgoingPasswordSameAsIncomingPassword");
  
    const isOutgoingMailValidationErorr = errors
      ? outGoingKeys.some((item) => Object.keys(errors).includes(item))
      : false;
    const isIncomingMailValidationError = errors
      ? incomingKeys.some((item) => Object.keys(errors).includes(item))
      : false;
  
    const items = [
      {
        key: "incomingMail",
        label: (
          <Typography.Text
            style={{
              color: isIncomingMailValidationError ? "var(--red)" : undefined,
            }}
          >
            Входящая почта
          </Typography.Text>
        ),
        children: (
          <>
            <Flex vertical gap={18}>
              <div className={styles.tabGrid}>
                <label className={styles.tabFlex}>
                  <span className={styles.tabLabel}>
                    <span className={styles.requiredAccent}>*</span>
                    Адрес сервера входящей почты
                  </span>
  
                  <Controller
                    control={control}
                    name={EmailConfigFieldsKeys.IncomingMailServerHostName}
                    render={({ field, formState: { errors } }) => (
                      <InputWithLabel errorMessage={errors.IncomingMailServerHostName?.message} {...field} />
                    )}
                  />
                </label>
                <label className={styles.tabFlex}>
                  <span className={styles.tabLabel}>
                    <span className={styles.requiredAccent}>*</span>
                    Порт
                  </span>
                  <Controller
                    defaultValue={995}
                    control={control}
                    name={EmailConfigFieldsKeys.IncomingMailServerPortNumber}
                    render={({ field, formState: { errors } }) => (
                      <InputWithLabel
                        errorMessage={errors.IncomingMailServerPortNumber?.message}
                        type="number"
                        {...field}
                      />
                    )}
                  />
                </label>
              </div>
              <Controller
                control={control}
                name={EmailConfigFieldsKeys.IncomingMailServerUsername}
                render={({ field, formState: { errors } }) => (
                  <InputWithLabel
                    required
                    errorMessage={errors.IncomingMailServerUsername?.message}
                    inputType="input"
                    {...field}
                    label="Имя пользователя"
                  />
                )}
              />
  
              <Controller
                defaultValue={authTypeOptions[0].value}
                control={control}
                name={EmailConfigFieldsKeys.IncomingMailServerAuthentication}
                render={({ field: { value, onChange }, formState: { errors } }) => (
                  <InputWithLabel
                    errorMessage={errors.IncomingMailServerAuthentication?.message}
                    label="Тип аутентификации"
                  >
                    <Select value={value} onSelect={onChange} options={authTypeOptions} />
                  </InputWithLabel>
                )}
              />
              <Controller
                control={control}
                name={EmailConfigFieldsKeys.IncomingPassword}
                render={({ field, formState: { errors } }) => (
                  <InputWithLabel
                    errorMessage={errors.IncomingPassword?.message}
                    inputType="password"
                    {...field}
                    label="Пароль"
                  />
                )}
              />
              <Controller
                defaultValue={false}
                control={control}
                name={EmailConfigFieldsKeys.IncomingMailServerUseSSL}
                render={({ field: { value, onChange }, formState: { errors } }) => (
                  <InputWithLabel errorMessage={errors.IncomingMailServerUseSSL?.message} label="Использовать SSL">
                    <Checkbox checked={value} onChange={onChange} />
                  </InputWithLabel>
                )}
              />
            </Flex>
          </>
        ),
      },
      {
        key: "outgoingMail",
        label: (
          <Typography.Text
            style={{
              color: isOutgoingMailValidationErorr ? "var(--red)" : undefined,
            }}
          >
            Исходящая почта
          </Typography.Text>
        ),
        children: (
          <Flex vertical gap={18}>
            <div className={styles.tabGrid}>
              <label className={styles.tabFlex}>
                <span className={styles.tabLabel}>
                  <span className={styles.requiredAccent}>*</span>
                  Адрес сервера исходящей почты
                </span>
  
                {/* обязательное */}
                <Controller
                  control={control}
                  name={EmailConfigFieldsKeys.OutgoingMailServerHostName}
                  render={({ field, formState: { errors } }) => (
                    <InputWithLabel errorMessage={errors.OutgoingMailServerHostName?.message} {...field} />
                  )}
                />
              </label>
              <label className={styles.tabFlex}>
                <span className={styles.tabLabel}>
                  <span className={styles.requiredAccent}>*</span>
                  Порт
                </span>
                <Controller
                  defaultValue={587}
                  control={control}
                  name={EmailConfigFieldsKeys.OutgoingMailServerPortNumber}
                  render={({ field, formState: { errors } }) => (
                    <InputWithLabel
                      errorMessage={errors.OutgoingMailServerPortNumber?.message}
                      type="number"
                      {...field}
                    />
                  )}
                />
              </label>
            </div>
            <Controller
              control={control}
              name={EmailConfigFieldsKeys.OutgoingMailServerUsername}
              render={({ field, formState: { errors } }) => (
                <InputWithLabel
                  errorMessage={errors.OutgoingMailServerUsername?.message}
                  inputType="input"
                  required
                  {...field}
                  label="Имя пользователя"
                />
              )}
            />
  
            <Controller
              control={control}
              defaultValue={authTypeOptions[0].value}
              name={EmailConfigFieldsKeys.OutgoingMailServerAuthentication}
              render={({ field: { value, onChange }, formState: { errors } }) => (
                <InputWithLabel
                  errorMessage={errors.OutgoingMailServerAuthentication?.message}
                  label="Тип аутентификации"
                >
                  <Select value={value} onSelect={onChange} options={authTypeOptions} />
                </InputWithLabel>
              )}
            />
            <Controller
              control={control}
              name={EmailConfigFieldsKeys.OutgoingPassword}
              render={({ field, formState: { errors } }) => (
                <InputWithLabel
                  errorMessage={errors.OutgoingPassword?.message}
                  disabled={!!outgoingPassSameAsIncomming}
                  inputType="password"
                  {...field}
                  label="Пароль"
                />
              )}
            />
            <Controller
              defaultValue={false}
              control={control}
              name={EmailConfigFieldsKeys.OutgoingPasswordSameAsIncomingPassword}
              render={({ field: { value, onChange }, formState: { errors } }) => (
                <InputWithLabel
                  errorMessage={errors.OutgoingPasswordSameAsIncomingPassword?.message}
                  label="Использовать один пароль для входящей и исходящей почты"
                >
                  <Checkbox checked={value} onChange={onChange} />
                </InputWithLabel>
              )}
            />
            <Controller
              control={control}
              defaultValue={false}
              name={"OutgoingMailServerUseSSL"}
              render={({ field: { value, onChange }, formState: { errors } }) => (
                <InputWithLabel label="Использовать SSL" errorMessage={errors.OutgoingMailServerUseSSL?.message}>
                  <Checkbox checked={value} onChange={onChange} />
                </InputWithLabel>
              )}
            />
          </Flex>
        ),
      },
    ];
    return <Tabs defaultActiveKey="1" type="card" items={items} />;
  };

  
  export const EmailConfigField = () => {
    const { control } = useEmailConfigFormContext();
  
    return (
      <Flex vertical gap={24}>
        <Controller
          control={control}
          name={EmailConfigFieldsKeys.EmailAccountDescription}
          render={({ field, formState: { errors } }) => (
            <InputWithLabel
              componentStyles={{
                wrapperStyle: {
                  maxWidth: "none",
                  width: "calc(100% - 11px)",
                },
              }}
              errorMessage={errors.EmailAccountDescription?.message}
              inputType="input"
              {...field}
              label="Подпись аккаунта"
            />
          )}
        />
        <div className={styles.grid_type}>
          {/* обязательное */}
          <Controller
            control={control}
            defaultValue={emailAccountTypeoptions[0].value}
            name={EmailConfigFieldsKeys.EmailAccountType}
            render={({ field: { value, onBlur, onChange }, formState: { errors } }) => (
              <InputWithLabel errorMessage={errors.EmailAccountType?.message}>
                <Select
                  className={styles.select}
                  options={emailAccountTypeoptions}
                  status={errors.EmailAccountType?.message ? "error" : undefined}
                  onSelect={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              </InputWithLabel>
            )}
          />
          <label className={styles.label}>
            Префикс:
            <Controller
              control={control}
              name={EmailConfigFieldsKeys.IncomingMailServerIMAPPathPrefix}
              render={({ field, formState: { errors } }) => (
                <InputWithLabel {...field} errorMessage={errors.IncomingMailServerIMAPPathPrefix?.message} />
              )}
            />
          </label>
        </div>
  
        <Controller
          control={control}
          name={EmailConfigFieldsKeys.EmailAccountName}
          render={({ field, formState: { errors } }) => (
            <InputWithLabel
              alternate
              inputType="input"
              {...field}
              errorMessage={errors.EmailAccountName?.message}
              required
              label="Имя учетной записи электронной почты"
            />
          )}
        />
        {/* обязательное */}
        <Controller
          control={control}
          name={EmailConfigFieldsKeys.EmailAddress}
          render={({ field, formState: { errors } }) => (
            <InputWithLabel
              alternate
              inputType="input"
              {...field}
              errorMessage={errors.EmailAddress?.message}
              required
              label="Адрес электронной почты"
            />
          )}
        />
        {/* реверс значения */}
        <Controller
          control={control}
          defaultValue={false}
          name={EmailConfigFieldsKeys.PreventMove}
          render={({ field: { value, onChange }, formState: { errors } }) => (
            <InputWithLabel
              disableWrapperStyles
              reverse
              errorMessage={errors.PreventMove?.message}
              label="Запрет перемещения сообщений"
            >
              <Checkbox checked={value} onChange={onChange} />
            </InputWithLabel>
          )}
        />
        {/* реверс значения */}
        <Controller
          control={control}
          name={EmailConfigFieldsKeys.disableMailRecentsSyncing}
          render={({ field: { value, onChange }, formState: { errors } }) => (
            <InputWithLabel
              reverse
              disableWrapperStyles
              errorMessage={errors.disableMailRecentsSyncing?.message}
              label="Отключить синхронизацию писем"
            >
              <Checkbox checked={value} onChange={onChange} />
            </InputWithLabel>
          )}
        />
  
        <Controller
          control={control}
          name={EmailConfigFieldsKeys.allowMailDrop}
          render={({ field: { value, onChange }, formState: { errors } }) => (
            <InputWithLabel
              reverse
              disableWrapperStyles
              errorMessage={errors.allowMailDrop?.message}
              label="Разрешить отправку почтовых сообщений"
            >
              <Checkbox checked={value} onChange={onChange} />
            </InputWithLabel>
          )}
        />
        <Controller
          control={control}
          name={EmailConfigFieldsKeys.PreventAppSheet}
          render={({ field: { value, onChange }, formState: { errors } }) => (
            <InputWithLabel
              reverse
              disableWrapperStyles
              errorMessage={errors.PreventAppSheet?.message}
              label="Использовать только в приложении"
            >
              <Checkbox checked={value} onChange={onChange} />
            </InputWithLabel>
          )}
        />
        <Controller
          control={control}
          name={EmailConfigFieldsKeys.SMIMESigningEnabled}
          render={({ field: { value, onChange }, formState: { errors } }) => (
            <InputWithLabel
              reverse
              disableWrapperStyles
              errorMessage={errors.SMIMESigningEnabled?.message}
              label="Включить подпись S/MIME"
            >
              <Checkbox checked={value} onChange={onChange} />
            </InputWithLabel>
          )}
        />
        <Controller
          control={control}
          name={EmailConfigFieldsKeys.SMIMESigningUserOverrideable}
          render={({ field: { value, onChange }, formState: { errors } }) => (
            <InputWithLabel
              reverse
              disableWrapperStyles
              errorMessage={errors.SMIMESigningUserOverrideable?.message}
              label="Разрешить пользователю изменять настройки цифровой подписи S/MIME"
            >
              <Checkbox checked={value} onChange={onChange} />
            </InputWithLabel>
          )}
        />
        <Controller
          control={control}
          name={EmailConfigFieldsKeys.SMIMEEncryptByDefault}
          render={({ field: { value, onChange }, formState: { errors } }) => (
            <InputWithLabel
              reverse
              disableWrapperStyles
              errorMessage={errors.SMIMEEncryptByDefault?.message}
              label="Включить шифрование S/MIME по умолчанию"
            >
              <Checkbox checked={value} onChange={onChange} />
            </InputWithLabel>
          )}
        />
        <Controller
          control={control}
          name={EmailConfigFieldsKeys.SMIMEEncryptByDefaultUserOverrideable}
          render={({ field: { value, onChange }, formState: { errors } }) => (
            <InputWithLabel
              errorMessage={errors.SMIMEEncryptByDefaultUserOverrideable?.message}
              label="Разрешить пользователю изменять настройки шифрования S/MIME по умолчанию"
              reverse
              disableWrapperStyles
            >
              <Checkbox checked={value} onChange={onChange} />
            </InputWithLabel>
          )}
        />
        <Controller
          control={control}
          name={EmailConfigFieldsKeys.SMIMEEnableEncryptionPerMessageSwitch}
          render={({ field: { value, onChange }, formState: { errors } }) => (
            <InputWithLabel
              reverse
              disableWrapperStyles
              errorMessage={errors.SMIMEEnableEncryptionPerMessageSwitch?.message}
              label="Включить переключатель шифрования каждого сообщения"
            >
              <Checkbox checked={value} onChange={onChange} />
            </InputWithLabel>
          )}
        />
        <EmailConfigTabs />
      </Flex>
    );
  };
  

  // Источник оценки     || Цикломатическая    ||  Когнитивная
// Наша                        -                   63,72
// GrokAI                      29                   38
// Code Metrics                38                   -
// SonarCube                   0                    0
// Потапов                     -                    70
// Шпаков                      -                    80

//https://stage.api-mdm.prox2.dex-it.ru/configurations/add-configuration/Mail