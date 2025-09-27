import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {  ACCESSORT_PURCHASE_INWARD_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const AccessoryPurchaseInwardApi = createApi({
  reducerPath: "AccessoryPurchaseInward",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["DirectInwardOrReturn"],
  endpoints: (builder) => ({
    getAccessoryPurchaseInward: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: ACCESSORT_PURCHASE_INWARD_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: ACCESSORT_PURCHASE_INWARD_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["AccessoryPurchaseInwardApi"],
    }),
    getAccessoryPurchaseInwardById: builder.query({
      query: (id) => {
        return {
          url: `${ACCESSORT_PURCHASE_INWARD_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["AccessoryPurchaseInwardApi"],
    }),
    getDirectItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${ACCESSORT_PURCHASE_INWARD_API}/getDirectItems`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["AccessoryPurchaseInwardApi"],
    }),
    getPoItemsandDirectInwardItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${ACCESSORT_PURCHASE_INWARD_API}/getPoItemsandDirectInwardItems`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["AccessoryPurchaseInwardApi"],
    }),
    getDirectItemById: builder.query({
      query: ({ id, purchaseInwardId, stockId, storeId, billEntryId }) => {
        return {
          url: `${ACCESSORT_PURCHASE_INWARD_API}/getDirectItems/${id}/${purchaseInwardId ? purchaseInwardId : null}/${stockId ? stockId : null}/${storeId ? storeId : null}/${billEntryId ? billEntryId : null}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["AccessoryPurchaseInwardApi"],
    }),

    addAccessoryPurchaseInward: builder.mutation({
      query: (payload) => ({
        url: ACCESSORT_PURCHASE_INWARD_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["AccessoryPurchaseInwardApi"],
    }),
    updateAccessoryPurchaseInward: builder.mutation({
      query: ({ id, ...body }) => {
        return {
          url: `${ACCESSORT_PURCHASE_INWARD_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["AccessoryPurchaseInwardApi"],
    }),
    deleteAccessoryPurchaseInward: builder.mutation({
      query: (id) => ({
        url: `${ACCESSORT_PURCHASE_INWARD_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AccessoryPurchaseInwardApi"],
    }),
  }),
});

export const {
  useGetAccessoryPurchaseInwardQuery,
  useGetAccessoryPurchaseInwardByIdQuery,
  useGetPoItemsandDirectInwardItemsQuery,
  useGetDirectItemsQuery,
  useGetDirectItemByIdQuery,
  useAddAccessoryPurchaseInwardMutation,
  useUpdateAccessoryPurchaseInwardMutation,
  useDeleteAccessoryPurchaseInwardMutation,
} = AccessoryPurchaseInwardApi;

export default AccessoryPurchaseInwardApi;
