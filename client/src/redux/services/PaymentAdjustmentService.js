import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PAYMENT_ADJUSTMENT_API } from "../../Api";
const BASE_URL = process.env.REACT_APP_SERVER_URL;

const paymentAdjustmentApi = createApi({
  reducerPath: "paymentAdjustment",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["PaymentAdjustment"],
  endpoints: (builder) => ({
    getPaymentAdjustment: builder.query({
      query: (params) => ({
        url: PAYMENT_ADJUSTMENT_API,
        method: "GET",
        params
      }),
      providesTags: ["PaymentAdjustment"],
    }),
    getPaymentAdjustmentById: builder.query({
      query: (id) => ({
        url: `${PAYMENT_ADJUSTMENT_API}/${id}`,
        method: "GET",
      }),
      providesTags: ["PaymentAdjustment"],
    }),
    addPaymentAdjustment: builder.mutation({
      query: (payload) => ({
        url: PAYMENT_ADJUSTMENT_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["PaymentAdjustment"],
    }),
    updatePaymentAdjustment: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PAYMENT_ADJUSTMENT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["PaymentAdjustment"],
    }),
    deletePaymentAdjustment: builder.mutation({
      query: (id) => ({
        url: `${PAYMENT_ADJUSTMENT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PaymentAdjustment"],
    }),
  }),
});

export const {
  useGetPaymentAdjustmentQuery,
  useGetPaymentAdjustmentByIdQuery,
  useAddPaymentAdjustmentMutation,
  useUpdatePaymentAdjustmentMutation,
  useDeletePaymentAdjustmentMutation,
} = paymentAdjustmentApi;

export default paymentAdjustmentApi;
