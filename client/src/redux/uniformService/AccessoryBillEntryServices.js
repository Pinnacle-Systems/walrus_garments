import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {  ACCESSORY_BILL_ENTRY_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const accessoryBillEntryApi = createApi({
  reducerPath: "accessoryBillEntry",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["accessoryBillEntry"],
  endpoints: (builder) => ({
    getaccessoryBillEntry: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: ACCESSORY_BILL_ENTRY_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: ACCESSORY_BILL_ENTRY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["accessoryBillEntry"],
    }),
    getaccessoryBillEntryById: builder.query({
      query: ({id, payOutId, advanceAdjustmentId}) => {
        return {
          url: `${ACCESSORY_BILL_ENTRY_API}/${id}/${payOutId ? payOutId : null}/${advanceAdjustmentId ? advanceAdjustmentId : null}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["accessoryBillEntry"],
    }),
    addaccessoryBillEntry: builder.mutation({
      query: (payload) => ({
        url: ACCESSORY_BILL_ENTRY_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["accessoryBillEntry"],
    }),
    updateaccessoryBillEntry: builder.mutation({
      query: ({id, body}) => {
        return {
          url: `${ACCESSORY_BILL_ENTRY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["accessoryBillEntry"],
    }),
    deleteaccessoryBillEntry: builder.mutation({
      query: (id) => ({
        url: `${ACCESSORY_BILL_ENTRY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["accessoryBillEntry"],
    }),
  }),
});

export const {
  useGetaccessoryBillEntryQuery,
  useGetaccessoryBillEntryByIdQuery,
  useAddaccessoryBillEntryMutation,
  useUpdateaccessoryBillEntryMutation,
  useDeleteaccessoryBillEntryMutation,
} = accessoryBillEntryApi;

export default accessoryBillEntryApi;
