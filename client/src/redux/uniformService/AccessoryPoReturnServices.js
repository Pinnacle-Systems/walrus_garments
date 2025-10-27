import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {  ACCESSORT_PURCHASE_RETURN_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const AccessoryPurchaseReturnApi = createApi({
  reducerPath: "AccessoryPurchaseReturn",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["AccessoryPurchaseReturn"],
  endpoints: (builder) => ({
    getAccessoryPurchaseReturn: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: ACCESSORT_PURCHASE_RETURN_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: ACCESSORT_PURCHASE_RETURN_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["AccessoryPurchaseReturn"],
    }),
    getAccessoryPurchaseReturnById: builder.query({
      query: (id) => {
        return {
          url: `${ACCESSORT_PURCHASE_RETURN_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["AccessoryPurchaseReturn"],
    }),
    getDirectItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${ACCESSORT_PURCHASE_RETURN_API}/getDirectItems`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["AccessoryPurchaseReturn"],
    }),
    getPoItemsandDirectInwardItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${ACCESSORT_PURCHASE_RETURN_API}/getPoItemsandDirectInwardItems`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["AccessoryPurchaseReturn"],
    }),
    getDirectItemById: builder.query({
      query: ({ id, purchaseInwardId, stockId, storeId, billEntryId }) => {
        return {
          url: `${ACCESSORT_PURCHASE_RETURN_API}/getDirectItems/${id}/${purchaseInwardId ? purchaseInwardId : null}/${stockId ? stockId : null}/${storeId ? storeId : null}/${billEntryId ? billEntryId : null}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["AccessoryPurchaseReturn"],
    }),

    addAccessoryPurchaseReturn: builder.mutation({
      query: (payload) => ({
        url: ACCESSORT_PURCHASE_RETURN_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["AccessoryPurchaseReturn"],
    }),
    updateAccessoryPurchaseReturn: builder.mutation({
      query: ({ id, ...body }) => {
        return {
          url: `${ACCESSORT_PURCHASE_RETURN_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["AccessoryPurchaseReturn"],
    }),
    deleteAccessoryPurchaseReturn: builder.mutation({
      query: (id) => ({
        url: `${ACCESSORT_PURCHASE_RETURN_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AccessoryPurchaseReturn"],
    }),
  }),
});

export const {
  useGetDirectInwardOrReturnQuery,
  useGetDirectInwardOrReturnByIdQuery,
  useGetPoItemsandDirectInwardItemsQuery,
  useGetDirectItemsQuery,
  useGetDirectItemByIdQuery,
  useAddDirectInwardOrReturnMutation,
  useUpdateDirectInwardOrReturnMutation,
  useDeleteDirectInwardOrReturnMutation,
} = AccessoryPurchaseReturnApi;

export default AccessoryPurchaseReturnApi;
