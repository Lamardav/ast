// store.js
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/*
  Создаем API-срез с использованием RTK Query.
  Здесь определяется базовый URL для API и набор эндпоинтов.
*/
export const apiSlice = createApi({
  reducerPath: "api", // ключ в state, где будет храниться кэш
  baseQuery: fetchBaseQuery({
    baseUrl: "https://example.com/api", // укажите ваш базовый URL API
  }),
  endpoints: (builder) => ({
    // Эндпоинт для получения списка элементов
    getItems: builder.query({
      query: () => "/items", // URL для запроса GET
    }),
    // Эндпоинт для добавления нового элемента
    addItem: builder.mutation({
      query: (newItem) => ({
        url: "/items", // URL для запроса POST
        method: "POST",
        body: newItem, // тело запроса
      }),
    }),
  }),
});

// Экспортируем автоматически сгенерированные React-хуки для работы с эндпоинтами
export const { useGetItemsQuery, useAddItemMutation } = apiSlice;

/*
  Конфигурируем Redux store, интегрируя RTK Query.
  Здесь добавляем reducer для apiSlice и подключаем middleware RTK Query.
*/
const store = configureStore({
  reducer: {
    // Регистрируем редьюсер для нашего apiSlice
    [apiSlice.reducerPath]: apiSlice.reducer,
    // Здесь можно добавить другие редьюсеры при необходимости
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

// Настраиваем автоматическое повторное подключение (refetchOnFocus/refetchOnReconnect)
// для улучшения UX при потере/возврате фокуса окна
setupListeners(store.dispatch);

export default store;

// Источник оценки     || Цикломатическая    ||  Когнитивная
// Наша                        -                   8.01
// GrokAI                      2                     10
// Code Metrics                -                     -
// SonarCube                   4                      0
// Потапов                     -                      7
