import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {  ACCESSORT_PURCHASE_INWARD_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const AccessoryPurchaseInwardApi = createApi({
  reducerPath: "AccessoryPurchaseInward",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["AccessoryPurchaseInward"],
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
      providesTags: ["AccessoryPurchaseInward"],
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
      providesTags: ["AccessoryPurchaseInward"],
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
      providesTags: ["AccessoryPurchaseInward"],
    }),
    getPoItemsandAccessoryInwardItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${ACCESSORT_PURCHASE_INWARD_API}/getPoItemsandAccessoryInwardItems`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["AccessoryPurchaseInward"],
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
      providesTags: ["AccessoryPurchaseInward"],
    }),

    addAccessoryPurchaseInward: builder.mutation({
      query: (payload) => ({
        url: ACCESSORT_PURCHASE_INWARD_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["AccessoryPurchaseInward"],
    }),
    updateAccessoryPurchaseInward: builder.mutation({
      query: ({ id, ...body }) => {
        return {
          url: `${ACCESSORT_PURCHASE_INWARD_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["AccessoryPurchaseInward"],
    }),
    deleteAccessoryPurchaseInward: builder.mutation({
      query: (id) => ({
        url: `${ACCESSORT_PURCHASE_INWARD_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AccessoryPurchaseInward"],
    }),
  }),
});

export const {
  useGetAccessoryPurchaseInwardQuery,
  useGetAccessoryPurchaseInwardByIdQuery,
  useGetPoItemsandAccessoryInwardItemsQuery,
  useGetDirectItemsQuery,
  useGetDirectItemByIdQuery,
  useAddAccessoryPurchaseInwardMutation,
  useUpdateAccessoryPurchaseInwardMutation,
  useDeleteAccessoryPurchaseInwardMutation,
} = AccessoryPurchaseInwardApi;

export default AccessoryPurchaseInwardApi;
