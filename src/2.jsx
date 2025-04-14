// ComplexComponent.js

import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

// Определение анимации появления для контейнера
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Основной контейнер приложения
const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  background: #f2f2f2;
  animation: ${fadeIn} 1s ease-in-out;
`;

// Боковая панель
const Sidebar = styled.div`
  width: 250px;
  background: #2c3e50;
  color: #ecf0f1;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

// Элементы боковой панели
const SidebarItem = styled.div`
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #34495e;
  }
  transition: background 0.3s ease;
  ${(props) => props.active && `background: #1abc9c;`}
`;

// Основной контент
const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

// Заголовок страницы
const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #bdc3c7;
`;

// Заголовок
const Title = styled.h1`
  font-size: 24px;
  color: #34495e;
`;

// Кнопка
const Button = styled.button`
  background: #1abc9c;
  border: none;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #16a085;
  }
  transition: background 0.3s ease;
`;

// Область отображения карточек
const ContentArea = styled.div`
  flex: 1;
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-gap: 20px;
`;

// Карточка
const Card = styled.div`
  background: #ffffff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

// Заголовок карточки
const CardTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 10px;
  color: #2c3e50;
`;

// Содержимое карточки
const CardContent = styled.p`
  font-size: 16px;
  color: #7f8c8d;
  flex: 1;
`;

// Оверлей модального окна
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: ${(props) => (props.show ? "flex" : "none")};
  justify-content: center;
  align-items: center;
`;

// Контент модального окна
const ModalContent = styled.div`
  background: #ffffff;
  padding: 30px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  position: relative;
`;

// Кнопка закрытия модального окна
const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 24px;
  position: absolute;
  top: 10px;
  right: 20px;
  cursor: pointer;
  color: #c0392b;
`;

// Инпут
const Input = styled.input`
  padding: 10px;
  border: 1px solid #bdc3c7;
  border-radius: 5px;
  margin-bottom: 15px;
  width: 100%;
`;

// Текстовое поле
const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #bdc3c7;
  border-radius: 5px;
  margin-bottom: 15px;
  width: 100%;
  resize: vertical;
`;

// Лейбл формы
const FormLabel = styled.label`
  font-size: 16px;
  color: #34495e;
  margin-bottom: 5px;
  display: block;
`;

// Группа элементов формы
const FormGroup = styled.div`
  margin-bottom: 20px;
`;

// Футер приложения
const Footer = styled.footer`
  padding: 10px;
  text-align: center;
  background: #ecf0f1;
  color: #2c3e50;
  border-top: 1px solid #bdc3c7;
  margin-top: 20px;
`;

// Панель статистики
const StatsPanel = styled.div`
  margin-top: 30px;
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// Заголовок статистики
const StatsTitle = styled.h3`
  font-size: 18px;
  color: #34495e;
  margin-bottom: 10px;
`;

// Список статистики
const StatsList = styled.ul`
  list-style: none;
  padding: 0;
`;

// Элемент статистики
const StatsItem = styled.li`
  padding: 8px 0;
  border-bottom: 1px solid #ecf0f1;
  &:last-child {
    border-bottom: none;
  }
`;

// Дополнительная панель календаря
const CalendarPanel = styled.div`
  margin-top: 30px;
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// Заголовок календаря
const CalendarTitle = styled.h3`
  font-size: 18px;
  color: #34495e;
  margin-bottom: 10px;
`;

// Элемент календаря
const CalendarDay = styled.div`
  padding: 10px;
  margin: 5px;
  background: #bdc3c7;
  border-radius: 4px;
  color: #2c3e50;
  width: 40px;
  text-align: center;
`;

// Сетка календаря
const CalendarGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: 300px;
  margin-top: 10px;
`;

