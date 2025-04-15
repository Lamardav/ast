import React, { FC } from "react";
import { Form } from "antd";
import { FormComponentProps } from "antd/es/form";
import Text from "antd/es/typography/Text";
import Input from "antd/es/input";
import Checkbox from "antd/es/checkbox";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { ButtonSocialNetwork } from "../../../common/components/ui/ButtonSocialNetwork";
import { SocialNetworkContainer } from "../components/ui/SocialNetworkContainer";
import { SocialNetworkBottomLine } from "../components/ui/SocialNetworkBottomLine";
import { AuthForm } from "../components/ui/AuthForm";
import { AuthActionButton } from "../components/ui/AuthActionButton";
import { AuthActionContainer } from "../components/ui/AuthActionContainer";


export const useSignIn = ({
    signInForm,
    onSuccess,
    onProfileIsNotExist,
    searchParamsForRedirectLink,
  }) => {
    const { isAuth, loginError } = useSelector(authSelectors.state);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    useUrlLanguage();
  
    const getSignInFields = {
      email: signInForm.getFieldDecorator("email", {
        rules: [
          { required: true, message: t("auth.required") },
          { pattern: emailRegexp, message: t("auth.emailError") },
        ],
      }),
      password: signInForm.getFieldDecorator("password", {
        rules: [
          { required: true, message: t("auth.required") },
          { pattern: passwordRegexp, message: t("auth.passError") },
        ],
      }),
      rememberMe: signInForm.getFieldDecorator("remember", {
        valuePropName: "checked",
        initialValue: false,
      }),
    };
  
    const redirectToCreateProfile = () => {
      const jwt = BaseRequest.profileInfo;
      const profileId = jwt?.profileId;
      if (!profileId) {
        onProfileIsNotExist();
  
        return true;
      }
    };
  
    const handleResult = async (err) => {
      if (err) {
        return;
      }
      const isRedirected = redirectToCreateProfile();
      if (isRedirected) {
        return;
      }
      dispatch(profileActionsAsync.get());
      onSuccess();
    };
  
    const signIn = () => {
      signInForm.validateFields((err, values) => {
        if (!err) {
          dispatch(authActionsAsync.login(values, handleResult));
        }
      });
    };
  
    const handleClickSocialButton = (type) => {
      const redirectUrl = new URL(window.location.href);
      redirectUrl.search = window.location.search;
      redirectUrl.searchParams.set("network", type);
      searchParamsForRedirectLink?.forEach(([key, value]) =>
        redirectUrl.searchParams.set(key, value)
      );
      dispatch(
        authActionsAsync.authenticationExternal({
          type,
          redirectUrl: encodeURIComponent(redirectUrl.toString()),
        })
      );
    };
  
    return {
      getSignInFields,
      isAuth,
      loginError,
      signIn,
      handleClickSocialButton,
    };
  };
  

const SignIn = ({
  form,
  searchParamsForRedirectLink,
  buttonText,
  onProfileIsNotExist,
  onSuccess,
}) => {
  const {
    getSignInFields,
    loginError,
    signIn,
    handleClickSocialButton,
  } = useSignIn({
    signInForm: form,
    searchParamsForRedirectLink,
    onSuccess,
    onProfileIsNotExist,
  });
  const { t } = useTranslation();

  return (
    <>
      <SocialNetworkContainer>
        <ButtonSocialNetwork
          title={"LinkedIn"}
          onClick={() => handleClickSocialButton("LinkedIn")}
        />
        <ButtonSocialNetwork
          title={"Facebook"}
          onClick={() => handleClickSocialButton("Facebook")}
        />
      </SocialNetworkContainer>
      <SocialNetworkBottomLine>{t("common.or")}</SocialNetworkBottomLine>
      {!!loginError && <Text type="danger">{t("auth.userNotFound")}</Text>}
      <AuthForm hideRequiredMark>
        <Form.Item label={t("auth.email")} colon={false}>
          {getSignInFields.email(<Input size="large" />)}
        </Form.Item>

        <Form.Item label={t("auth.password")} colon={false}>
          {getSignInFields.password(<Input.Password size="large" />)}
        </Form.Item>

        <Actions>
          <RememberMeFormItem>
            {getSignInFields.rememberMe(
              <Checkbox>{t("auth.rememberMe")}</Checkbox>
            )}
          </RememberMeFormItem>
          <ForgotPassButton>{t("auth.forgotPassword")}</ForgotPassButton>
        </Actions>

        <AuthActionContainer>
          <AuthActionButton
            type="primary"
            htmlType="submit"
            size="large"
            onClick={() => signIn()}
          >
            {t(buttonText || "auth.signIn")}
          </AuthActionButton>
        </AuthActionContainer>
      </AuthForm>
    </>
  );
};

export const SignInForm = Form.create<ISignInFormProps>({
  name: "sign-in",
})(SignIn);

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin: 16px 0;
  font-size: 12px;
`;

const RememberMeFormItem = styled(Form.Item)`
  margin-bottom: 0;
  span {
    font-size: 12px;
  }
`;

//TODO заменить цвет на переменную
const ForgotPassButton = styled.span`
  color: #0acdde;
  cursor: pointer;
`;

// Источник оценки     || Цикломатическая    ||  Когнитивная
// Наша                        -                   17,26
// GrokAI                      10                   12
// Code Metrics                38                   -
// SonarCube                   17                    5
// Потапов                     -                    35
// Шпаков                      -                    30

//https://maxmodal.com/signin