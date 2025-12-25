import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ACCESSORY_STOCK_API, STOCK_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const stockApi = createApi({
  reducerPath: "stock",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Stock"],
  endpoints: (builder) => ({
    getStock: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: STOCK_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: STOCK_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Stock"],
    }),
    getPcsStock: builder.query({
      query: ({ params }) => {
        return {
          url: STOCK_API + "/getPcsStock",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Stock"],
    }),
    getStockReport: builder.query({
      query: ({ params }) => {
        return {
          url: STOCK_API + "/getStockReport",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Stock"],
    }),
    getStockById: builder.query({
      query: ({ params }) => {
        const { productId, fromOrderId, salePrice, ...rest } = params;

        const id = productId || salePrice || fromOrderId;
        return {
          url: `${STOCK_API}/${id}`, // path param
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params: rest,
        };
      },
      providesTags: ["Stock"],
    }),
    addStock: builder.mutation({
      query: (payload) => ({
        url: STOCK_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Stock"],
    }),
    updateStock: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${STOCK_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Stock"],
    }),
    deleteStock: builder.mutation({
      query: (id) => ({
        url: `${STOCK_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Stock"],
    }),
  

  }),
});

export const {
  useGetStockQuery,
  useGetStockByIdQuery,
  useAddStockMutation,
  useUpdateStockMutation,
  useDeleteStockMutation,
  useGetPcsStockQuery,
  useLazyGetStockReportQuery,

} = stockApi;

export default stockApi;
