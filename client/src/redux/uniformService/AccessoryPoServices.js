import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {  ACCESSORY_PO_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const AccessoryPoApi = createApi({
  reducerPath: "accessoryPo",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["accessoryPo"],
  endpoints: (builder) => ({
    getAccessoryPo: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: ACCESSORY_PO_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: ACCESSORY_PO_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["accessoryPo"],
    }),
    getAccessoryPoItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${ACCESSORY_PO_API}/getPoItems`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["accessoryPo"],
    }),
    getAccessoryPoItemById: builder.query({
      query: ({ id, purchaseInwardId, stockId, storeId, billEntryId, poType ,poInwardOrDirectInward }) => {
        return {
          url: `${ACCESSORY_PO_API}/getPoItems/${id}/${purchaseInwardId ? purchaseInwardId : null}/${stockId ? stockId : null}/${storeId ? storeId : null}/${billEntryId ? billEntryId : null}/${poType ? poType : null}/${poInwardOrDirectInward ? poInwardOrDirectInward : null}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["accessoryPo"],
    }),
    getAccessoryPoById: builder.query({
      query: (id) => {
        return {
          url: `${ACCESSORY_PO_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["accessoryPo"],
    }),
    addAccessoryPo: builder.mutation({
      query: (payload) => ({
        url: ACCESSORY_PO_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["accessoryPo"],
    }),
    updateAccessoryPo: builder.mutation({
      query: ({ id, ...body }) => {
        return {
          url: `${ACCESSORY_PO_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["accessoryPo"],
    }),
    deleteAccessoryPo: builder.mutation({
      query: (id) => ({
        url: `${ACCESSORY_PO_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["accessoryPo"],
    }),
  }),
});

export const {
  useGetAccessoryPoQuery,
  useGetAccessoryPoByIdQuery,
  useGetAccessoryPoItemsQuery,
  useGetAccessoryPoItemByIdQuery,
  useAddAccessoryPoMutation,
  useUpdateAccessoryPoMutation,
  useDeleteAccessoryPoMutation,
} = AccessoryPoApi;

export default AccessoryPoApi;
