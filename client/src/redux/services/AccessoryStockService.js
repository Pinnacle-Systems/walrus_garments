import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {  ACCESSORY_STOCK_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const stockApi = createApi({
  reducerPath: "accessorystock",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["accessorystock"],
  endpoints: (builder) => ({
    getaccessoryStock: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: ACCESSORY_STOCK_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: ACCESSORY_STOCK_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["accessorystock"],
    }),
    getaccessoryPcsStock: builder.query({
      query: ({ params }) => {
        return {
          url: ACCESSORY_STOCK_API + "/getPcsStock",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["accessorystock"],
    }),
    // getStockById: builder.query({
    //   query: ({ params }) => {
    //     return {
    //       url: `${STOCK_API}/${params.productId || params.salePrice || params.fromOrderId}`,
    //       method: "GET",
    //       headers: {
    //         "Content-type": "application/json; charset=UTF-8",
    //       },
    //       params
    //     };
    //   },
    //   providesTags: ["Stock"],
    // }),
    getaccessoryStockById: builder.query({
      query: ({ params }) => {
        const { productId, fromOrderId, salePrice, ...rest } = params;

        const id = productId || salePrice || fromOrderId;
        return {
          url: `${ACCESSORY_STOCK_API}/${id}`, // path param
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params: rest,
        };
      },
      providesTags: ["accessorystock"],
    }),
    addaccessoryStock: builder.mutation({
      query: (payload) => ({
        url: ACCESSORY_STOCK_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["accessorystock"],
    }),
    updateaccessoryStock: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${ACCESSORY_STOCK_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["accessorystock"],
    }),
    deleteaccessoryStock: builder.mutation({
      query: (id) => ({
        url: `${ACCESSORY_STOCK_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["accessorystock"],
    }),

   
  }),
});

export const {
  useGetaccessoryStockQuery,
  useGetaccessoryStockByIdQuery,
  useAddaccessoryStockMutation,
  useUpdateaccessoryStockMutation,
  useDeleteaccessoryStockMutation,
  useGetPcsaccessoryStockQuery,

} = stockApi;

export default stockApi;
