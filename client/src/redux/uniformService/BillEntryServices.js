import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BILL_ENTRY_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const billEntryApi = createApi({
  reducerPath: "billEntry",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["BillEntry"],
  endpoints: (builder) => ({
    getBillEntry: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: BILL_ENTRY_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: BILL_ENTRY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["BillEntry"],
    }),
    getBillEntryById: builder.query({
      query: ({id, payOutId, advanceAdjustmentId}) => {
        return {
          url: `${BILL_ENTRY_API}/${id}/${payOutId ? payOutId : null}/${advanceAdjustmentId ? advanceAdjustmentId : null}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["BillEntry"],
    }),
    addBillEntry: builder.mutation({
      query: (payload) => ({
        url: BILL_ENTRY_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["BillEntry"],
    }),
    updateBillEntry: builder.mutation({
      query: ({id, body}) => {
        return {
          url: `${BILL_ENTRY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["BillEntry"],
    }),
    deleteBillEntry: builder.mutation({
      query: (id) => ({
        url: `${BILL_ENTRY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BillEntry"],
    }),
  }),
});

export const {
  useGetBillEntryQuery,
  useGetBillEntryByIdQuery,
  useAddBillEntryMutation,
  useUpdateBillEntryMutation,
  useDeleteBillEntryMutation,
} = billEntryApi;

export default billEntryApi;