// Главный компонент приложения
const ComplexComponent = () => {
  // Состояния для боковой панели, карточек, модального окна и статистики
  const [activeSidebarItem, setActiveSidebarItem] = useState("dashboard");
  const [cards, setCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [stats, setStats] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Имитируем загрузку данных при монтировании компонента
  useEffect(() => {
    const initialCards = [
      { id: 1, title: "Карточка 1", content: "Содержание карточки 1" },
      { id: 2, title: "Карточка 2", content: "Содержание карточки 2" },
      { id: 3, title: "Карточка 3", content: "Содержание карточки 3" },
    ];
    setCards(initialCards);

    const initialStats = ["Посещений: 1200", "Новых сообщений: 45", "Активных пользователей: 300"];
    setStats(initialStats);
  }, []);

  // Обновляем текущую дату каждую минуту
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Обработчик клика по элементам боковой панели
  const handleSidebarClick = (item) => {
    setActiveSidebarItem(item);
  };

  // Открытие модального окна для добавления новой карточки
  const handleAddCard = () => {
    setShowModal(true);
  };

  // Закрытие модального окна и сброс значений
  const handleModalClose = () => {
    setShowModal(false);
    setModalTitle("");
    setModalContent("");
  };

  // Отправка формы модального окна
  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (modalTitle && modalContent) {
      const newCard = {
        id: Date.now(),
        title: modalTitle,
        content: modalContent,
      };
      setCards([...cards, newCard]);
      handleModalClose();
    }
  };

  // Генерируем календарные дни (простой пример)
  const renderCalendarDays = () => {
    const days = [];
    for (let i = 1; i <= 30; i++) {
      days.push(<CalendarDay key={i}>{i}</CalendarDay>);
    }
    return days;
  };

  return (
    <>
      <Container>
        <Sidebar>
          <SidebarItem active={activeSidebarItem === "dashboard"} onClick={() => handleSidebarClick("dashboard")}>
            Панель управления
          </SidebarItem>
          <SidebarItem active={activeSidebarItem === "profile"} onClick={() => handleSidebarClick("profile")}>
            Профиль
          </SidebarItem>
          <SidebarItem active={activeSidebarItem === "settings"} onClick={() => handleSidebarClick("settings")}>
            Настройки
          </SidebarItem>
          <SidebarItem active={activeSidebarItem === "reports"} onClick={() => handleSidebarClick("reports")}>
            Отчеты
          </SidebarItem>
          <SidebarItem active={activeSidebarItem === "help"} onClick={() => handleSidebarClick("help")}>
            Помощь
          </SidebarItem>
        </Sidebar>
        <MainContent>
          <Header>
            <Title>
              {activeSidebarItem === "dashboard"
                ? "Панель управления"
                : activeSidebarItem === "profile"
                ? "Профиль пользователя"
                : activeSidebarItem === "settings"
                ? "Настройки"
                : activeSidebarItem === "reports"
                ? "Отчеты"
                : "Помощь"}
            </Title>
            <Button onClick={handleAddCard}>Добавить карточку</Button>
          </Header>
          <ContentArea>
            {cards.map((card) => (
              <Card key={card.id}>
                <CardTitle>{card.title}</CardTitle>
                <CardContent>{card.content}</CardContent>
              </Card>
            ))}
          </ContentArea>
          {/* Панель статистики отображается только для панели управления */}
          {activeSidebarItem === "dashboard" && (
            <StatsPanel>
              <StatsTitle>Статистика</StatsTitle>
              <StatsList>
                {stats.map((stat, index) => (
                  <StatsItem key={index}>{stat}</StatsItem>
                ))}
              </StatsList>
            </StatsPanel>
          )}
          {/* Простейший календарь */}
          {activeSidebarItem === "dashboard" && (
            <CalendarPanel>
              <CalendarTitle>Календарь (Текущая дата: {currentDate.toLocaleDateString()})</CalendarTitle>
              <CalendarGrid>{renderCalendarDays()}</CalendarGrid>
            </CalendarPanel>
          )}
          <Footer>© 2025 Все права защищены. Создано с использованием React и Styled Components.</Footer>
        </MainContent>
      </Container>
      <ModalOverlay show={showModal}>
        <ModalContent>
          <CloseButton onClick={handleModalClose}>&times;</CloseButton>
          <form onSubmit={handleModalSubmit}>
            <FormGroup>
              <FormLabel htmlFor="title">Заголовок</FormLabel>
              <Input id="title" type="text" value={modalTitle} onChange={(e) => setModalTitle(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <FormLabel htmlFor="content">Содержание</FormLabel>
              <TextArea id="content" rows="4" value={modalContent} onChange={(e) => setModalContent(e.target.value)} />
            </FormGroup>
            <Button type="submit">Сохранить</Button>
          </form>
        </ModalContent>
      </ModalOverlay>
    </>
  );
};

// Дополнительный комментарий:
// Данный компонент демонстрирует использование React хуков и styled-components для создания динамичного и интерактивного пользовательского интерфейса.
// Компонент включает в себя боковую панель, основное содержимое с карточками, модальное окно для добавления новых карточек,
// панель статистики и простой календарь. Также реализовано обновление состояния и анимация появления.
// Компонент можно расширить для более сложной логики и интеграции с серверной частью приложения.

export default ComplexComponent;

// Источник оценки     || Цикломатическая    ||  Когнитивная
// Наша                        -                   36.43
// GrokAI                      16                   14
// Code Metrics                66                    -
// SonarCube                   32                   15
// Потапов                     -                    40
