import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { ACCESSORT_STOCK_TRANSFER_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const AccessoryStockTransferApi = createApi({
    reducerPath: "AccessoryStockTransfer",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL
    }),
    tagTypes: ["AccessoryStockTransfer"],
    endpoints: (builder) => ({
        getAccessoryStockTransfer: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: ACCESSORT_STOCK_TRANSFER_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: ACCESSORT_STOCK_TRANSFER_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["AccessoryStockTransfer"],
        }),
        getAccessoryStockTransferItems: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: `${ACCESSORT_STOCK_TRANSFER_API}/orderItems`,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: `${ACCESSORT_STOCK_TRANSFER_API}/orderItems`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["AccessoryStockTransfer"],
        }),
        getAccessoryStockTransferById: builder.query({
            query: (id) => {
                return {
                    url: `${ACCESSORT_STOCK_TRANSFER_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["AccessoryStockTransfer"],
        }),
        getAccessoryStockTransferItemsById: builder.query({
            query: ({ id, prevProcessId, packingCategory, packingType }) => {
                return {
                    url: `${ACCESSORT_STOCK_TRANSFER_API}/getOrderItems/${id}/${prevProcessId ? prevProcessId : null}/${packingCategory ? packingCategory : null}/${packingType ? packingType : null}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["AccessoryStockTransfer"],
        }),
        getAccessoryStockTransferItemsByIdNew: builder.query({
            query: (id) => {
                return {
                    url: `${ACCESSORT_STOCK_TRANSFER_API}/getOrderItemsNew/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["AccessoryStockTransfer"],
        }),
        addAccessoryStockTransfer: builder.mutation({
            query: (payload) => ({
                url: ACCESSORT_STOCK_TRANSFER_API,
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["AccessoryStockTransfer"],
        }),
        updateAccessoryStockTransfer: builder.mutation({
            query: (payload) => {
                const { id, body } = payload;
                return {
                    url: `${ACCESSORT_STOCK_TRANSFER_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["AccessoryStockTransfer"],
        }),
        deleteAccessoryStockTransfer: builder.mutation({
            query: (id) => ({
                url: `${ACCESSORT_STOCK_TRANSFER_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["AccessoryStockTransfer"],
        }),
    }),
});

export const {
    useLazyGetAccessoryStockTransferQuery,
    useGetAccessoryStockTransferQuery,
    useGetAccessoryStockTransferByIdQuery,
    useGetAccessoryStockTransferItemsQuery,
    useGetAccessoryStockTransferItemsByIdQuery,
    useGetAccessoryStockTransferItemsByIdNewQuery,
    useAddAccessoryStockTransferMutation,
    useUpdateAccessoryStockTransferMutation,
    useDeleteAccessoryStockTransferMutation,
} = AccessoryStockTransferApi;

export default AccessoryStockTransferApi;

